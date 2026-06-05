export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(request) {
  // const { userId } = await auth();
  const userId = process.env.CLERK_TEST_USER_ID; // TODO: remove this line when auth is wired up

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { action } = await request.json();

  // placeholder until oauth is wired up
  const googleAccessToken = process.env.GOOGLE_TEST_ACCESS_TOKEN;

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
