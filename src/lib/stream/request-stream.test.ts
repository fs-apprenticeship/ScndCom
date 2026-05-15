import { waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import requestStream from "./request-stream";

describe("requestStream", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("decodes streamed text chunks", async () => {
    const encoder = new TextEncoder();
    const textBytes = encoder.encode("Hello 🙂");
    const firstChunk = textBytes.slice(0, 7);
    const secondChunk = textBytes.slice(7);
    const receivedChunks: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(firstChunk);
              controller.enqueue(secondChunk);
              controller.close();
            },
          }),
          { status: 200 },
        ),
      ),
    );

    requestStream("/api/test", (chunk) => {
      receivedChunks.push(chunk);
    });

    await waitFor(() => {
      expect(receivedChunks.join("")).toBe("Hello 🙂");
    });
  });

  it("does not read the stream when the response is not ok", async () => {
    const onChunk = vi.fn();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("Forbidden", { status: 403 }));

    vi.stubGlobal("fetch", fetchMock);

    requestStream("/api/test", onChunk);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    expect(onChunk).not.toHaveBeenCalled();
  });

  it("aborts when the cleanup runs", async () => {
    let requestSignal: AbortSignal | undefined;

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(
          async (_url: string, init?: { signal?: AbortSignal }) => {
            requestSignal = init?.signal;

            return await new Promise<Response>((_resolve, reject) => {
              init?.signal?.addEventListener("abort", () => {
                reject(new DOMException("Aborted", "AbortError"));
              });
            });
          },
        ),
    );

    const stopStreaming = requestStream("/api/test", () => {});

    await waitFor(() => {
      expect(requestSignal).toBeDefined();
    });

    expect(requestSignal?.aborted).toBe(false);

    stopStreaming();

    expect(requestSignal?.aborted).toBe(true);
  });
});
