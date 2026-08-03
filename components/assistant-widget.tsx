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

/** Characters revealed per animation frame. Fast enough to keep up, slow enough to read as typing. */
const REVEAL_RATE = 3;

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streamed, setStreamed] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");

  const logRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef("");
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns, streamed, waiting]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Network chunks arrive in bursts; draining a buffer on each frame turns them into even typing.
  function startReveal() {
    if (frameRef.current !== null) return;

    const tick = () => {
      if (pendingRef.current.length === 0) {
        frameRef.current = null;
        return;
      }

      const slice = pendingRef.current.slice(0, REVEAL_RATE);
      pendingRef.current = pendingRef.current.slice(slice.length);
      setStreamed((previous) => previous + slice);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }

  function flushReveal() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    const remaining = pendingRef.current;
    pendingRef.current = "";
    return remaining;
  }

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    const history = turns.slice(-6);
    setTurns((previous) => [...previous, { role: "user", content: trimmed }]);
    setInput("");
    setError("");
    setBusy(true);
    setWaiting(true);
    setStreamed("");
    pendingRef.current = "";

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history }),
      });

      if (!response.ok || !response.body) {
        const result = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(result.message || "The assistant could not answer that.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        full += chunk;
        setWaiting(false);
        pendingRef.current += chunk;
        startReveal();
      }

      // Show anything still queued immediately, then commit the finished turn.
      flushReveal();
      setStreamed("");
      setTurns((previous) => [...previous, { role: "assistant", content: full.trim() }]);
    } catch (caught) {
      flushReveal();
      setStreamed("");
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setWaiting(false);
      setBusy(false);
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

            {streamed ? (
              <p className="assistant-turn assistant-assistant" aria-live="polite">
                {streamed}
                <span className="assistant-caret" aria-hidden="true" />
              </p>
            ) : null}

            {waiting ? (
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
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question"
              maxLength={700}
              disabled={busy}
              aria-label="Your question"
            />
            <button type="submit" className="assistant-send" disabled={busy || !input.trim()} aria-label="Send question">
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
