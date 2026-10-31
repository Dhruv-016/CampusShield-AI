"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, HelpCircle, Lock, MessageSquare, Plus, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { api, MemoryItem } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Badge, Btn, Card, Empty, ErrorBox, fmtDate, PageTitle, Spinner } from "@/components/ui";

const EXAMPLES = [
  "I prefer concise bullet points",
  "Use simple and direct language",
  "I study MSc Computer Science",
  "Explain in detailed step-by-step format",
];

export default function Memory() {
  const { data, error, loading, reload } = useApi<MemoryItem[]>("/memories");
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const isQuestion = /\?|^(how|what|where|when|why|who|can|tell|check)\b/i.test(text.trim());

  const run = async (fn: () => Promise<unknown>) => {
    setErr(null);
    try {
      await fn();
      reload();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle
        title="Persistent Memory & Preferences"
        sub="Only explicit, non-sensitive preferences survive across sessions. You can delete them at any time."
        action={
          <Btn
            variant="danger"
            disabled={!data?.length}
            onClick={() =>
              confirm("Delete all saved student memories?") &&
              run(() => api("/memories", { method: "DELETE" }))
            }
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </Btn>
        }
      />

      {/* Privacy Notice Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Zero-Trust Privacy Protection: </span>
            Passwords, OTPs, API tokens, and payment cards are detected by pattern matching and are permanently rejected from memory storage. Memory candidates are restricted to response style, language, and academic programme.
          </div>
        </div>
      </div>

      {/* New Preference Input */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">Add a Student Preference</span>
          <span className="text-[11px] text-slate-500">To ask questions, use the Assistant chat</span>
        </div>

        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;

            if (isQuestion) {
              setErr("To ask questions about your saved preferences, please use the Student Assistant chat tab. This box is only for saving preference statements.");
              return;
            }

            run(async () => {
              await api("/memories", {
                method: "POST",
                body: JSON.stringify({ content: text }),
              });
              setText("");
            });
          }}
        >
          <label htmlFor="mem" className="sr-only">
            New preference
          </label>
          <input
            id="mem"
            value={text}
            maxLength={300}
            onChange={(e) => {
              setText(e.target.value);
              if (err) setErr(null);
            }}
            placeholder="e.g. I prefer concise explanations, or I study Computer Science"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
          <Btn type="submit" disabled={!text.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            <span>Save Preference</span>
          </Btn>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-cyan-400" /> Examples:
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setText(ex)}
              className="text-[11px] rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white px-2 py-0.5 text-slate-400 transition"
            >
              + {ex}
            </button>
          ))}
        </div>

        {/* Question detected warning */}
        {isQuestion && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2.5">
            <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span>You are typing a question! To ask CampusPilot questions about your saved preferences, open the </span>
              <Link href="/app" className="font-semibold text-cyan-300 underline hover:text-cyan-200">
                Student Assistant Chat
              </Link>
              <span>. This page is only used to store preference statements.</span>
            </div>
          </div>
        )}
      </Card>

      {err && <ErrorBox message={err} />}
      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <Empty
          title="No saved preferences yet"
          text="Try typing 'Remember that I prefer concise explanations' in the student chat assistant or add one manually above."
        />
      )}

      {/* Saved Memory List */}
      <div className="space-y-3">
        {data && data.length > 0 && (
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span>Stored Preferences ({data.length}/25 max)</span>
            <span>Automatically Deduplicated</span>
          </div>
        )}
        <ul className="space-y-2">
          {data?.map((m) => (
            <li key={m.id}>
              <Card className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white break-words">
                    {m.content}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge tone="cyan">{m.category}</Badge>
                    <Badge tone={m.enabled ? "green" : "slate"}>
                      {m.enabled ? "active" : "disabled"}
                    </Badge>
                    <span className="font-mono text-[11px] text-slate-500">
                      Saved {fmtDate(m.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  aria-label={`Delete preference ${m.content}`}
                  onClick={() => run(() => api(`/memories/${m.id}`, { method: "DELETE" }))}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/[0.04] transition shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
