import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import generate from "./generate-structured";

const { OpenAIMock, parseMock } = vi.hoisted(() => {
  const parseMock = vi.fn();
  const OpenAIMock = vi.fn(
    class {
      responses = { parse: parseMock };
    },
  );

  return { OpenAIMock, parseMock };
});

vi.mock("openai", () => ({
  default: OpenAIMock,
}));

describe("generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed data when the response is valid", async () => {
    const schema = z.object({ greeting: z.string() });
    parseMock.mockResolvedValueOnce({
      output_parsed: { greeting: "hello world" },
    });

    const result = await generate({
      instructions: "Be helpful",
      prompt: "Say hello",
      schema,
    });

    expect(result).toEqual({ greeting: "hello world" });
  });

  it("calls the OpenAI library appropriately", async () => {
    const schema = z.object({ greeting: z.string() });
    parseMock.mockResolvedValueOnce({
      output_parsed: { greeting: "hello world" },
    });

    await generate({
      instructions: "Be helpful",
      prompt: "Say hello",
      schema,
    });

    expect(parseMock).toHaveBeenCalledWith({
      input: [
        { content: "Be helpful", role: "developer" },
        { content: "Say hello", role: "user" },
      ],
      model: "gpt-4o-2024-08-06",
      temperature: undefined,
      text: {
        format: {
          name: "data",
          schema: {
            $schema: "http://json-schema.org/draft-07/schema#",
            additionalProperties: false,
            properties: {
              greeting: {
                type: "string",
              },
            },
            required: ["greeting"],
            type: "object",
          },
          strict: true,
          type: "json_schema",
        },
      },
    });
  });

  it("throws an error when output_parsed is null", async () => {
    const schema = z.object({ greeting: z.string() });
    parseMock.mockResolvedValueOnce({ output_parsed: null });

    await expect(
      generate({
        instructions: "Be helpful",
        prompt: "Say hello",
        schema,
      }),
    ).rejects.toThrow("[OpenAI] unexpected response");
  });
});
