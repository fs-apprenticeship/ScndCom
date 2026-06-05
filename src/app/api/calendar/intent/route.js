export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { b } from "@/baml_client";

export async function POST(request) {
  // const { userId } = await auth();
  const userId = process.env.CLERK_TEST_USER_ID; // TODO: remove this line when auth is wired up

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { transcript } = await request.json();

  const userContext = "visual learner, prefers concise summaries";

  const result = await parseCalendarIntent(transcript, userContext);

  return NextResponse.json(result);
}

async function parseCalendarIntent(transcript, userContext) {
  const result = await b.ParseCalendarIntent(transcript, userContext);

  if (!result.payload.start || !result.payload.end) {
    return {
      status: "clarification_needed",
      summary: result.summary,
    };
  }

  return {
    action: result,
    status: "pending_confirmation",
  };
}
