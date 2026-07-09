import type { CalendarAction } from "@/baml_client";

export type CalendarIntentResult =
  | { action: CalendarAction; status: "pending_confirmation"; }
  | { status: "clarification_needed"; summary: string };
