import { auth, clerkClient } from "@clerk/nextjs/server";

import { GOOGLE_OAUTH_PROVIDER } from "@/features/gmail/constants/google-oauth-scopes";

export default async function getGoogleAccessToken() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Cannot get Google access token: user is not signed in");
  }

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(
    userId,
    GOOGLE_OAUTH_PROVIDER,
  );
  const accessToken = tokens.data[0]?.token;

  if (!accessToken) {
    throw new Error(
      "No Google OAuth token found. Sign in with Google to create email drafts.",
    );
  }

  return accessToken;
}
