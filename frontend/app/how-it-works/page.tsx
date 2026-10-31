"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  Code2,
  Cpu,
  CreditCard,
  Database,
  FileCheck,
  FileText,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TiltCard, GlowOrb, MagneticButton } from "@/components/effects";
import { Badge, GlassCard, SectionHeading } from "@/components/ui";

const STEPS = [
  {
    num: "Step 01",
    title: "Sanitize & Guard",
    subtitle: "High-precision pattern redaction before state ingestion",
    icon: ShieldAlert,
    desc: "Every student prompt undergoes regex sanitization to identify OTPs, credit cards, passwords, and sensitive keys. Any identified secret is replaced with an immutable redaction tag (e.g. [REDACTED:otp]) before entering conversation history, persistent memory, or trace logs.",
    code: `# safety.py
REDACTIONS = [
    (r"\\b\\d{6}\\b", "[REDACTED:otp]"),
    (r"\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b", "[REDACTED:card]"),
    (r"(?i)bearer\\s+[A-Za-z0-9_.-]+", "[REDACTED:token]"),
]`,
    tags: ["Regex Filter", "Zero Secrets", "Trace Protection"],
  },
  {
    num: "Step 02",
    title: "Context Window Selection",
    subtitle: "Bounded memory injection and token budgeting",
    icon: Database,
    desc: "To guarantee predictable latencies and avoid context pollution, the agent selects up to 4 recent conversation messages and only the most relevant student memories (such as preferred brevity, language, or programme). The maximum context is strictly bounded under 2,500 characters.",
    code: `# context.py
def build_context(db, student_id, history):
    memories = fetch_active_memories(db, student_id, limit=3)
    bounded_turns = history[-4:]
    return format_prompt(memories, bounded_turns)`,
    tags: ["2500 Char Budget", "Bounded History", "Active Preferences"],
  },
  {
    num: "Step 03",
    title: "State Router Decision",
    subtitle: "Deterministic classification from a fixed route set",
    icon: Cpu,
    desc: "A LangGraph router assesses student intent and maps it into one of seven fixed routes: fee, calendar, policy, memory, direct, clarify, or fallback. No unbounded cycles or unapproved tools can execute.",
    code: `# agent.py
def decide_route(state: AgentState) -> str:
    # Heuristics + optional LLM classification
    # Validated strictly against FIXED_ROUTES
    if contains_fee_query(state.message):
        return "fee_node"
    elif contains_calendar_query(state.message):
        return "calendar_node"
    ...`,
    tags: ["Cyclic-Free Graph", "Max 2 Tool Calls", "7 Fixed Routes"],
  },
  {
    num: "Step 04",
    title: "Tool Execution & BM25 Retrieval",
    subtitle: "Heading-aware chunks with relevance threshold",
    icon: Search,
    desc: "For policy questions, lexical BM25 searches heading-preserving chunks from the verified student handbook. If no chunk achieves a score above the calibrated threshold, the agent declines to fabricate policy guidance.",
    code: `# retrieval.py
def search_student_policy(query: str, threshold: float = 0.75):
    scored_chunks = bm25_engine.query(query)
    # Strictly filter ungrounded matches
    return [c for c in scored_chunks if c.score >= threshold]`,
    tags: ["BM25 Lexical", "Heading Preserved", "Relevance Guard"],
  },
  {
    num: "Step 05",
    title: "Grounding & Trace Recording",
    subtitle: "Citations verified and performance recorded to SQLite",
    icon: Terminal,
    desc: "The final answer is constructed strictly from tool data or retrieved excerpts. Every request generates an immutable local trace recording latency, token count (provider-reported), and evidence chunk IDs.",
    code: `# service.py
record_trace(
    db,
    trace_id=uuid4(),
    route=state.route,
    tool_calls=state.tool_calls,
    latency_ms=timer.elapsed_ms,
    tokens=provider_tokens
)`,
    tags: ["Local Traces", "Real Latency", "Verifiable Citations"],
  },
];

const GRAPH_NODES = [
  { id: "validate", label: "Validate", sub: "Length & empty check", icon: ShieldCheck, color: "text-indigo-400", border: "border-indigo-500/30" },
  { id: "sanitize", label: "Sanitize", sub: "Regex PII redaction", icon: ShieldAlert, color: "text-amber-400", border: "border-amber-500/30" },
  { id: "load_context", label: "Context & Memory", sub: "Bounded history + prefs", icon: Database, color: "text-cyan-400", border: "border-cyan-500/30" },
  { id: "decide", label: "Intent Router", sub: "7 deterministic routes", icon: Cpu, color: "text-violet-400", border: "border-violet-500/30" },
];

