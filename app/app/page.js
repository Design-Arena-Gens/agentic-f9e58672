"use client";

import { useEffect, useState } from "react";

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-900 bg-slate-950/60 p-6 shadow-lg shadow-black/20 backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </h2>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function IntegrationStatus({ label, description }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-900 bg-slate-950/40 p-3">
      <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-400" />
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [sources, setSources] = useState(["https://example.com/listings"]);
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    refreshLeads();
  }, [statusFilter]);

  async function refreshLeads() {
    const url = statusFilter ? `/api/leads?status=${statusFilter}` : "/api/leads";
    const res = await fetch(url);
    const data = await res.json();
    setLeads(data.leads || []);
  }

  async function handleScrape() {
    setLoading(true);
    setLogs((log) => [`Scraping ${sources.length} sources`, ...log]);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sources }),
    });
    const data = await res.json();
    setLogs((log) => [`Inserted ${data.inserted?.length || 0} leads`, ...log]);
    setLoading(false);
    refreshLeads();
  }

  async function handleDescribe(lead) {
    setSelectedLead(lead);
    const res = await fetch("/api/describe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    const data = await res.json();
    setDescription(data.description);
  }

  async function transitionLead(id, status) {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    refreshLeads();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-900/50 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Real Estate Automation Agent</h1>
            <p className="mt-2 max-w-xl text-slate-400">
              Unified workflow to scrape listings, enrich and nurture leads, and sync outcomes across
              comms, sheets, and calendar.
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <button
              onClick={handleScrape}
              disabled={loading}
              className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
            >
              {loading ? "Running..." : "Scrape & Ingest"}
            </button>
            <button
              onClick={refreshLeads}
              className="rounded-md border border-slate-800 px-4 py-2 hover:border-slate-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 pt-6 md:grid-cols-5">
        <section className="space-y-6 md:col-span-3">
          <Card title="Scrape Sources">
            <textarea
              value={sources.join("\n")}
              onChange={(event) => setSources(event.target.value.split(/\n+/).filter(Boolean))}
              className="h-32 w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-xs text-slate-400">
              Provide any public listings pages. The scraper performs static HTML extraction and
              falls back to headless instructions.
            </p>
          </Card>

          <Card title="Lead Pipeline">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              {["", "NEW", "CONTACTED", "FOLLOW_UP", "CLOSED"].map((status) => (
                <button
                  key={status || "ALL"}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-3 py-1 transition ${
                    statusFilter === status
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {status || "ALL"}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {leads.map((lead) => (
                <article
                  key={lead.id}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{lead.name || "Unnamed lead"}</h3>
                      <p className="text-xs text-slate-400">{lead.propertyAddress || lead.source}</p>
                    </div>
                    <span className="rounded-full border border-slate-800 px-3 py-1 text-xs">
                      {lead.status}
                    </span>
                  </header>
                  <dl className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                    {lead.email && (
                      <div>
                        <dt className="text-slate-500">Email</dt>
                        <dd>{lead.email}</dd>
                      </div>
                    )}
                    {lead.phone && (
                      <div>
                        <dt className="text-slate-500">Phone</dt>
                        <dd>{lead.phone}</dd>
                      </div>
                    )}
                    {lead.priceNumeric && (
                      <div>
                        <dt className="text-slate-500">Budget</dt>
                        <dd>${lead.priceNumeric.toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                  <footer className="mt-4 flex flex-wrap gap-2 text-xs">
                    {["NEW", "CONTACTED", "FOLLOW_UP", "CLOSED"].map((status) => (
                      <button
                        key={status}
                        onClick={() => transitionLead(lead.id, status)}
                        className="rounded-md border border-slate-800 px-3 py-1 hover:border-emerald-500 hover:text-emerald-300"
                      >
                        {status}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDescribe(lead)}
                      className="ml-auto rounded-md border border-emerald-500/70 px-3 py-1 text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Generate Description
                    </button>
                  </footer>
                </article>
              ))}
              {!leads.length && (
                <p className="text-xs text-slate-500">
                  No leads yet. Scrape to populate the pipeline.
                </p>
              )}
            </div>
          </Card>

          <Card title="Description Output">
            {selectedLead ? (
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">
                  Generated for <span className="text-emerald-300">{selectedLead.name}</span>
                </p>
                <p className="rounded-md border border-slate-800 bg-slate-900 p-3">{description}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a lead to generate copy.</p>
            )}
          </Card>
        </section>

        <aside className="space-y-6 md:col-span-2">
          <Card title="Trigger → Action Recipes">
            <ul className="space-y-3 text-xs">
              <li>
                <span className="font-semibold text-emerald-300">New listing scraped</span> →
                Normalize data → Insert pipeline → Notify Slack channel.
              </li>
              <li>
                <span className="font-semibold text-emerald-300">Lead moves to CONTACTED</span> →
                Queue WhatsApp follow-up → Schedule intro call via Calendar API.
              </li>
              <li>
                <span className="font-semibold text-emerald-300">Lead marked CLOSED</span> →
                Append details to Google Sheets → Archive conversation threads.
              </li>
            </ul>
          </Card>

          <Card title="Integrations">
            <IntegrationStatus
              label="Google Sheets"
              description="Append pipeline rows to the shared workbook."
            />
            <IntegrationStatus
              label="Calendar Booking"
              description="Generate Meet links and calendar invites for tours."
            />
            <IntegrationStatus
              label="Messaging"
              description="Resend email + Twilio WhatsApp templates with booking CTA."
            />
          </Card>

          <Card title="Activity Log">
            <ul className="space-y-2 text-xs text-slate-400">
              {logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
              {!logs.length && <li>No activity yet.</li>}
            </ul>
          </Card>
        </aside>
      </main>
    </div>
  );
}
