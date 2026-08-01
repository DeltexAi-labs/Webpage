"use client";

import { useEffect } from "react";

export type ToastData = {
  id: number;
  tone: "success" | "error";
  title: string;
  message: string;
};

type ToastProps = {
  toast: ToastData | null;
  onDismiss: () => void;
  duration?: number;
};

export function Toast({ toast, onDismiss, duration = 7000 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [toast, duration, onDismiss]);

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toast ? (
        <div className={`toast toast-${toast.tone}`} key={toast.id} role="status">
          <span className="toast-icon" aria-hidden="true">
            {toast.tone === "success" ? (
              <svg viewBox="0 0 20 20" fill="none">
                <path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 5.5v5.2M10 14.3h.01" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <div className="toast-body">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button className="toast-close" onClick={onDismiss} type="button" aria-label="Dismiss notification">
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="m3.5 3.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
          <span className="toast-progress" style={{ animationDuration: `${duration}ms` }} aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
