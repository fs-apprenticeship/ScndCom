class CreateGDocAction {
    title string @description("The title of the document")
    content string @description("The content of the document delivered in a structured markdown format.")
    topics string[] @description("The top 3 main topics of the document")
    learned_profile LearnedProfile
}

class LearnedProfile {
    learning_style string @description("A short summary of the perceived learning style of the user based on the prompt and topics")
    preferred_formats string[] @description("The format preferences of the user")
}

function CreateGDoc(input: string) -> CreateGDocAction {
    client "CustomGPT4o"
    prompt #"
    {{ input }}

    {{ ctx.output_format }}
  "#
}

test new_gdoc {
  functions [CreateGDoc]
  args {
    input #"
    Create a short note about object oriented programming in Java
    "#
  }
}
