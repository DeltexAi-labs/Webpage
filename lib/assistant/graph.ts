import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { fenceUntrusted, inspectForInjection, scrubChunk, INJECTION_REFUSAL } from "@/lib/assistant/guard";
import { retrieveContext, systemPrompt } from "@/lib/assistant/knowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * Hard ceiling on the reply. The prompt asks for at most 180 words (~260 tokens), so 700 is
 * generous headroom — and the provider counts the requested ceiling against the per-minute token
 * budget, so asking for less keeps the assistant available under bursts.
 */
export const MAX_ANSWER_TOKENS = 500;

/** Turns kept verbatim. Enough for a multi-step conversation without unbounded prompt growth. */
export const HISTORY_TURNS = 12;

/**
 * Characters of history sent to the model, oldest dropped first. Every character costs tokens on
 * each request, and the provider throttles per minute — a tight budget keeps the bot responsive.
 */
const HISTORY_CHAR_BUDGET = 2600;

/**
 * Primary answers this well; the fallback is a smaller model with a far larger free daily budget,
 * so an exhausted quota degrades to a slightly plainer answer instead of an error.
 */
export const CHAT_MODELS = [
  process.env.GROQ_CHAT_MODEL?.trim() || "llama-3.3-70b-versatile",
  process.env.GROQ_FALLBACK_MODEL?.trim() || "llama-3.1-8b-instant",
];

const AssistantState = Annotation.Root({
  question: Annotation<string>,
  model: Annotation<string>({
    reducer: (_current, incoming) => incoming,
    default: () => CHAT_MODELS[0],
  }),
  history: Annotation<ChatTurn[]>({
    reducer: (_current, incoming) => incoming,
    default: () => [],
  }),
  context: Annotation<string>({
    reducer: (_current, incoming) => incoming,
    default: () => "",
  }),
  refusal: Annotation<string>({
    reducer: (_current, incoming) => incoming,
    default: () => "",
  }),
});

function createModel(model: string) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  return new ChatGroq({
    apiKey,
    model: model || CHAT_MODELS[0],
    temperature: 0.2,
    maxTokens: MAX_ANSWER_TOKENS,
  });
}

/** Keeps the most recent turns that fit the budget, never splitting a turn in half. */
function trimHistory(history: ChatTurn[]) {
  const kept: ChatTurn[] = [];
  let used = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const turn = history[index];
    if (used + turn.content.length > HISTORY_CHAR_BUDGET) break;
    used += turn.content.length;
    kept.unshift(turn);
  }

  return kept.slice(-HISTORY_TURNS);
}

// Node 1: screen the question before anything else looks at it.
function guard(state: typeof AssistantState.State) {
  const report = inspectForInjection(state.question);
  return report.suspicious ? { refusal: INJECTION_REFUSAL } : { refusal: "" };
}

// Node 2: pull reference material, using recent turns to resolve follow-ups.
function retrieve(state: typeof AssistantState.State) {
  const recent = trimHistory(state.history).map((turn) => turn.content);
  return { context: retrieveContext(state.question, recent) };
}

// Node 3: answer strictly from that material.
async function respond(state: typeof AssistantState.State) {
  const model = createModel(state.model);
  const history = trimHistory(state.history);

  const messages = [
    new SystemMessage(`${systemPrompt()}\n\n${fenceUntrusted(state.context)}`),
    ...history.map((turn) =>
      turn.role === "user" ? new HumanMessage(turn.content) : new AIMessage(turn.content),
    ),
    new HumanMessage(state.question),
  ];

  await model.invoke(messages);
  return {};
}

function afterGuard(state: typeof AssistantState.State) {
  return state.refusal ? END : "retrieve";
}

const workflow = new StateGraph(AssistantState)
  .addNode("guard", guard)
  .addNode("retrieve", retrieve)
  .addNode("respond", respond)
  .addEdge(START, "guard")
  .addConditionalEdges("guard", afterGuard, { [END]: END, retrieve: "retrieve" })
  .addEdge("retrieve", "respond")
  .addEdge("respond", END);

const app = workflow.compile();

/**
 * Yields the answer token by token as the model produces it. streamEvents surfaces the model's
 * own chunks from inside the graph, so the visitor sees text within a few hundred milliseconds
 * instead of waiting for the whole reply.
 */
const RATE_LIMIT_RETRIES = 3;

function isRateLimit(error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  return /rate.?limit|429|too many requests|quota/i.test(detail);
}

/** Groq reports its own cooldown ("Please try again in 830ms"); honour it rather than guessing. */
function retryDelayFrom(error: unknown, attempt: number) {
  const detail = error instanceof Error ? error.message : "";
  const minutes = detail.match(/try again in (\d+)m([\d.]+)s/i);
  const seconds = detail.match(/try again in ([\d.]+)s/i);
  const millis = detail.match(/try again in ([\d.]+)ms/i);

  // Returned uncapped on purpose: the caller uses the size of the wait to decide whether this is a
  // brief per-minute throttle or a daily cap that should trigger a model switch.
  if (minutes) return Number(minutes[1]) * 60_000 + Number(minutes[2]) * 1000;
  if (millis) return Number(millis[1]) + 250;
  if (seconds) return Number(seconds[1]) * 1000 + 250;
  return Math.min(600 * 2 ** attempt, 5000);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function* streamAnswer(question: string, history: ChatTurn[] = []) {
  const screened = inspectForInjection(question);
  if (screened.suspicious) {
    yield INJECTION_REFUSAL;
    return;
  }

  // A throttle is a wait, not a failure. Short per-minute limits are retried on the same model;
  // an exhausted daily budget cannot be waited out, so the next model in the list takes over.
  // Once tokens are on screen a retry would duplicate text, so the error is rethrown instead.
  for (const [index, model] of CHAT_MODELS.entries()) {
    for (let attempt = 0; attempt <= RATE_LIMIT_RETRIES; attempt += 1) {
      let emitted = false;
      try {
        for await (const token of runGraph(screened.clean, history, model)) {
          emitted = true;
          yield token;
        }
        return;
      } catch (error) {
        if (emitted || !isRateLimit(error)) throw error;

        const waitMs = retryDelayFrom(error, attempt);
        const lastModel = index === CHAT_MODELS.length - 1;

        // A cooldown longer than a few seconds means a daily cap; switching models beats waiting.
        if (waitMs > 8000 || attempt === RATE_LIMIT_RETRIES) {
          if (lastModel) throw error;
          console.warn(`Assistant: ${model} is rate limited, falling back to ${CHAT_MODELS[index + 1]}`);
          break;
        }

        await sleep(waitMs);
      }
    }
  }
}

async function* runGraph(question: string, history: ChatTurn[], model: string) {
  const events = app.streamEvents({ question, history, model }, { version: "v2" });

  for await (const event of events) {
    if (event.event !== "on_chat_model_stream") continue;

    const chunk = event.data?.chunk as { content?: unknown } | undefined;
    const text =
      typeof chunk?.content === "string"
        ? chunk.content
        : Array.isArray(chunk?.content)
          ? chunk.content
              .map((part) => (typeof part === "object" && part && "text" in part ? String(part.text) : ""))
              .join("")
          : "";

    // Cheap per-chunk scrub. Must not trim: the spaces inside a token are the spaces between words.
    const safe = scrubChunk(text);
    if (safe) yield safe;
  }
}
