enum IntentType {
  Calendar
  Doc
  Mail
  Unknown
}

class ParsedIntent {
  intent IntentType
  summary string @description("one-line human-readable summary of what the user wants")
}

function ParseIntent(input: string) -> ParsedIntent {
  client CustomGPT5Mini
  prompt #"
    You classify user requests for an assistant that can prepare calendar events
    make notes in Google Docs or write emails using GMAIL.

    Request:
    {{ input }}

    Choose Calendar when the user wants to schedule, add, book, or create a
    calendar event.

    Choose Doc when the user wants to create, draft, write, or generate a
    document, note, study guide, summary, outline, or other Google Doc content.

    Choose Mail when the user wants to write, draft, or send an email.

    Choose Unknown when the request is not clearly one of those actions.

    {{ ctx.output_format }}
  "#
}

test CalendarIntent {
  functions [ParseIntent]

  args {
    input "schedule a chemistry review tomorrow at 4pm"
  }
}

test DocIntent {
  functions [ParseIntent]

  args {
    input "create a short note about object oriented programming in Java"
  }
}

test MailIntent {
  functions [ParseIntent]

  args {
    input "create a short email for my Java Programming Professor about my Final Grade"
  }
}

test UnknownIntent {
  functions [ParseIntent]

  args {
    input "what can you help me with?"
  }
}
