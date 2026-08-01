"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";

import { ArrowIcon } from "@/components/arrow-icon";
import { Toast, type ToastData } from "@/components/toast";

type SubmissionState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [feedback, setFeedback] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastId = useRef(0);

  const dismissToast = useCallback(() => setToast(null), []);

  function showToast(tone: ToastData["tone"], title: string, message: string) {
    toastId.current += 1;
    setToast({ id: toastId.current, tone, title, message });
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmissionState("sending");
    setFeedback("");
    setToast(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "We could not send your message. Please email us directly.");
      }

      form.reset();
      setSubmissionState("success");
      const message = result.message || "Thanks—your project enquiry has been sent to Deltech.";
      setFeedback(message);
      showToast("success", "Enquiry sent", "A confirmation is on its way to your inbox. We reply within one working day.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not send your message.";
      setSubmissionState("error");
      setFeedback(message);
      showToast("error", "Message not sent", message);
    }
  }

  return (
    <>
    <Toast toast={toast} onDismiss={dismissToast} />
    <form className="contact-form" onSubmit={submitForm}>
      <div className="form-heading">
        <span>Project enquiry</span>
        <p>Tell us enough to identify the right next step.</p>
      </div>

      <div className="form-grid">
        <label>
          <span>Your name</span>
          <input autoComplete="name" maxLength={80} name="name" placeholder="Jane Doe" required />
        </label>
        <label>
          <span>Work email</span>
          <input autoComplete="email" maxLength={160} name="email" placeholder="jane@company.com" required type="email" />
        </label>
        <label>
          <span>Phone <i>optional</i></span>
          <input autoComplete="tel" maxLength={30} name="phone" placeholder="Your preferred number" type="tel" />
        </label>
        <label>
          <span>What do you need?</span>
          <select defaultValue="" name="service" required>
            <option disabled value="">Select a service</option>
            <option>Technology consultation</option>
            <option>Website or web platform</option>
            <option>Mobile or desktop application</option>
            <option>AI system or automation</option>
            <option>Cloud or backend engineering</option>
            <option>Product or interface design</option>
            <option>Not sure yet</option>
          </select>
        </label>
        <label className="form-message">
          <span>Tell us about the project</span>
          <textarea
            maxLength={4000}
            name="message"
            placeholder="What should this solve, who is it for, and when would you like to start?"
            required
            rows={6}
          />
        </label>
      </div>

      <label className="form-honeypot" aria-hidden="true">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>

      <div className="form-submit-row">
        <button className="button button-contact" disabled={submissionState === "sending"} type="submit">
          {submissionState === "sending" ? "Sending…" : "Send project enquiry"}
          {submissionState === "sending" ? null : <ArrowIcon />}
        </button>
        <p className="form-privacy">
          Your details are used only to respond to this enquiry. See our{" "}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </div>

      <p className={`form-feedback ${submissionState}`} aria-live="polite" role="status">
        {feedback}
      </p>
    </form>
    </>
  );
}
