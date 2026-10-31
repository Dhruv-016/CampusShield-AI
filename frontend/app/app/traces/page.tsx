"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Clock, RefreshCw, Search, Terminal, X, Zap } from "lucide-react";
import { api, TraceItem } from "@/lib/api";
import { Badge, Btn, Card, Empty, ErrorBox, fmtDate, PageTitle, Spinner } from "@/components/ui";

export default function Traces() {
  const [items, setItems] = useState<TraceItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [route, setRoute] = useState("");
  const [sort, setSort] = useState("desc");
  const [detail, setDetail] = useState<TraceItem | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const p = new URLSearchParams({ sort, limit: "50" });
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (route) p.set("route", route);
    try {
      const r = await api<{ total: number; items: TraceItem[] }>(`/traces?${p}`);
      setItems(r.items);
      setTotal(r.total);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [q, status, route, sort]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      api<TraceItem>(`/traces/${id}`)
        .then(setDetail)
        .catch(() => {});
    }
  }, []);

  const openTrace = (id: string) => {
    api<TraceItem>(`/traces/${id}`)
      .then(setDetail)
      .catch((e) => setErr(e.message));
  };

  const selClass =
    "rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageTitle
        title="Traces & Observability"
        sub="Every agent request generates an immutable local trace with real latency, tool execution, and token attribution."
        action={
          <Btn variant="ghost" onClick={load}>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Btn>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <input
            id="tq"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by trace ID..."
            className={`w-full pl-9 ${selClass}`}
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
        </div>

        <select
          aria-label="Filter Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selClass}
        >
          <option value="" className="bg-navy-900">All Statuses</option>
          <option value="success" className="bg-navy-900">Success</option>
          <option value="error" className="bg-navy-900">Error</option>
        </select>

        <select
          aria-label="Filter Route"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          className={selClass}
        >
          <option value="" className="bg-navy-900">All Routes</option>
          {[
            "direct",
            "fee",
            "calendar",
            "policy",
            "memory",
            "clarify",
            "fallback",
          ].map((r) => (
            <option key={r} value={r} className="bg-navy-900">
              {r}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort Order"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={selClass}
        >
          <option value="desc" className="bg-navy-900">Newest First</option>
          <option value="asc" className="bg-navy-900">Oldest First</option>
        </select>
      </div>

      {err && <ErrorBox message={err} onRetry={load} />}
      {!items && !err && <Spinner />}

      {items && items.length === 0 && (
        <Empty
          title="No traces recorded yet"
          text="Ask the student assistant a question and its live trace will appear here immediately."
        />
      )}

      {/* Traces Data Table */}
      {items && items.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold text-slate-400">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Trace ID</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Tools</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {items.map((t) => (
                <tr
                  key={t.id}
                  tabIndex={0}
                  onClick={() => openTrace(t.id)}
                  onKeyDown={(e) => e.key === "Enter" && openTrace(t.id)}
                  className="cursor-pointer hover:bg-white/[0.04] transition group"
                >
                  <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                    {fmtDate(t.created_at)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-cyan-300 group-hover:underline">
                    {t.id}
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone="blue">{t.route}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={t.status === "success" ? "green" : "red"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-white">
                    {t.latency_ms} ms
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300">
                    {t.tool_call_count}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300">
                    {t.chunk_ids.length}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">
                    {t.total_tokens ?? "unavailable"}
                    {t.token_source === "partial" && " (partial)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-white/10 p-3 text-xs text-slate-400 flex justify-between items-center">
            <span>Showing {items.length} of {total} recorded traces</span>
            <span>Local SQLite Database</span>
          </div>
        </Card>
      )}

      {/* Slide-over Detail Drawer */}
      {detail && (
        <div
          className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-white/10 bg-navy-950 p-6 shadow-2xl space-y-5"
          role="dialog"
          aria-label="Trace execution details"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-xs text-slate-400 font-mono">Execution Audit</div>
              <h2 className="font-heading text-lg font-bold text-white font-mono">
                {detail.id}
              </h2>
            </div>
            <button
              onClick={() => setDetail(null)}
              aria-label="Close trace drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Redacted Prompt: </span>
            <span>{detail.redacted_message}</span>
          </div>

          {/* Timeline Events Waterfall */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Execution Timeline</span>
            </h3>
            <ol className="space-y-2 border-l-2 border-indigo-500/40 pl-4 text-xs">
              {detail.events?.map((e, i) => (
                <li key={i} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{e.stage}</span>
                    <span className="font-mono text-cyan-300">+{e.t_ms} ms</span>
                  </div>
                  {e.detail && <p className="text-slate-400">{e.detail}</p>}
                </li>
              ))}
            </ol>
          </div>

          {/* Technical Metadata */}
          <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
            <h3 className="font-heading text-sm font-semibold text-white mb-2">
              Parameters & Provider State
            </h3>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Route & Source:</span>
              <span className="font-mono text-white">
                {detail.route} ({detail.router_source})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Provider Status:</span>
              <span className="font-mono text-cyan-300">
                {detail.provider_status}
                {detail.model && ` · ${detail.model}`}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Retrieval Chunks:</span>
              <span className="font-mono text-slate-300">
                {detail.chunk_ids.join(", ") || "none"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Token Allocation:</span>
              <span className="font-mono text-slate-300">
                {detail.total_tokens === null
                  ? "unavailable"
                  : `in ${detail.input_tokens} / out ${detail.output_tokens} / total ${detail.total_tokens} (${detail.token_source})`}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Fallback Invoked:</span>
              <span className="font-mono text-white">
                {String(detail.fallback_used)}
              </span>
            </div>
            {detail.tool_calls?.map((t, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Tool {t.name}:</span>
                <span className="font-mono text-emerald-400">
                  {t.status} ({t.duration_ms} ms)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
