import { NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/calendar";

export async function POST(req) {
  try {
    const payload = await req.json();
    const event = await createCalendarEvent(payload);
    return NextResponse.json({ event });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
