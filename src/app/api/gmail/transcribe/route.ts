import { NextResponse } from "next/server";

import transcribeVoiceEmail from "@/features/gmail/api/transcribe-voice-email";
import syncAccount from "@/features/identity/api/sync-account";

export async function POST(request: Request) {
  try {
    await syncAccount();

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json(
        { error: "Audio recording is required." },
        { status: 400 },
      );
    }

    const result = await transcribeVoiceEmail(audio);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);

      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: "Unable to transcribe voice input." },
      { status: 500 },
    );
  }
}

function getErrorStatus(message: string) {
  if (message.includes("not signed in")) {
    return 401;
  }

  if (
    message.includes("No speech was detected") ||
    message.includes("Could not extract email fields")
  ) {
    return 400;
  }

  return 502;
}
