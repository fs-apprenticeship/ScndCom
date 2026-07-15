export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { b } from "@/baml_client";

// Returns the classified intent so the client can call the appropriate feature API.
export async function POST(request: Request) {
  const body = await request.json();
  const { input } = body;

  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  const { intent, summary } = await b.ParseIntent(input);
  return NextResponse.json({ intent, summary });
}
