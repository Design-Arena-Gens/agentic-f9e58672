import { NextResponse } from "next/server";
import { runMessagingWorkflow } from "@/lib/messaging";

export async function POST(req) {
  try {
    const payload = await req.json();
    const results = await runMessagingWorkflow(payload);
    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
