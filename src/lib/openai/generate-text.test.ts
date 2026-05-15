import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock, OpenAIMock } = vi.hoisted(() => {
  const createMock = vi.fn();
  const OpenAIMock = vi.fn(
    class {
      responses = {
        create: createMock,
      };
    },
  );

  return { createMock, OpenAIMock };
});

vi.mock("openai", () => ({
  default: OpenAIMock,
}));

import generateText from "./generate-text";

describe("generateText", () => {
  beforeEach(() => {
    OpenAIMock.mockClear();
    createMock.mockReset();
  });

  it("requests a response and returns the completed text", async () => {
    createMock.mockResolvedValue({
      output_text: "Hello world",
    });

    await expect(
      generateText({
        instructions: "Write clearly.",
        prompt: "Say hello.",
      }),
    ).resolves.toBe("Hello world");

    expect(OpenAIMock).toHaveBeenCalledOnce();
    expect(createMock).toHaveBeenCalledWith({
      input: [
        { content: "Write clearly.", role: "developer" },
        { content: "Say hello.", role: "user" },
      ],
      model: "gpt-4o-2024-08-06",
    });
  });
});
