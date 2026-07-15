import buildRawEmail from "@/features/gmail/lib/build-raw-email";

type CreateGmailDraftInput = {
  accessToken: string;
  body: string;
  subject: string;
  to: string;
};

type GmailDraftResponse = {
  id: string;
  message: {
    id: string;
    threadId: string;
  };
};

export default async function createGmailDraft({
  accessToken,
  body,
  subject,
  to,
}: CreateGmailDraftInput): Promise<GmailDraftResponse> {
  const raw = buildRawEmail({ body, subject, to });

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
    {
      body: JSON.stringify({ message: { raw } }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();

    if (
      response.status === 403 &&
      errorBody.includes("ACCESS_TOKEN_SCOPE_INSUFFICIENT")
    ) {
      throw new Error(
        "Gmail access was not granted. Sign out, sign in again with Google, and approve Gmail permissions. If the prompt does not appear, add https://www.googleapis.com/auth/gmail.compose in Clerk and Google Cloud, then reconnect your Google account.",
      );
    }

    throw new Error(
      `Gmail API request failed (${response.status}): ${errorBody}`,
    );
  }

  return response.json() as Promise<GmailDraftResponse>;
}
