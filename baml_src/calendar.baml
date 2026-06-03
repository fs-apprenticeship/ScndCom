class CalendarPayload {
  title string
  start string @description("ISO 8601 format, e.g. 2026-05-29T14:00:00")
  end string @description("ISO 8601 format, e.g. 2026-05-29T15:30:00")
  description string @description("AI-generated summary of the event purpose")
  location string? @description("optional, only if mentioned by the user")
}

class CalendarAction {
  action string @description("always 'calendar'")
  summary string @description("one-line human-readable description of the action for the confirmation screen")
  payload CalendarPayload
}

function ParseCalendarIntent(transcript: string, userContext: string) -> CalendarAction {
  client CustomGPT5Mini
  prompt #"
    You are an assistant that parses voice transcripts into structured calendar actions.

    User learning context:
    {{ userContext }}

    Transcript:
    {{ transcript }}

    Extract the calendar event details. If a field cannot be confidently determined
    from the transcript, make a reasonable inference. If the time is ambiguous,
    do not guess — set start and end to empty strings so the system can request
    clarification.

    {{ ctx.output_format }}
  "#
}