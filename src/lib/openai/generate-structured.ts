import type { ZodType } from "zod";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

export default async function generateStructured<T>({
  instructions,
  prompt,
  schema,
}: {
  instructions: string;
  prompt: string;
  schema: ZodType<T>;
}): Promise<T> {
  const client = new OpenAI();

  const response = await client.responses.parse({
    input: [
      { content: instructions, role: "developer" },
      { content: prompt, role: "user" },
    ],
    model: "gpt-4o-2024-08-06",
    text: { format: zodTextFormat(schema, "data") },
  });

  const data = response.output_parsed;

  if (data === null) {
    throw new Error("[OpenAI] unexpected response");
  }

  return data;
}
