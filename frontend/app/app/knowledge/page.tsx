"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, FileText, RefreshCw, Search, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Badge, Btn, Card, Empty, ErrorBox, fmtDate, PageTitle, Spinner } from "@/components/ui";

type Doc = {
  id: string;
  title: string;
  type: string;
  status: string;
  chunk_count: number;
  ingested_at: string;
  retrieval_mode: string;
};

type Chunk = {
  chunk_id: string;
  section_title: string;
  source_location: string;
  content: string;
};

type Hit = Chunk & { score: number; matched_terms: string[] };

export default function Knowledge() {
  const docs = useApi<Doc[]>("/policies/documents");
  const chunks = useApi<Chunk[]>("/policies/chunks");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const search = async () => {
    if (q.trim().length < 2) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await api<{ results: Hit[] }>(
        `/policies/search?q=${encodeURIComponent(q)}&limit=5`
      );
      setHits(res.results);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reindex = async () => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const r = await api<{ chunks: number }>("/policies/reindex", {
        method: "POST",
      });
      setMsg(`Successfully re-indexed: ${r.chunks} heading-preserving chunks.`);
      docs.reload();
      chunks.reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const d = docs.data?.[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle
        title="Policy Knowledge Base"
        sub="Heading-preserving lexical BM25 retrieval over official handbook sections."
        action={
          <Btn variant="ghost" onClick={reindex} disabled={busy}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            <span>Re-index Handbook</span>
          </Btn>
        }
      />

      {docs.loading && <Spinner />}
      {docs.error && <ErrorBox message={docs.error} onRetry={docs.reload} />}

      {!docs.loading && !d && !docs.error && (
        <Empty
          title="No document indexed"
          text="Run the handbook ingestion script or trigger Re-index above."
        />
      )}

      {/* Document Overview Card */}
      {d && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="font-heading text-xl font-bold text-white">
                {d.title}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {d.type} · {d.chunk_count} chunks indexed · ingested {fmtDate(d.ingested_at)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">{d.status}</Badge>
              <Badge tone="blue">mode: {d.retrieval_mode}</Badge>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-300 leading-relaxed border-t border-white/[0.08] pt-3">
            Lexical BM25 retrieval with calibrated relevance threshold filtering. Unlike raw semantic embeddings, this maintains exact chapter citations and avoids hallucinatory answers.
          </p>
        </Card>
      )}

      {msg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {err && <ErrorBox message={err} />}

      {/* Interactive BM25 Query Tester */}
      <Card className="p-6">
        <h2 className="font-heading text-base font-bold text-white mb-2">
          Test BM25 Retrieval Engine
        </h2>
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <label htmlFor="kq" className="sr-only">
            Search handbook
          </label>
          <input
            id="kq"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. payment portal failed, late fee grace period..."
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
          <Btn type="submit" disabled={busy || q.trim().length < 2}>
            <Search className="h-4 w-4 mr-2" />
            <span>Search</span>
          </Btn>
        </form>

        {hits && (
          <div className="mt-6 space-y-3">
            {hits.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                No sections passed the calibrated relevance threshold. In this scenario, the agent declines to fabricate policy guidance.
              </p>
            ) : (
              hits.map((h) => (
                <div
                  key={h.chunk_id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-2 backdrop-blur-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                    <span className="font-heading font-semibold text-white">
                      {h.section_title}
                    </span>
                    <span className="font-mono text-[11px] text-cyan-300">
                      score {h.score.toFixed(3)} · matched: {h.matched_terms.join(", ") || "none"}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans text-xs">
                    {h.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Indexed Sections Accordion */}
      <div className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-white">
          All Indexed Sections ({chunks.data?.length ?? 0})
        </h2>
        {chunks.loading && <Spinner />}
        <div className="space-y-2">
          {chunks.data?.map((c) => (
            <Card key={c.chunk_id} className="p-4">
              <button
                className="flex w-full items-center justify-between text-left text-sm"
                aria-expanded={openId === c.chunk_id}
                onClick={() => setOpenId(openId === c.chunk_id ? null : c.chunk_id)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold text-white">{c.section_title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                    {c.source_location}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      openId === c.chunk_id ? "rotate-180 text-cyan-300" : ""
                    }`}
                  />
                </div>
              </button>
              {openId === c.chunk_id && (
                <div className="mt-3 border-t border-white/10 pt-3 text-xs">
                  <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">
                    {c.content}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-slate-500">
                    Chunk: {c.chunk_id}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
