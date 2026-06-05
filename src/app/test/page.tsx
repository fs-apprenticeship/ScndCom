"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

import ThemeToggle from "@/app/_components/theme-toggle";

export default function TestPage() {
  const { isSignedIn } = useUser();
  const [transcript, setTranscript] = useState("");
  const [pendingAction, setPendingAction] = useState<null | Record<
    string,
    unknown
  >>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  function addLog(entry: string) {
    setLog((prev) => [
      `${new Date().toLocaleTimeString()} — ${entry}`,
      ...prev,
    ]);
  }

  async function parseIntent() {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/intent", {
        body: JSON.stringify({ transcript }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setPendingAction(data.action ?? null);
      addLog(`intent: ${JSON.stringify(data)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function confirmEvent() {
    if (!pendingAction) return;
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/confirm", {
        body: JSON.stringify({ action: pendingAction }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      addLog(`confirmed: ${JSON.stringify(data)}`);
      setPendingAction(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setTranscript("");
    setPendingAction(null);
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
              placeholder="e.g. schedule a linear algebra review for tomorrow at 2pm for 90 minutes"
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
                disabled={loading || !pendingAction}
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
