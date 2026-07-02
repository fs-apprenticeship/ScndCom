"use client";

import { useState } from "react";

import type {
  TranscribeVoiceEmailResult,
  VoiceEmailFields,
} from "@/features/gmail/lib/voice-email-schema";

import PushToSpeakButton from "@/app/compose/push-to-speak-button";

type ApiResponse = {
  draft?: {
    id: string;
    message: {
      id: string;
      threadId: string;
    };
  };
  error?: string;
  message?: {
    id: string;
    threadId: string;
  };
};

type ComposeDraftFormProps = {
  defaultTo?: string;
};

export default function ComposeDraftForm({
  defaultTo = "",
}: ComposeDraftFormProps) {
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<null | string>(null);
  const [subject, setSubject] = useState("");
  const [successMessage, setSuccessMessage] = useState<null | string>(null);
  const [to, setTo] = useState(defaultTo);

  function resetSentState() {
    setIsSent(false);
  }

  async function sendEmail({
    body: emailBody,
    subject: emailSubject,
    to: emailTo,
  }: VoiceEmailFields) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSent(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/gmail/send", {
        body: JSON.stringify({
          body: emailBody,
          subject: emailSubject,
          to: emailTo,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Unable to send email.");
        return;
      }

      setIsSent(true);
      setSuccessMessage(`Email sent to ${emailTo}.`);
      setBody("");
      setSubject("");
      setTo("");
    } catch {
      setErrorMessage("Unable to send email. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitDraft() {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/gmail/drafts", {
        body: JSON.stringify({ body, subject, to }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Unable to create draft.");
        return;
      }

      setSuccessMessage(
        `Draft saved to Gmail${payload.draft?.id ? ` (id: ${payload.draft.id})` : ""}.`,
      );
      setBody("");
      setSubject("");
    } catch {
      setErrorMessage("Unable to create draft. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendEmail({ body, subject, to });
  }

  async function handleSaveDraft() {
    await submitDraft();
  }

  function handleVoiceResult({
    fields,
    transcript,
  }: TranscribeVoiceEmailResult) {
    setErrorMessage(null);
    setSuccessMessage(null);
    resetSentState();
    setLastTranscript(transcript);
    setTo(fields.to);
    setSubject(fields.subject);
    setBody(fields.body);
  }

  return (
    <form className="space-y-6" onSubmit={handleSend}>
      <PushToSpeakButton
        disabled={isSubmitting}
        onError={setErrorMessage}
        onResult={handleVoiceResult}
      />

      {lastTranscript ? (
        <div className="space-y-2 rounded-md border bg-muted/30 px-3 py-2">
          <p className="text-sm font-medium">What was heard</p>
          <p className="text-sm text-muted-foreground">{lastTranscript}</p>
          <p className="text-xs text-muted-foreground">
            Compare this with the fields below and edit anything that looks off
            before sending.
          </p>
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="to">
          To
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          id="to"
          name="to"
          onChange={(event) => {
            resetSentState();
            setTo(event.target.value);
          }}
          placeholder="recipient@example.com"
          required
          type="email"
          value={to}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="subject">
          Subject
        </label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          id="subject"
          name="subject"
          onChange={(event) => {
            resetSentState();
            setSubject(event.target.value);
          }}
          placeholder="Meeting reminder"
          required
          type="text"
          value={subject}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="body">
          Message
        </label>
        <textarea
          className="min-h-48 w-full rounded-md border bg-background px-3 py-2 text-sm"
          id="body"
          name="body"
          onChange={(event) => {
            resetSentState();
            setBody(event.target.value);
          }}
          placeholder="Write your draft email..."
          required
          value={body}
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-green-700" role="status">
          {successMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex items-center justify-center rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-60"
          disabled={isSubmitting || isSent}
          type="submit"
        >
          {isSent ? "Sent" : isSubmitting ? "Sending..." : "Send email"}
        </button>

        <button
          className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleSaveDraft}
          type="button"
        >
          Save draft
        </button>
      </div>
    </form>
  );
}
