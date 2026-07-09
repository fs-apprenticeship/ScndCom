"use client";

import { useState } from "react";

import type { CalendarAction } from "@/baml_client";

import type { CalendarIntentResult } from "../types";

export function useCalendar() {
  const [pendingAction, setPendingAction] = useState<CalendarAction | null>(null);
  const [clarificationNeeded, setClarificationNeeded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  // Parses a natural language transcript into a calendar action via BAML.
  async function parseCalendarIntent(transcript: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/intent", {
        body: JSON.stringify({ transcript }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      const result = data as CalendarIntentResult;

      if (result.status === "pending_confirmation") {
        setPendingAction(result.action);
        setClarificationNeeded(false);
      } else {
        setPendingAction(null);
        setClarificationNeeded(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // Sends the pending action to Google Calendar. Clears state on success.
  async function confirmEvent() {
    if (!pendingAction) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/confirm", {
        body: JSON.stringify({ action: pendingAction }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setPendingAction(null);
      setClarificationNeeded(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // Clears all calendar state.
  function reset() {
    setPendingAction(null);
    setClarificationNeeded(false);
    setLoading(false);
    setError(null);
  }

  return { clarificationNeeded, confirmEvent, error, loading, parseCalendarIntent, pendingAction, reset };
}
