import { NextResponse } from "next/server";

import syncAccount from "@/features/identity/api/sync-account";

export async function GET(request: Request) {
  await syncAccount();

  return NextResponse.redirect(getSafeRedirectUrl(request));
}

function getSafeRedirectUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectUrl = requestUrl.searchParams.get("redirect_url");

  if (!redirectUrl) {
    return new URL("/", requestUrl);
  }

  const isProtocolRelative = redirectUrl.startsWith("//");

  if (isProtocolRelative) {
    return new URL("/", requestUrl);
  }

  const candidateUrl = new URL(redirectUrl, requestUrl);
  const isSameOrigin = candidateUrl.origin === requestUrl.origin;

  if (!isSameOrigin) {
    return new URL("/", requestUrl);
  }

  return candidateUrl;
}
