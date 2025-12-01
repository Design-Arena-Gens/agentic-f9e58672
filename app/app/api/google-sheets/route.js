import { NextResponse } from "next/server";
import { appendLeadsToSheet } from "@/lib/sheets";
import { pipelineStore } from "@/lib/pipelineStore";

export async function POST(req) {
  try {
    const { spreadsheetId, range = "Leads!A2", credentials, status } = await req.json();
    if (!spreadsheetId || !credentials) {
      return NextResponse.json({ error: "spreadsheetId and credentials are required" }, { status: 400 });
    }

    const leads = pipelineStore.list(status);
    const res = await appendLeadsToSheet({
      spreadsheetId,
      range,
      credentials,
      leads,
    });

    return NextResponse.json({ result: res });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
