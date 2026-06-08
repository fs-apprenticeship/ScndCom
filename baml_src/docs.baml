class CreateDocAction {
    title string @description("The title of the document")
    content string @description("The content of the document delivered in a structured markdown format.")
    topic string @description("The topic of the document")
    learned_profile LearnedProfile
}

class LearnedProfile {
    learning_style string @description("The learning style of the user based on the prompt")
    preferred_formats string[] @description("The format preferences of the user")
}

function CreateDoc(input: string) -> CreateDocAction {
    client "CustomGPT4o"
    prompt #"
    {{ input }}

    {{ ctx.output_format }}
  "#
}

test new_doc {
  functions [CreateDoc]
  args {
    input #"
    Create a short note about object oriented programming in Java
    "#
  }
}
