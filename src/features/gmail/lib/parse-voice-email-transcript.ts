import {
  type VoiceEmailFields,
  voiceEmailSchema,
} from "@/features/gmail/lib/voice-email-schema";
import generateStructured from "@/lib/openai/generate-structured";

const VOICE_EMAIL_INSTRUCTIONS = `You parse spoken email dictations into draft fields.

Return JSON with:
- to: recipient email address
- subject: email subject line
- body: email message body

Rules:
- Copy subject and body wording verbatim from the transcript whenever possible.
- Do not paraphrase, summarize, correct grammar, or invent details.
- Only normalize the to field into a valid email address.
- Convert spoken addresses like "frank at gmail dot com" into "frank@gmail.com".
- Remove label words from values: email, to, subject, body, message, say.
- If the speaker did not clearly say a field, return an empty string for it.

Example transcript:
"Email frank at example dot com, subject team lunch, body hey are we still meeting tomorrow?"

Example output:
{
  "to": "frank@example.com",
  "subject": "team lunch",
  "body": "hey are we still meeting tomorrow?"
}`;

const SECTION_LABEL_PATTERN =
  /\b(subject(?:\s+line)?|body|message|say)\b\s*[:,]?\s*/gi; // eslint-disable-line security/detect-unsafe-regex -- finite alternatives on short transcript input.

export function isVoiceEmailEmpty({ body, subject, to }: VoiceEmailFields) {
  return !to.trim() && !subject.trim() && !body.trim();
}

export function mergeVoiceEmailFields(
  ...sources: VoiceEmailFields[]
): VoiceEmailFields {
  return sources.reduce(
    (merged, source) => ({
      body: merged.body || source.body.trim(),
      subject: merged.subject || source.subject.trim(),
      to: merged.to || source.to.trim(),
    }),
    { body: "", subject: "", to: "" },
  );
}

export function parseVoiceEmailTranscriptHeuristic(
  transcript: string,
): VoiceEmailFields {
  const sections = splitTranscriptSections(transcript);
  const preamble = sections.get("preamble") ?? transcript;
  const subject = sections.get("subject") ?? "";
  const body =
    sections.get("body") ??
    sections.get("message") ??
    sections.get("say") ??
    "";

  return {
    body: cleanFieldValue(body, "body"),
    subject: cleanFieldValue(subject, "subject"),
    to: extractEmailAddress(preamble) || extractEmailAddress(transcript),
  };
}

export async function parseVoiceEmailTranscriptWithLlm(
  transcript: string,
): Promise<VoiceEmailFields> {
  return generateStructured({
    instructions: VOICE_EMAIL_INSTRUCTIONS,
    prompt: `Transcript:\n${transcript}`,
    schema: voiceEmailSchema,
  });
}

function cleanFieldValue(value: string, field: "body" | "subject") {
  let cleaned = value
    .trim()
    .replace(/^[,.:;\s]+/, "")
    .replace(/[,.:;\s]+$/, "");

  if (field === "subject") {
    cleaned = cleaned.replace(/^your\s+subject\s+/i, "");
  }

  if (field === "body") {
    // eslint-disable-next-line security/detect-unsafe-regex -- fixed optional-prefix cleanup on short transcript fragments.
    cleaned = cleaned.replace(/^(?:then\s+)?(?:your\s+)?(?:message\s+)?/i, "");
  }

  return cleaned.trim();
}

function extractEmailAddress(transcript: string) {
  const directEmail = transcript.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  );

  if (directEmail) {
    return directEmail[0].toLowerCase();
  }

  const spokenWithDot = transcript.match(
    /([A-Z0-9._%+-]+)\s+at\s+([A-Z0-9.-]+)\s+dot\s+([A-Z]{2,})/i,
  );

  if (spokenWithDot) {
    return `${spokenWithDot[1]}@${spokenWithDot[2]}.${spokenWithDot[3]}`.toLowerCase();
  }

  const spokenWithDomain = transcript.match(
    /([A-Z0-9._%+-]+)\s+at\s+([A-Z0-9.-]+\.[A-Z]{2,})/i,
  );

  if (spokenWithDomain) {
    return `${spokenWithDomain[1]}@${spokenWithDomain[2]}`.toLowerCase();
  }

  const spokenWithSpaces = transcript.match(
    /(?:email|to)\s+([A-Z0-9._%+-]+)\s+at\s+([A-Z0-9.-]+)\s+([A-Z]{2,})/i,
  );

  if (spokenWithSpaces && !spokenWithSpaces[2].includes(".")) {
    return `${spokenWithSpaces[1]}@${spokenWithSpaces[2]}.${spokenWithSpaces[3]}`.toLowerCase();
  }

  return "";
}

function normalizeSectionLabel(label: string) {
  const normalized = label.toLowerCase().trim();

  if (normalized === "subject line") {
    return "subject";
  }

  if (normalized === "say") {
    return "body";
  }

  if (normalized === "message") {
    return "body";
  }

  return normalized;
}

function splitTranscriptSections(transcript: string) {
  const sections = new Map<string, string>();
  const matches = [...transcript.matchAll(SECTION_LABEL_PATTERN)];

  if (matches.length === 0) {
    sections.set("preamble", transcript);
    return sections;
  }

  const firstMatch = matches[0];

  if (firstMatch.index !== undefined && firstMatch.index > 0) {
    sections.set("preamble", transcript.slice(0, firstMatch.index));
  }

  for (let index = 0; index < matches.length; index += 1) {
    // eslint-disable-next-line security/detect-object-injection -- index is bounded by matches.length in loop condition.
    const match = matches[index];
    const label = normalizeSectionLabel(match[1] ?? "");
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? transcript.length;

    sections.set(label, transcript.slice(start, end));
  }

  return sections;
}
