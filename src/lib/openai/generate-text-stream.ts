import OpenAI from "openai";

export default async function* generateTextStream({
  instructions,
  prompt,
}: {
  instructions: string;
  prompt: string;
}) {
  const client = new OpenAI();
  const stream = client.responses.stream({
    input: [
      { content: instructions, role: "developer" },
      { content: prompt, role: "user" },
    ],
    model: "gpt-4o-2024-08-06",
  });

  for await (const event of stream) {
    if (event.type !== "response.output_text.delta") {
      continue;
    }

    yield event.delta;
  }
}
