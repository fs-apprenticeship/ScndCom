import type { TranscribeVoiceEmailResult } from "@/features/gmail/lib/voice-email-schema";

import {
  isVoiceEmailEmpty,
  mergeVoiceEmailFields,
  parseVoiceEmailTranscriptHeuristic,
  parseVoiceEmailTranscriptWithLlm,
} from "@/features/gmail/lib/parse-voice-email-transcript";
import transcribeAudio from "@/lib/openai/transcribe-audio";

const EMPTY_FIELDS = {
  body: "",
  subject: "",
  to: "",
};

export default async function transcribeVoiceEmail(
  audio: File,
): Promise<TranscribeVoiceEmailResult> {
  const transcript = (await transcribeAudio(audio)).trim();

  if (!transcript) {
    throw new Error(
      "No speech was detected. Hold the button longer, speak clearly, and try again.",
    );
  }

  let llmFields = EMPTY_FIELDS;

  try {
    llmFields = await parseVoiceEmailTranscriptWithLlm(transcript);
  } catch {
    llmFields = EMPTY_FIELDS;
  }

  const heuristicFields = parseVoiceEmailTranscriptHeuristic(transcript);
  const fields = mergeVoiceEmailFields(llmFields, heuristicFields);

  if (isVoiceEmailEmpty(fields)) {
    throw new Error(
      `Could not extract email fields from your dictation. Heard: "${summarizeTranscript(transcript)}"`,
    );
  }

  return { fields, transcript };
}

function summarizeTranscript(transcript: string) {
  if (transcript.length <= 140) {
    return transcript;
  }

  return `${transcript.slice(0, 137)}...`;
}
