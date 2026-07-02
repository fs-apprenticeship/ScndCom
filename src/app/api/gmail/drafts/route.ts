import { NextResponse } from "next/server";
import { z } from "zod";

import createGmailDraft from "@/features/gmail/api/create-gmail-draft";
import getGoogleAccessToken from "@/features/gmail/api/get-google-access-token";
import syncAccount from "@/features/identity/api/sync-account";

function getErrorStatus(message: string) {
  if (
    message.includes("not signed in") ||
    message.includes("No Google OAuth token")
  ) {
    return 401;
  }

  if (message.includes("Gmail access was not granted")) {
    return 403;
  }

  return 502;
}

const draftInputSchema = z.object({
  body: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  to: z.email(),
});

export async function POST(request: Request) {
  try {
    await syncAccount();

    const input = draftInputSchema.parse(await request.json());
    const accessToken = await getGoogleAccessToken();
    const draft = await createGmailDraft({ accessToken, ...input });

    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid draft input.", issues: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      const status = getErrorStatus(error.message);

      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: "Unable to create Gmail draft." },
      { status: 500 },
    );
  }
}
