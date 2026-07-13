// each "test" block gives baml a named scenario to run.
// the name appears in the test output so you can identify which case failed.

test ClearCalendarRequest {
  // "functions" tells baml which function this test is for
  functions [ParseCalendarIntent]

  args {
    // this simulates what the speech-to-text layer sends to the AI
    transcript "schedule a linear algebra review for tomorrow at 2pm for 90 minutes"

    // this simulates the user profile your persistence layer will eventually provide.
    // in phase 1 you can hardcode a simple string here.
    userContext "visual learner, prefers concise bullet-point summaries"
  }
}

test AmbiguousTime {
  functions [ParseCalendarIntent]

  args {
    transcript "set up a study session for thermodynamics soon"
    userContext "prefers longer review sessions in the evening"
  }
  // this test is valuable because "soon" is ambiguous.
  // you want to verify that the AI returns empty strings for start and end
  // rather than guessing a time, which would trigger your clarification flow.
}

test WithLocation {
  functions [ParseCalendarIntent]

  args {
    transcript "book the library study room for my biology exam prep on friday at 10am for two hours"
    userContext ""
  }
  // verifies that the location field is populated when the user mentions one
}

test NoLocation {
  functions [ParseCalendarIntent]

  args {
    transcript "add a chemistry review to my calendar for thursday at 4pm for one hour"
    userContext ""
  }
  // verifies that location comes back as null when not mentioned,
  // not as an empty string or a hallucinated value
}