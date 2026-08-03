import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

import { clientIpFrom } from "@/lib/shield";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 20;

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

export async function POST(request: NextRequest) {
  if (isRateLimited(clientIpFrom(request.headers))) {
    return NextResponse.json({ message: "Too many recordings. Please wait a few minutes." }, { status: 429 });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    console.error("Voice input unavailable: GROQ_API_KEY missing in this environment.");
    return NextResponse.json({ message: "Voice input is not configured yet." }, { status: 503 });
  }

  let audio: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("audio");
    if (value instanceof File) audio = value;
  } catch {
    return NextResponse.json({ message: "Invalid upload." }, { status: 400 });
  }

  if (!audio || audio.size === 0) {
    return NextResponse.json({ message: "No audio was received." }, { status: 400 });
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ message: "That recording is too long. Keep it under a minute." }, { status: 413 });
  }

  try {
    const groq = new Groq({ apiKey });
    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: process.env.GROQ_WHISPER_MODEL?.trim() || "whisper-large-v3-turbo",
      language: "en",
      temperature: 0,
      response_format: "json",
    });

    const text = transcription.text?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ message: "Nothing was picked up. Try recording again." }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Transcription failed", error);
    return NextResponse.json({ message: "That recording could not be transcribed." }, { status: 502 });
  }
}
