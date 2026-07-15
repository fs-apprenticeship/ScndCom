import { NextResponse } from "next/server";
import { z } from "zod";

import getGoogleAccessToken from "@/features/gmail/api/get-google-access-token";
import sendGmailMessage from "@/features/gmail/api/send-gmail-message";
import syncAccount from "@/features/identity/api/sync-account";

function getErrorStatus(message: string) {
  if (
    message.includes("not signed in") ||
    message.includes("No Google OAuth token")
  ) {
    return 401;
  }

  if (message.includes("Gmail send access was not granted")) {
    return 403;
  }

  return 502;
}

const sendInputSchema = z.object({
  body: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  to: z.email(),
});

export async function POST(request: Request) {
  try {
    await syncAccount();

    const input = sendInputSchema.parse(await request.json());
    const accessToken = await getGoogleAccessToken();
    const message = await sendGmailMessage({ accessToken, ...input });

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email input.", issues: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      const status = getErrorStatus(error.message);

      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: "Unable to send Gmail message." },
      { status: 500 },
    );
  }
}
