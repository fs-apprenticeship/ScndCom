import type { CalendarAction } from "@/baml_client";

export type CalendarConfirmResult = {
  event: {
    htmlLink?: string;
    id?: string;
    summary?: string;
  };
  status: "success";
};

export type CalendarIntentResult =
  | { action: CalendarAction; status: "pending_confirmation" }
  | { status: "clarification_needed"; summary: string };
