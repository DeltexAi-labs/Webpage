"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { ArrowIcon } from "@/components/arrow-icon";
import { Spinner } from "@/components/spinner";

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What does a website cost?",
  "How long does an app take?",
  "Can you build an AI assistant?",
];

const GREETING =
  "Ask me about our services, timelines, or price ranges. For a firm quote, the contact form is the fastest route.";

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Release the microphone if the component unmounts mid-recording.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    const history = turns.slice(-6);
    setTurns((previous) => [...previous, { role: "user", content: trimmed }]);
    setInput("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history }),
      });
      const result = (await response.json()) as { answer?: string; message?: string };

      if (!response.ok || !result.answer) {
        throw new Error(result.message || "The assistant could not answer that.");
      }

      setTurns((previous) => [...previous, { role: "assistant", content: result.answer as string }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }

    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);

        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (blob.size < 1200) {
          setError("That was too short to transcribe.");
          return;
        }

        setBusy(true);
        try {
          const form = new FormData();
          form.append("audio", blob, "question.webm");
          const response = await fetch("/api/assistant/voice", { method: "POST", body: form });
          const result = (await response.json()) as { text?: string; message?: string };

          if (!response.ok || !result.text) {
            throw new Error(result.message || "That recording could not be transcribed.");
          }

          setBusy(false);
          await ask(result.text);
        } catch (caught) {
          setBusy(false);
          setError(caught instanceof Error ? caught.message : "Transcription failed.");
        }
      };

      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access was blocked. Type your question instead.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="assistant" data-open={open || undefined}>
      {open ? (
        <section className="assistant-panel" aria-label="Ask Deltech & Big Technologies">
          <header className="assistant-head">
            <div>
              <p className="assistant-eyebrow">
                <span className="status-dot" /> Assistant
              </p>
              <strong>Ask about services and pricing</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="m3.5 3.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="assistant-log" ref={logRef}>
            <p className="assistant-greeting">{GREETING}</p>

            {turns.map((turn, index) => (
              <p className={`assistant-turn assistant-${turn.role}`} key={`${turn.role}-${index}`}>
                {turn.content}
              </p>
            ))}

            {busy ? (
              <p className="assistant-turn assistant-assistant assistant-pending">
                <Spinner size={14} label="Thinking" /> Thinking…
              </p>
            ) : null}

            {error ? <p className="assistant-error">{error}</p> : null}

            {turns.length === 0 && !busy ? (
              <div className="assistant-suggestions">
                {SUGGESTIONS.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => void ask(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form className="assistant-input" onSubmit={handleSubmit}>
            <button
              type="button"
              className="assistant-mic"
              onClick={() => void toggleRecording()}
              disabled={busy && !recording}
              data-recording={recording || undefined}
              aria-label={recording ? "Stop recording and send" : "Ask by voice"}
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="7.4" y="2.4" width="5.2" height="9.2" rx="2.6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4.6 9.4a5.4 5.4 0 0 0 10.8 0M10 14.8v2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={recording ? "Recording… tap the mic to send" : "Ask a question"}
              maxLength={700}
              disabled={busy || recording}
              aria-label="Your question"
            />
            <button type="submit" className="assistant-send" disabled={busy || recording || !input.trim()} aria-label="Send question">
              <ArrowIcon />
            </button>
          </form>

          <p className="assistant-footnote">
            Answers are indicative. Prices are confirmed in writing after a discovery call.
          </p>
        </section>
      ) : null}

      <button
        type="button"
        className="assistant-launcher"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 6.2A2.2 2.2 0 0 1 5.2 4h9.6A2.2 2.2 0 0 1 17 6.2v6a2.2 2.2 0 0 1-2.2 2.2H8.4L4.6 17v-2.6h-.4A1.2 1.2 0 0 1 3 13.2V6.2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span>Ask us</span>
          </>
        )}
      </button>
    </div>
  );
}
