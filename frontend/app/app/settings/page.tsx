"use client";

import Link from "next/link";
import { ExternalLink, RefreshCw, Server, ShieldCheck, Terminal, Wrench } from "lucide-react";
import { API } from "@/lib/api";
import type { Status } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Badge, Btn, Card, ErrorBox, PageTitle, Spinner } from "@/components/ui";

export default function Settings() {
  const { data: s, error, loading, reload } = useApi<Status>("/status");

  const coreRows: [string, React.ReactNode][] = s
    ? [
        ["Application", `${s.app} v${s.version}`],
        ["Environment", s.environment],
        ["Demo Mode", String(s.demo_mode)],
        ["Demo Student Profile", s.demo_student_id],
        ["Backend Service URL", API],
      ]
    : [];

  const engineRows: [string, React.ReactNode][] = s
    ? [
        [
          "Database Persistence",
          <Badge key="db" tone={s.database === "connected" ? "green" : "red"}>
            {s.database} ({s.database_kind})
          </Badge>,
        ],
        ["LLM Provider", s.llm_provider],
        [
          "Provider Configuration",
          <Badge key="llm" tone={s.llm_configured ? "green" : "amber"}>
            {s.llm_configured ? "Configured (Groq)" : "Limited Mode (Offline)"}
          </Badge>,
        ],
        ["Active Model Identifier", s.llm_model ?? "— (set GROQ_MODEL in backend/.env)"],
        ["Retrieval Engine", s.retrieval_mode],
        ["Local Tracing Storage", s.local_tracing],
        ["LangSmith Export", s.langsmith],
        [
          "Long-term Memory Store",
          <Badge key="mem" tone={s.memory_enabled ? "cyan" : "slate"}>
            {s.memory_enabled ? "Enabled (Max 25)" : "Disabled"}
          </Badge>,
        ],
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle
        title="System Settings & Status"
        sub="Read-only diagnostic audit. Secrets and API keys are stored server-side in backend/.env and never exposed to the frontend."
        action={
          <Btn variant="ghost" onClick={reload}>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Diagnostics</span>
          </Btn>
        }
      />

      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {s?.live_ai_note && (
        <div
          role="status"
          className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-xl text-xs text-amber-200 leading-relaxed space-y-1"
        >
          <div className="font-semibold text-amber-300">Offline Limited Mode Active</div>
          <p>{s.live_ai_note} You can configure GROQ_API_KEY and GROQ_MODEL in <code>backend/.env</code> and restart uvicorn for live LLM generation.</p>
        </div>
      )}

      {s && (
        <div className="space-y-6">
          {/* Core App Information */}
          <Card className="p-6">
            <h2 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-300" />
              <span>Application Core</span>
            </h2>
            <dl className="divide-y divide-white/[0.06] text-sm">
              {coreRows.map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-3">
                  <dt className="text-slate-400 text-xs">{k}</dt>
                  <dd className="font-mono text-xs font-semibold text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Engine & Agent Configuration */}
          <Card className="p-6">
            <h2 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-indigo-400" />
              <span>Agentic Infrastructure</span>
            </h2>
            <dl className="divide-y divide-white/[0.06] text-sm">
              {engineRows.map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-3">
                  <dt className="text-slate-400 text-xs">{k}</dt>
                  <dd className="text-right font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Developer Diagnostic Endpoints */}
          <Card className="p-6">
            <h2 className="font-heading text-base font-bold text-white mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>API Explorer & Health Endpoints</span>
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={`${API}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline"
                >
                  <span>FastAPI Swagger UI Specification</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  href={`${API}/api/v1/health`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline"
                >
                  <span>API Healthcheck Probe (/api/v1/health)</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <Link href="/docs" className="text-indigo-400 hover:underline">
                  Project Markdown Documentation Index →
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
