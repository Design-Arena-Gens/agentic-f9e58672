import { NextResponse } from "next/server";
import { pipelineStore, STATUSES } from "@/lib/pipelineStore";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  if (status && !STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid status filter" }, { status: 400 });
  }

  const leads = pipelineStore.list(status);
  return NextResponse.json({ leads });
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of ${STATUSES.join(", ")}` }, { status: 400 });
    }
    const lead = pipelineStore.transitionLead(id, status);
    return NextResponse.json({ lead });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
