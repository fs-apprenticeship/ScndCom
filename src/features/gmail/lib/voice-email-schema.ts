import { z } from "zod";

export const voiceEmailSchema = z.object({
  body: z.string(),
  subject: z.string(),
  to: z.string(),
});

export type TranscribeVoiceEmailResult = {
  fields: VoiceEmailFields;
  transcript: string;
};

export type VoiceEmailFields = z.infer<typeof voiceEmailSchema>;
