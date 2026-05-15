import { beforeEach, describe, expect, it, vi } from "vitest";

const { OpenAIMock, streamMock } = vi.hoisted(() => {
  const streamMock = vi.fn();
  const OpenAIMock = vi.fn(
    class {
      responses = {
        stream: streamMock,
      };
    },
  );

  return { OpenAIMock, streamMock };
});

vi.mock("openai", () => ({
  default: OpenAIMock,
}));

import generateTextStream from "./generate-text-stream";

describe("generateTextStream", () => {
  beforeEach(() => {
    OpenAIMock.mockClear();
    streamMock.mockReset();
  });

  it("requests a response stream and yields text deltas", async () => {
    streamMock.mockReturnValue(
      (async function* () {
        yield { type: "response.created" };
        yield { delta: "Hello", type: "response.output_text.delta" };
        yield { type: "response.output_item.added" };
        yield { delta: " world", type: "response.output_text.delta" };
      })(),
    );

    const chunks: string[] = [];

    for await (const chunk of generateTextStream({
      instructions: "Write clearly.",
      prompt: "Say hello.",
    })) {
      chunks.push(chunk);
    }

    expect(OpenAIMock).toHaveBeenCalledOnce();
    expect(streamMock).toHaveBeenCalledWith({
      input: [
        { content: "Write clearly.", role: "developer" },
        { content: "Say hello.", role: "user" },
      ],
      model: "gpt-4o-2024-08-06",
    });
    expect(chunks).toEqual(["Hello", " world"]);
  });
});
