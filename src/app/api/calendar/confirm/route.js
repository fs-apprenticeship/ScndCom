export const runtime = "nodejs";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const { data } = await client.users.getUserOauthAccessToken(userId, "google");
  const googleAccessToken = data[0]?.token;

  if (!googleAccessToken) {
    return NextResponse.json({ error: "no google token found" }, { status: 401 });
  }

  const { action } = await request.json();
  const event = await createCalendarEvent(action.payload, googleAccessToken);
  return NextResponse.json({ event, status: "success" });
}

async function createCalendarEvent(payload, accessToken) {
  const event = {
    description: payload.description,
    end: {
      dateTime: payload.end,
      timeZone: "America/New_York",
    },
    location: payload.location ?? "",
    start: {
      dateTime: payload.start,
      timeZone: "America/New_York",
    },
    summary: payload.title,
  };

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      body: JSON.stringify(event),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  return response.json();
}
