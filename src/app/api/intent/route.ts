export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { b, IntentType } from "@/baml_client";

// Classifies the user's natural-language input and routes to the
// appropriate domain API. This route owns classification only.
//Each domain API owns its own parsing and execution logic.
export async function POST(request: Request) {
  // const { userId } = await auth();
  // if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { input } = body;

  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  // Step 1: classify — what does the user want to do?
  const parsedIntent = await b.ParseIntent(input);

  // Step 2: hand off to the domain API that owns that intent
  switch (parsedIntent.intent) {
    // Calendar team owns all calendar parsing and confirmation logic
    case IntentType.Calendar:
      return delegateTo("/api/calendar/intent", { transcript: input }, request);

    // /api/doc handles both BAML generation and Google Drive upload
    case IntentType.Doc:
      return delegateTo("/api/doc", { prompt: input }, request);

    // Mail not yet implemented; Unknown is genuinely unrecognized
    default:
      return NextResponse.json(
        { error: "Unknown intent", summary: parsedIntent.summary },
        { status: 422 },
      );
  }
}

// Forwards a request to another API route in this app, proxying the Clerk
// session cookie so the downstream route can authenticate the user.
async function delegateTo(path: string, body: object, request: Request) {
  const url = new URL(path, request.url);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Forward the session cookie so Clerk auth works in the downstream route
      cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
