import type { CalendarAction } from "@/baml_client";

export type CalendarIntentResult =
  | { status: "pending_confirmation"; action: CalendarAction }
  | { status: "clarification_needed"; summary: string };
