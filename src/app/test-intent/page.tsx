"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

import ThemeToggle from "@/app/_components/theme-toggle";
import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { useDoc } from "@/features/doc/hooks/use-doc";
import { parseIntent, IntentType } from "@/lib/intent/parse-intent";

export default function TestIntentPage() {
  const { isSignedIn } = useUser();
  const [transcript, setTranscript] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<{
    intent: string;
    summary: string;
  } | null>(null);

  const calendar = useCalendar();
  const doc = useDoc();

  const loading = classifying || calendar.loading || doc.loading;

  // Classifies the transcript and delegates to the appropriate feature.
  // To add Gmail: import useMail and add a Mail branch below calling the appropriate hook function.
  async function handleConfirm() {
    if (!transcript.trim()) return;
    setClassifying(true);
    try {
      const { intent, summary } = await parseIntent(transcript);
      setDetectedIntent({ intent, summary });
      switch (intent) {
        case IntentType.Doc:
          await doc.createDoc(transcript);
          break;
        case IntentType.Calendar:
          await calendar.parseCalendarIntent(transcript);
          break;
        case IntentType.Mail:
          // Gmail: import useMail and add a Mail case calling the appropriate hook function.
          break;
      }
    } finally {
      setClassifying(false);
    }
  }

  function clear() {
    setTranscript("");
    setShowConfirmation(false);
    setDetectedIntent(null);
    doc.reset();
    calendar.reset();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold text-foreground" href="/">
            Home
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <Link
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
                  href="/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </header>

        {detectedIntent && (
          <div className="w-full rounded-md border p-4 space-y-1 text-sm text-foreground">
            <p className="font-semibold">Detected intent</p>
            <p className="text-muted-foreground">
              {detectedIntent.intent} — {detectedIntent.summary}
            </p>
          </div>
        )}

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <textarea
              className="w-full rounded-md border bg-background px-4 py-3 text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground"
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g. create a study guide on photosynthesis or schedule a review tomorrow at 2pm"
              rows={3}
              value={transcript}
            />

            <div className="flex flex-col gap-3 w-full">
              <button
                className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium disabled:opacity-40"
                disabled={loading || !transcript.trim()}
                onClick={() => setShowConfirmation(true)}
              >
                Submit Transcript
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium"
                onClick={clear}
              >
                Clear
              </button>
            </div>

            {showConfirmation && (
              <div className="w-full rounded-md border p-4 space-y-3 text-sm text-foreground">
                <p className="font-semibold">Confirm transcript</p>
                <p className="text-muted-foreground">{transcript}</p>
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-40"
                    disabled={loading}
                    onClick={() => {
                      setShowConfirmation(false);
                      handleConfirm();
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            {(doc.error ?? calendar.error) && (
              <div className="w-full rounded-md border border-red-300 p-4 text-sm text-red-600">
                {doc.error ?? calendar.error}
              </div>
            )}

            {doc.doc && (
              <div className="w-full rounded-md border p-4 space-y-2 text-sm text-foreground">
                <p className="font-semibold">{doc.doc.content.title}</p>
                <a
                  className="text-blue-500 underline block"
                  href={doc.doc.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in Google Docs
                </a>
                <p className="text-muted-foreground text-xs">
                  Topics: {doc.doc.content.topics.join(", ")}
                </p>
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Learned profile
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {JSON.stringify(doc.doc.content.learned_profile, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {calendar.pendingAction && (
              <div className="w-full rounded-md border p-4 space-y-3 text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Calendar event pending</p>
                  {calendar.clarificationNeeded && (
                    <span className="text-xs text-muted-foreground">
                      — time unclear
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {calendar.pendingAction.summary}
                </p>
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(calendar.pendingAction, null, 2)}
                </pre>
                <div className="flex gap-2">
                  <button
                    className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-40"
                    disabled={loading}
                    onClick={calendar.confirmEvent}
                  >
                    {loading ? "..." : "Confirm Event"}
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
                    onClick={calendar.reset}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
