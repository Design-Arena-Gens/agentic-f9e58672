import { NextResponse } from "next/server";
import { generateDescription } from "@/lib/description";

export async function POST(req) {
  try {
    const lead = await req.json();
    const description = generateDescription(lead);
    return NextResponse.json({ description });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
