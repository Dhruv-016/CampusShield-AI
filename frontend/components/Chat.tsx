"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Cpu,
  FileText,
  Lock,
  MessageSquare,
  PanelRight,
  PanelRightClose,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import { api, ChatResponse, Source, ToolCall, ActionApprovalItem } from "@/lib/api";
import { Badge, Btn, ErrorBox, fmtDate } from "./ui";

type Msg = {
  role: "user" | "assistant";
  content: string;
  at?: string;
  res?: Partial<ChatResponse>;
};

type Conv = { id: string; title: string; updated_at: string };

const SUGGESTED = [
  "What is my current fee status?",
  "What is my active scholarship status?",
  "What is Kabir Rao's fee status? (Cross-student privacy test)",
  "Update my refund bank account to HDFC-9876543210 (Approval test)",
  "The payment portal failed. Can I pay on the next working day?",
  "My temporary OTP is 987654. Remember it for later.",
];

const WELCOME =
  "Hi! I'm **CampusShield AI** — your verified, production-aware academic assistant (Assignment 2).\n\nI can verify your tuition fee and scholarship grants, enforce strict cross-student data isolation, stage sensitive account modifications for human approval, and log every event to the immutable security audit ledger.\n\nTry one of the scenarios below to see our production safety controls in action!";


