import { NextRequest, NextResponse } from "next/server";

import { streamAnswer, type ChatTurn } from "@/lib/assistant/graph";
import { sanitizeUntrusted } from "@/lib/assistant/guard";
import { siteConfig } from "@/lib/site";
import { clientIpFrom } from "@/lib/shield";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Room for a full brief. The message is preserved whole rather than cut into fragments. */
const MAX_QUESTION_LENGTH = 4000;
const MAX_HISTORY_TURNS = 12;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 25;

// Model calls cost money per request, so the assistant gets a tighter budget than page views.
const usage = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(identifier: string) {
  const now = Date.now();
  const existing = usage.get(identifier);

  if (!existing || existing.resetAt <= now) {
    usage.set(identifier, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > RATE_LIMIT;
}

function cleanTurn(value: unknown): string {
  if (typeof value !== "string") return "";
  // sanitizeUntrusted keeps newlines and tabs, so a multi-paragraph brief arrives intact.
  return sanitizeUntrusted(value);
}

export async function POST(request: NextRequest) {
  if (isRateLimited(clientIpFrom(request.headers))) {
    return NextResponse.json(
      { message: "That is a lot of questions in a short time. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let payload: { question?: unknown; history?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const question = cleanTurn(payload.question).slice(0, MAX_QUESTION_LENGTH);
  if (!question) {
    return NextResponse.json({ message: "Ask a question first." }, { status: 400 });
  }

  const history: ChatTurn[] = Array.isArray(payload.history)
    ? payload.history
        .slice(-MAX_HISTORY_TURNS)
        .map((turn) => {
          const item = turn as { role?: unknown; content?: unknown };
          const role: ChatTurn["role"] = item.role === "assistant" ? "assistant" : "user";
          return { role, content: cleanTurn(item.content).slice(0, MAX_QUESTION_LENGTH) };
        })
        .filter((turn) => turn.content.length > 0)
    : [];

  if (!process.env.GROQ_API_KEY?.trim()) {
    console.error("Assistant unavailable: GROQ_API_KEY missing in this environment.");
    return NextResponse.json(
      { message: "The assistant is not configured yet. Please use the contact form and we will reply." },
      { status: 503 },
    );
  }

  const encoder = new TextEncoder();
  let started = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const token of streamAnswer(question, history)) {
          started = true;
          controller.enqueue(encoder.encode(token));
        }
      } catch (error) {
        console.error("Assistant request failed", error);

        // Every model in the chain is exhausted, or something else broke. Either way the visitor
        // gets a route to a person rather than an apology.
        const detail = error instanceof Error ? error.message : "";
        const quotaSpent = /rate.?limit|429|too many requests|quota/i.test(detail);

        // Once bytes are on the wire the status is already 200, so the notice goes in the body.
        controller.enqueue(
          encoder.encode(
            started
              ? `\n\n— I lost the rest of that answer. Ask again, or email ${siteConfig.contactEmail} and the team will pick it up.`
              : quotaSpent
                ? `I have hit my usage limit for today, so I cannot answer this one. The team can help directly: use the contact form at ${siteConfig.siteUrl}/#contact or email ${siteConfig.contactEmail}, and you will get a reply within one working day.`
                : `Something went wrong on my side, so I could not answer that. Try once more, or reach the team at ${siteConfig.contactEmail} and they will help.`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      // Stops intermediary buffering from defeating the streaming.
      "X-Accel-Buffering": "no",
    },
  });
}
