"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { ArrowIcon } from "@/components/arrow-icon";
import { RichText } from "@/components/rich-text";

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What services do you offer?",
  "How do you run a project?",
  "Can you build an AI assistant?",
];

const GREETING = "I'm Cipher. Ask me about our services, timelines, or how we work.";

/** Characters revealed per animation frame. Fast enough to keep up, slow enough to read as typing. */
const REVEAL_RATE = 3;

/** Matches the server limit, so a long brief is never silently cut in the browser. */
const MAX_INPUT_LENGTH = 4000;

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
  const abortRef = useRef<AbortController | null>(null);
  // Auto-scroll only while the reader is already at the bottom, so scrolling back to re-read an
  // earlier answer is not yanked away by the incoming stream.
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    const log = logRef.current;
    if (!log || !stickToBottomRef.current) return;
    log.scrollTop = log.scrollHeight;
  }, [turns, streamed, waiting]);

  function handleScroll() {
    const log = logRef.current;
    if (!log) return;
    const distanceFromBottom = log.scrollHeight - log.scrollTop - log.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 40;
  }

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
  // The rate scales with the backlog so a fast model never leaves the text trailing behind.
  function startReveal() {
    if (frameRef.current !== null) return;

    const tick = () => {
      const pending = pendingRef.current;
      if (pending.length === 0) {
        frameRef.current = null;
        return;
      }

      const rate = Math.max(REVEAL_RATE, Math.ceil(pending.length / 14));
      const slice = pending.slice(0, rate);
      pendingRef.current = pending.slice(slice.length);
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

    const history = turns.slice(-12);
    const controller = new AbortController();
    abortRef.current = controller;

    setTurns((previous) => [...previous, { role: "user", content: trimmed }]);
    setInput("");
    setError("");
    setBusy(true);
    setWaiting(true);
    setStreamed("");
    pendingRef.current = "";
    stickToBottomRef.current = true;

    let full = "";

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const result = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(result.message || "The assistant could not answer that.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

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

      // Commit in one update: the streaming bubble is replaced by the finished turn in the same
      // render, so the text never disappears for a frame or shifts position.
      flushReveal();
      setStreamed("");
      setTurns((previous) => [...previous, { role: "assistant", content: full.trim() }]);
    } catch (caught) {
      flushReveal();
      setStreamed("");

      // A deliberate stop keeps whatever was generated; a real failure shows the error instead.
      if (caught instanceof DOMException && caught.name === "AbortError") {
        if (full.trim()) {
          setTurns((previous) => [...previous, { role: "assistant", content: full.trim() }]);
        }
      } else {
        setError(caught instanceof Error ? caught.message : "Something went wrong.");
      }
    } finally {
      abortRef.current = null;
      setWaiting(false);
      setBusy(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="assistant" data-open={open || undefined}>
      {open ? (
        <section className="assistant-panel" aria-label="Chat with Cipher">
          <header className="assistant-head">
            <div>
              <p className="assistant-eyebrow">
                <span className="status-dot" /> Online
              </p>
              <strong>Chat with Cipher</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="m3.5 3.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="assistant-log" ref={logRef} onScroll={handleScroll}>
            <p className="assistant-greeting">{GREETING}</p>

            {turns.map((turn, index) => (
              <div className={`assistant-turn assistant-${turn.role}`} key={`${turn.role}-${index}`}>
                {turn.role === "assistant" ? <RichText text={turn.content} /> : <p>{turn.content}</p>}
              </div>
            ))}

            {/* One bubble for both states: thinking becomes text in place, with no second element
                appearing or disappearing, so nothing jumps between the two phases. */}
            {busy || streamed ? (
              <div className="assistant-turn assistant-assistant" aria-live="polite" aria-busy={waiting}>
                {streamed ? (
                  <>
                    <RichText text={streamed} />
                    <span className="assistant-caret" aria-hidden="true" />
                  </>
                ) : (
                  <p className="assistant-thinking">
                    <span aria-hidden="true">Thinking</span>
                    <span className="assistant-sr">Cipher is thinking</span>
                  </p>
                )}
              </div>
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
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                // Enter sends, Shift+Enter starts a new line — a long brief stays one message.
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void ask(input);
                }
              }}
              placeholder="Ask a question — Shift+Enter for a new line"
              maxLength={MAX_INPUT_LENGTH}
              rows={1}
              disabled={busy}
              aria-label="Your question"
            />
            {busy ? (
              <button type="button" className="assistant-send assistant-stop" onClick={stop} aria-label="Stop generating">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="4.5" y="4.5" width="7" height="7" rx="1.6" fill="currentColor" />
                </svg>
              </button>
            ) : (
              <button type="submit" className="assistant-send" disabled={!input.trim()} aria-label="Send question">
                <ArrowIcon />
              </button>
            )}
          </form>

          <p className="assistant-footnote">
            Cipher answers from this site&rsquo;s own material. Anything firm is confirmed in writing.
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