function SourceCard({ s }: { s: Source }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-navy-950/60 text-xs overflow-hidden backdrop-blur-md">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.04] transition"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <FileText className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span className="flex-1 font-medium text-white truncate">
          {s.section_title}{" "}
          <span className="font-normal text-slate-400">· {s.source_location}</span>
        </span>
        <span className="font-mono text-[11px] text-cyan-300">score {s.score}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
            open ? "rotate-180 text-cyan-300" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-black/20"
          >
            <p className="whitespace-pre-wrap px-3 py-2 text-slate-300 leading-relaxed font-sans text-xs">
              {s.snippet}
            </p>
            <p className="px-3 pb-2 font-mono text-[10px] text-slate-500">
              Chunk ID: {s.chunk_id}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HumanApprovalCard({
  appv,
  onDecide,
}: {
  appv: ActionApprovalItem;
  onDecide?: (decision: "approved" | "rejected") => void;
}) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(appv.status || "pending");
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const approvalId = appv.approval_id || appv.id;

  const handleDecision = async (decision: "approved" | "rejected") => {
    if (!approvalId || loading) return;
    setLoading(true);
    try {
      const res = await api<{ status: string; decision: string; message: string }>(
        `/approvals/${approvalId}/decide`,
        {
          method: "POST",
          body: JSON.stringify({ decision, reason: `Action ${decision} directly via chat card.` }),
        }
      );
      setStatus(decision);
      setResultMsg(res.message);
      if (onDecide) onDecide(decision);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record decision";
      setResultMsg(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`mt-4 overflow-hidden rounded-2xl border p-4.5 backdrop-blur-xl transition-all duration-300 ${
        status === "pending"
          ? "border-amber-500/40 bg-amber-500/[0.04] shadow-lg shadow-amber-500/10"
          : status === "approved"
          ? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-lg shadow-emerald-500/10"
          : "border-rose-500/40 bg-rose-500/[0.04] shadow-lg shadow-rose-500/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          {status === "pending" ? (
            <ShieldAlert className="h-4 w-4 text-amber-400 animate-pulse" />
          ) : status === "approved" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <XCircle className="h-4 w-4 text-rose-400" />
          )}
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-white">
            {status === "pending" ? "Action Requires Human Approval (HITL)" : `Action ${status.toUpperCase()}`}
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
            status === "pending"
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
              : status === "approved"
              ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
              : "bg-rose-400/20 text-rose-300 border border-rose-400/30"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Body details */}
      <div className="mt-3 space-y-2 text-xs">
        <p className="font-semibold text-white text-sm">{appv.title}</p>
        <p className="text-slate-300 leading-relaxed">{appv.description}</p>
        {appv.payload && Object.keys(appv.payload).length > 0 && (
          <div className="rounded-xl border border-white/[0.08] bg-black/30 p-3 font-mono text-[11px] text-slate-300 space-y-1">
            {Object.entries(appv.payload).map(([k, v]) => (
              <div key={k} className="flex justify-between py-0.5 border-b border-white/[0.04] last:border-0">
                <span className="text-slate-400 capitalize">{k.replace(/_/g, " ")}:</span>
                <span className="text-cyan-300 font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Buttons or Result */}
      {status === "pending" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => handleDecision("approved")}
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{loading ? "Processing..." : "Approve & Execute"}</span>
          </button>
          <button
            onClick={() => handleDecision("rejected")}
            disabled={loading}
            className="flex-1 rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 hover:border-rose-500/40 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>{loading ? "Processing..." : "Reject & Abort"}</span>
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/[0.03] p-2.5 text-xs text-slate-300">
          {status === "approved" ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Mutation approved & executed. Updated in institutional database.</span>
            </span>
          ) : (
            <span className="text-rose-400 font-medium flex items-center gap-1.5">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>Action rejected. Proposed changes discarded. Zero database mutations.</span>
            </span>
          )}
        </div>
      )}
      {resultMsg && (
        <p className="mt-2 text-[11px] text-slate-400 italic">
          {resultMsg}
        </p>
      )}
    </div>
  );
}

function Assistant({
  m,
  onSelect,
  selected,
}: {
  m: Msg;
  onSelect: () => void;
  selected: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const r = m.res || {};
  const tools: ToolCall[] = r.tool_calls || [];
  const limited =
    r.provider_status === "limited_mode_no_llm" ||
    r.provider_status === "llm_error_fallback";

  const handleCopy = () => {
    navigator.clipboard.writeText(m.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3 max-w-[90%] sm:max-w-[85%]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md">
        <Bot className="h-4 w-4 text-cyan-300" />
      </div>

      <div
        className={`flex-1 rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-colors ${
          selected
            ? "border-indigo-400/60 bg-white/[0.07]"
            : "border-white/10 bg-white/[0.04] hover:border-white/20"
        }`}
      >
        <div className="prose-chat text-sm leading-relaxed text-slate-200">
          <ReactMarkdown>{m.content}</ReactMarkdown>
        </div>

        {/* Assignment 2: Live Human-in-the-Loop Approval Card */}
        {r.approval_request && (
          <HumanApprovalCard appv={r.approval_request} />
        )}

        {/* Route & Tool Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {r.route && <Badge tone={r.route === "cross_student_access" ? "red" : r.route === "sensitive_action" ? "amber" : "blue"}>route: {r.route}</Badge>}
          {limited && (
            <Badge tone="amber">
              {r.provider_status === "llm_error_fallback"
                ? "LLM error — fallback"
                : "Limited mode — no live LLM"}
            </Badge>
          )}
          {r.provider_status === "live_llm" && <Badge tone="green">Live LLM</Badge>}
          {tools.map((t, i) => (
            <Badge
              key={i}
              tone={
                t.status === "ok" ? "green" : t.status === "error" ? "red" : "amber"
              }
            >
              <Wrench className="mr-1 h-3 w-3" />
              {t.name}: {t.status}
            </Badge>
          ))}
          {(r.memory_used?.length ?? 0) > 0 && (
            <Badge tone="cyan">
              <Brain className="mr-1 h-3 w-3" />
              used {r.memory_used!.length} preference(s)
            </Badge>
          )}
        </div>

        {/* Execution Summary Notes */}
        {r.execution_summary && r.execution_summary.length > 0 && (
          <p className="mt-2 text-xs text-slate-400">
            {r.execution_summary.join(" · ")}
          </p>
        )}

        {/* Source Cards */}
        {r.sources && r.sources.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {r.sources.map((s) => (
              <SourceCard key={s.chunk_id} s={s} />
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-xs text-slate-400">
          <span>{fmtDate(m.at)}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 hover:text-white transition"
              aria-label="Copy response"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
            {r.trace_id && (
              <button
                onClick={onSelect}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
              >
                <PanelRight className="h-3 w-3" />
                <span>Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [cid, setCid] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState("");
  const [sel, setSel] = useState<number | null>(null);
  const [panel, setPanel] = useState(true);
  const end = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(
    () => api<Conv[]>("/conversations").then(setConvs).catch(() => {}),
    []
  );

  useEffect(() => {
    loadConvs();
  }, [loadConvs]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setError(null);
    setLast(t);
    setInput("");
    setBusy(true);

    setMsgs((m) => [...m, { role: "user", content: t, at: new Date().toISOString() }]);

    try {
      const r = await api<ChatResponse>("/chat", {
        method: "POST",
        body: JSON.stringify({ message: t, conversation_id: cid }),
      });
      setCid(r.conversation_id);
      setMsgs((m) => {
        const n: Msg[] = [
          ...m,
          { role: "assistant", content: r.answer, at: r.created_at, res: r },
        ];
        setSel(n.length - 1);
        return n;
      });
      loadConvs();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const openConv = async (id: string) => {
    try {
      const c = await api<{
        messages: {
          role: "user" | "assistant";
          content: string;
          created_at: string;
          trace_id: string | null;
          meta: {
            route?: string;
            sources?: Source[];
            tool_calls?: ToolCall[];
          } | null;
        }[];
      }>(`/conversations/${id}`);

      setCid(id);
      setSel(null);
      setError(null);
      setMsgs(
        c.messages.map((m) => ({
          role: m.role,
          content: m.content,
          at: m.created_at,
          res:
            m.role === "assistant"
              ? {
                  trace_id: m.trace_id ?? undefined,
                  route: m.meta?.route,
                  sources: m.meta?.sources,
                  tool_calls: m.meta?.tool_calls,
                }
              : undefined,
        }))
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const fresh = () => {
    setCid(null);
    setMsgs([]);
    setSel(null);
    setError(null);
  };

  const detail = sel !== null ? msgs[sel]?.res : undefined;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Conversations Sidebar */}
      <aside
        className="hidden w-60 shrink-0 flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3 backdrop-blur-xl xl:flex"
        aria-label="Conversations"
      >
        <button
          onClick={fresh}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Conversation</span>
        </button>

        <div className="flex-1 space-y-1 overflow-y-auto mt-2">
          {convs.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-slate-500">
              No conversations recorded.
            </p>
          )}
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => openConv(c.id)}
              className={`block w-full truncate rounded-xl px-3 py-2 text-left text-xs transition ${
                c.id === cid
                  ? "bg-white/[0.08] font-semibold text-cyan-300 border border-white/10"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Center Chat Viewport */}
      <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-white/10 bg-navy-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Top Chat Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-cyan-300" />
            <h1 className="font-heading text-sm font-semibold text-white">
              CampusPilot Student Co-pilot
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fresh}
              className="inline-flex xl:hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
            <button
              onClick={() => setPanel(!panel)}
              aria-label="Toggle details panel"
              className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              {panel ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {msgs.length === 0 && (
            <div className="mx-auto max-w-xl py-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-cyan-300 ring-1 ring-indigo-500/30">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-base font-bold text-white">
                      Welcome to CampusPilot AI
                    </h2>
                    <p className="text-xs text-slate-400">
                      Grounded student assistance powered by LangGraph & BM25
                    </p>
                  </div>
                </div>
                <div className="prose-chat mt-4 text-sm leading-relaxed text-slate-300">
                  <ReactMarkdown>{WELCOME}</ReactMarkdown>
                </div>
              </div>

              {/* Quick suggestion pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "user" ? (
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm text-white shadow-lg">
                    {m.content}
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-cyan-300 text-xs font-bold ring-1 ring-indigo-500/30">
                    AM
                  </div>
                </div>
              ) : (
                <Assistant
                  m={m}
                  selected={sel === i}
                  onSelect={() => {
                    setSel(i);
                    setPanel(true);
                  }}
                />
              )}
            </motion.div>
          ))}

          {busy && (
            <div
              role="status"
              className="flex items-center gap-2.5 text-xs text-cyan-300 bg-white/[0.03] border border-white/10 px-3.5 py-2 rounded-xl w-fit"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span>CampusPilot is reasoning and executing tools…</span>
            </div>
          )}

          {error && (
            <ErrorBox
              message={error}
              onRetry={last ? () => send(last) : undefined}
            />
          )}
          <div ref={end} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-white/10 bg-navy-950/80 p-3 backdrop-blur-xl"
        >
          <div className="flex items-end gap-2">
            <label htmlFor="composer" className="sr-only">
              Ask a question
            </label>
            <textarea
              id="composer"
              rows={1}
              value={input}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fee balances, handbook rules, or calendar milestones…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 disabled:opacity-40 transition"
            >
              <Send className="h-4 w-4 text-cyan-300" />
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 px-1">
            Press Enter to submit · Shift+Enter for new line · Zero-trust regex active
          </p>
        </form>
      </section>

      {/* Right Trace Inspector Drawer */}
      {panel && (
        <aside
          className="hidden w-80 shrink-0 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm backdrop-blur-xl lg:block"
          aria-label="Response details"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-300" />
              <span>Execution Inspector</span>
            </h2>
            <button
              onClick={() => setPanel(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {!detail ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Select an assistant reply to inspect its live trace, tool payload, and token metrics.
            </div>
          ) : (
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-slate-400">Trace Identifier</dt>
                <dd className="mt-0.5">
                  <Link
                    className="font-mono text-cyan-300 hover:underline"
                    href={`/app/traces?id=${detail.trace_id}`}
                  >
                    {detail.trace_id}
                  </Link>
                </dd>
              </div>

              {detail.latency_ms !== undefined && (
                <div>
                  <dt className="text-slate-400">Total Latency</dt>
                  <dd className="mt-0.5 font-mono text-white">
                    {detail.latency_ms} ms
                  </dd>
                </div>
              )}

              {detail.token_usage && (
                <div>
                  <dt className="text-slate-400">Token Consumption</dt>
                  <dd className="mt-0.5 font-mono text-slate-300">
                    {detail.token_usage.source === "unavailable"
                      ? "Unavailable (local mode / no provider tokens)"
                      : `${detail.token_usage.total} (${detail.token_usage.source}-reported)`}
                  </dd>
                </div>
              )}

              {detail.context_meta && (
                <div>
                  <dt className="text-slate-400">Context Window Selection</dt>
                  <dd className="mt-0.5 text-slate-300">
                    {detail.context_meta.history_selected ?? 0} messages,{" "}
                    {detail.context_meta.memories_selected ?? 0} memories,{" "}
                    {detail.context_meta.chunks_selected ?? 0} policy chunks
                    {detail.context_meta.truncated ? " (truncated)" : ""}
                  </dd>
                </div>
              )}

              {detail.memory_used && detail.memory_used.length > 0 && (
                <div>
                  <dt className="text-slate-400">Saved Preferences Applied</dt>
                  <div className="mt-1 space-y-1">
                    {detail.memory_used.map((m) => (
                      <dd
                        key={m.id}
                        className="rounded bg-white/[0.04] p-1.5 text-slate-300"
                      >
                        • {m.content}
                      </dd>
                    ))}
                  </div>
                </div>
              )}

              {(detail.tool_calls || []).map((t, i) => (
                <div key={i}>
                  <dt className="text-slate-400">Tool Execution</dt>
                  <dd className="mt-0.5 font-mono text-cyan-300">
                    {t.name} → {t.status} ({t.duration_ms} ms)
                  </dd>
                </div>
              ))}

              {detail.error_category && (
                <div>
                  <dt className="text-slate-400">Error Classification</dt>
                  <dd className="mt-0.5 text-red-400 font-mono">
                    {detail.error_category}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </aside>
      )}
    </div>
  );
}