const BRANCH_NODES = [
  { id: "fee_node", label: "Fee Tool", sub: "get_fee_status", icon: CreditCard, tone: "emerald" },
  { id: "calendar_node", label: "Calendar Tool", sub: "get_academic_calendar", icon: Calendar, tone: "cyan" },
  { id: "policy_node", label: "BM25 Retrieval", sub: "search_student_policy", icon: Search, tone: "indigo" },
  { id: "memory_node", label: "Memory Candidate", sub: "extract_preference", icon: Brain, tone: "purple" },
  { id: "fallback_node", label: "Direct / Fallback", sub: "clarify or assist", icon: Bot, tone: "slate" },
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-200">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <GlowOrb color="brand" className="-top-20 right-1/4 h-96 w-96 opacity-40" />
        <GlowOrb color="cyan" className="top-40 -left-20 h-96 w-96 opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="cyan">Technical Architecture</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            How CampusPilot{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              reasons and answers
            </span>
            .
          </motion.h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
            Take a deep dive into the 5-stage deterministic agent pipeline that executes with mathematical predictability, verifiable citations, and zero-trust privacy.
          </p>
        </div>
      </section>

      {/* Interactive Step Navigator */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {STEPS.map((step, idx) => (
              <button
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  activeStep === idx
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{step.num}</span>
                <span className="hidden sm:inline">· {step.title}</span>
              </button>
            ))}
          </div>

          {/* Active Step Showcase */}
          <div className="mt-12 mx-auto max-w-5xl">
            <TiltCard intensity={5}>
              <div className="rounded-2xl border border-white/10 bg-navy-900/80 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <Badge tone="cyan">{STEPS[activeStep].num}</Badge>
                      <span className="text-xs text-slate-400">Node Execution</span>
                    </div>
                    <h2 className="mt-4 font-heading text-2xl sm:text-3xl font-bold text-white">
                      {STEPS[activeStep].title}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-cyan-300">
                      {STEPS[activeStep].subtitle}
                    </p>
                    <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                      {STEPS[activeStep].desc}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {STEPS[activeStep].tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Code Snippet Box */}
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-navy-950 p-4 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-[11px] text-cyan-300 font-sans">Verified Backend Implementation</span>
                    </div>
                    <pre className="mt-4 overflow-x-auto text-slate-200 leading-relaxed">
                      <code>{STEPS[activeStep].code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Visual LangGraph State Transition Architecture */}
      <section className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-navy-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Graph Architecture"
            title="LangGraph State Transition Graph"
            subtitle="The mathematical flow of every student request through our cycle-bounded agent network."
            center
          />

          {/* Desktop Visual Architecture Diagram */}
          <div className="hidden lg:block mt-16 mx-auto max-w-5xl p-8 rounded-3xl border border-white/10 bg-navy-950/80 backdrop-blur-2xl shadow-2xl">
            {/* Sequential Phase 1: Ingestion to Router */}
            <div className="grid grid-cols-4 gap-4 relative">
              {GRAPH_NODES.map((n, idx) => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="relative flex flex-col items-center text-center">
                    <div className={`w-full p-4 rounded-2xl border ${n.border} bg-white/[0.03] backdrop-blur-xl shadow-lg hover:border-white/20 transition`}>
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                        <Icon className={`h-5 w-5 ${n.color}`} />
                      </div>
                      <div className="mt-3 text-sm font-bold text-white">{n.label}</div>
                      <div className="mt-1 text-[11px] text-slate-400">{n.sub}</div>
                    </div>
                    {idx < 3 && (
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-cyan-400">
                        <ArrowRight className="h-5 w-5 drop-shadow" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connecting Transition Down to Branches */}
            <div className="my-8 flex justify-center items-center">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                  Deterministic Branch Selection (ROUTES)
                </span>
                <ArrowDown className="h-6 w-6 text-indigo-400 animate-bounce" />
              </div>
            </div>

            {/* Phase 2: Parallel Branch Execution Nodes */}
            <div className="grid grid-cols-5 gap-3">
              {BRANCH_NODES.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-center hover:border-cyan-500/40 hover:bg-white/[0.04] transition group"
                  >
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-cyan-300 group-hover:text-white transition">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-white">{b.label}</div>
                    <div className="mt-0.5 text-[10px] font-mono text-slate-400 truncate">{b.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Connecting Transition Down to Response & Trace */}
            <div className="my-8 flex justify-center items-center">
              <div className="flex flex-col items-center">
                <ArrowDown className="h-6 w-6 text-violet-400" />
                <span className="text-[11px] font-mono font-semibold text-violet-300 uppercase tracking-wider mt-1">
                  Evidence Convergence & Synthesis
                </span>
              </div>
            </div>

            {/* Phase 3: Final Synthesis Nodes */}
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 backdrop-blur-xl text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="mt-2.5 text-sm font-bold text-white">generate Node</div>
                <div className="mt-1 text-xs text-slate-300">
                  Evidence-grounded response synthesis via live LLM or deterministic fallback
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Terminal className="h-5 w-5" />
                </div>
                <div className="mt-2.5 text-sm font-bold text-white">persist_trace Node</div>
                <div className="mt-1 text-xs text-slate-300">
                  Audit record with millisecond timings, token metrics, and redaction verification
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Deterministic state graph · Strict bound of max 2 tool executions · Redacted user messages persisted to SQLite
            </p>
          </div>

          {/* Mobile Responsive Vertical Flow Sequence */}
          <div className="lg:hidden mt-12 space-y-4">
            {[
              { title: "Stage 1: Validation & Sanitization", sub: "Checks length limits and scrubs OTPs, cards, and passwords with regex patterns." },
              { title: "Stage 2: Context & Memory Enrichment", sub: "Injects recent turns and permitted student style preferences under a strict token budget." },
              { title: "Stage 3: Deterministic Intent Router", sub: "Heuristic and classifier map request into fee, calendar, policy, memory, or direct route." },
              { title: "Stage 4: Tool / BM25 Execution", sub: "Executes student record tool, academic calendar lookup, or lexical handbook search." },
              { title: "Stage 5: Grounded Answer & Trace Persist", sub: "Synthesizes citation-backed response and logs full audit telemetry." },
            ].map((st, i) => (
              <div key={st.title} className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Badge tone="cyan">0{i + 1}</Badge>
                  <span className="font-semibold text-white text-sm">{st.title}</span>
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">{st.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 border-t border-white/[0.08]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge tone="cyan">Ready to observe live traces?</Badge>
          <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
            Inspect real agent execution logs
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Ask any question in the assistant, then open the Traces dashboard to review every event, millisecond timing, and memory candidate.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <MagneticButton
              as="a"
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              <span>Open Student Assistant</span>
              <ArrowRight className="h-4 w-4 text-cyan-300" />
            </MagneticButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
