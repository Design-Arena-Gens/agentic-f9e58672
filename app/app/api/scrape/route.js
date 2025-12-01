import { NextResponse } from "next/server";
import { scrapeLeadSources } from "@/lib/scraper";
import { cleanLeads } from "@/lib/dataPipeline";
import { pipelineStore } from "@/lib/pipelineStore";

export async function POST(req) {
  try {
    const { sources = [] } = await req.json();
    if (!Array.isArray(sources) || !sources.length) {
      return NextResponse.json({ error: "sources must be a non-empty array" }, { status: 400 });
    }

    const scraped = await scrapeLeadSources(sources);
    const { valid, rejected } = cleanLeads(scraped);

    const inserted = valid.map((lead) => pipelineStore.upsertLead(lead));

    return NextResponse.json({
      inserted,
      rejected,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
