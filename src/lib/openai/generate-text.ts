import OpenAI from "openai";

export default async function generateText({
  instructions,
  prompt,
}: {
  instructions: string;
  prompt: string;
}) {
  const client = new OpenAI();
  const response = await client.responses.create({
    input: [
      { content: instructions, role: "developer" },
      { content: prompt, role: "user" },
    ],
    model: "gpt-4o-2024-08-06",
  });

  return response.output_text;
}
