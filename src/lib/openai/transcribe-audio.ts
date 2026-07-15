import OpenAI, { toFile } from "openai";

const TRANSCRIPTION_MODELS = ["gpt-4o-mini-transcribe", "whisper-1"] as const;

const MIN_AUDIO_BYTES = 500;

export default async function transcribeAudio(audio: File): Promise<string> {
  const client = new OpenAI();
  const buffer = Buffer.from(await audio.arrayBuffer());

  if (buffer.byteLength < MIN_AUDIO_BYTES) {
    throw new Error(
      "No speech was detected. Hold the button longer, speak clearly, and try again.",
    );
  }

  const extension = audio.name.split(".").pop() || "webm";
  const file = await toFile(buffer, `recording.${extension}`, {
    type: audio.type || "audio/webm",
  });

  let lastError: Error | undefined;

  for (const model of TRANSCRIPTION_MODELS) {
    try {
      const transcription = await client.audio.transcriptions.create({
        file,
        model,
        response_format: "json",
      });

      const text = transcription.text?.trim() ?? "";

      if (text) {
        return text;
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Transcription failed.");
    }
  }

  if (lastError) {
    throw lastError;
  }

  return "";
}
