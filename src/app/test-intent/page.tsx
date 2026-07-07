"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

import ThemeToggle from "@/app/_components/theme-toggle";

type DocResult = {
  documentId: string;
  url: string;
  doc: {
    title: string;
    content: string;
    topics: string[];
    learned_profile: { learning_style: string; preferred_formats: string[] };
  };
};

export default function TestIntentPage() {
  const { isSignedIn } = useUser();
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [doc, setDoc] = useState<DocResult | null>(null);
  const [pendingCalendarAction, setPendingCalendarAction] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [calendarClarification, setCalendarClarification] = useState(false);

  function addLog(entry: string) {
    setLog((prev) => [
      `${new Date().toLocaleTimeString()} — ${entry}`,
      ...prev,
    ]);
  }

  /**
   * Parses the user's spoken input to determine intent and triggers appropriate actions.
   *
   * This function sends the transcript to the backend API endpoint `/api/intent` to analyze
   * the user's request. Based on the response, it updates the UI state to either:
   * - Create a new document (if a documentId is returned)
   * - Schedule a calendar event (if an action is returned)
   * - Request clarification for a calendar action (if clarification is needed)
   * - Log any other response or error
   *
   * It handles loading states, clears previous results, and logs all actions for debugging.
   */
  async function parseIntent() {
    if (!transcript.trim()) return;
    setLoading(true);
    setDoc(null);
    setPendingCalendarAction(null);
    setCalendarClarification(false);
    try {
      const res = await fetch("/api/intent", {
        body: JSON.stringify({ input: transcript }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);

      if (data.documentId) {
        setDoc(data as DocResult);
        addLog(`doc created: ${data.url}`);
      } else if (data.action) {
        setPendingCalendarAction(data.action);
        addLog(`calendar pending: ${data.action.summary}`);
      } else if (data.status === "clarification_needed") {
        setPendingCalendarAction({ summary: data.summary });
        setCalendarClarification(true);
        addLog(`calendar clarification needed: ${data.summary}`);
      } else {
        addLog(`response: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Confirms a pending calendar action by sending it to the backend.
   *
   * This function is called when the user confirms a calendar event that was
   * previously requested for clarification. It sends the pending action data
   * to the `/api/calendar/confirm` endpoint and updates the UI state upon
   * successful confirmation or error handling.
   */
  async function confirmEvent() {
    if (!pendingCalendarAction) return;
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/confirm", {
        body: JSON.stringify({ action: pendingCalendarAction }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      addLog(`confirmed: ${JSON.stringify(data)}`);
      setPendingCalendarAction(null);
      setCalendarClarification(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setTranscript("");
    setDoc(null);
    setPendingCalendarAction(null);
    setCalendarClarification(false);
    setLog([]);
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
                onClick={parseIntent}
              >
                {loading ? "..." : "Parse Intent"}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium disabled:opacity-40"
                disabled={loading || !pendingCalendarAction}
                onClick={confirmEvent}
              >
                {loading ? "..." : "Confirm Event"}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium"
                onClick={clear}
              >
                Clear
              </button>
            </div>

            {doc && (
              <div className="w-full rounded-md border p-4 space-y-2 text-sm text-foreground">
                <p className="font-semibold">{doc.doc.title}</p>
                <a
                  className="text-blue-500 underline block"
                  href={doc.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in Google Docs
                </a>
                <p className="text-muted-foreground text-xs">
                  Topics: {doc.doc.topics.join(", ")}
                </p>
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Learned profile
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {JSON.stringify(doc.doc.learned_profile, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {pendingCalendarAction && (
              <div className="w-full rounded-md border p-4 space-y-2 text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Calendar event pending</p>
                  {calendarClarification && (
                    <span className="text-xs text-muted-foreground">
                      — time unclear
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {(pendingCalendarAction as { summary?: string }).summary}
                </p>
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(pendingCalendarAction, null, 2)}
                </pre>
              </div>
            )}

            {log.length > 0 && (
              <div className="w-full rounded-md border p-4 text-xs font-mono space-y-1 text-foreground">
                {log.map((entry, i) => (
                  <div key={i}>{entry}</div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
