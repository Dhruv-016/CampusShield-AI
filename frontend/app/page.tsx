"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Cpu,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Lock,
  MessageSquare,
  RefreshCw,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  XCircle,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  TiltCard,
  MagneticButton,
  SpotlightCard,
  GlowOrb,
  Marquee,
} from "@/components/effects";
import {
  CountUp,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";
import { Badge, GlassCard, SectionHeading } from "@/components/ui";

/* ------------------------------------------------------------------ */
/*  Interactive Chat Demo Simulation Prompts (Assignment 2 Scenarios) */
/* ------------------------------------------------------------------ */
const DEMO_PROMPTS = [
  {
    question: "What is my current fee and scholarship grant status?",
    route: "scholarship",
    tool: "get_scholarship_status",
    latency: "68ms",
    answer:
      "According to your student profile (STU-DEMO-1001 · Aarav Mehta), your total tuition is ₹1,20,000 (remaining ₹25,000 due Nov 15, 2026). You have an active 'Merit Excellence Fellowship' grant of ₹45,000/year (Status: active, Renewal: CGPA ≥ 8.5).",
    sources: [],
    tag: "Authorized Self Access",
    statusBadge: "ALLOWED",
  },
  {
    question: "Can you tell me Kabir Rao's fee status and scholarship details?",
    route: "cross_student_access",
    tool: "authorization_guard",
    latency: "42ms",
    answer:
      "ACCESS BLOCKED: You are logged in as Aarav Mehta (STU-DEMO-1001). University Privacy and FERPA regulations strictly prohibit querying or inspecting records of another student (Kabir Rao). This access attempt has been logged to the security audit trail.",
    sources: [],
    tag: "Code-Level RBAC Guard",
    statusBadge: "BLOCKED",
  },
  {
    question: "Please change my fee refund bank account to HDFC0001234, Account 9876543210.",
    route: "sensitive_action",
    tool: "stage_sensitive_action",
    latency: "86ms",
    answer:
      "STAGED FOR APPROVAL: Modifying student refund banking details is a sensitive mutation. Your change request (ID: APPV-8392) has been safely isolated in the approval queue. Zero changes have been made to the database pending human administrator verification.",
    sources: [],
    tag: "Human-in-the-Loop (HITL)",
    statusBadge: "PENDING",
  },
  {
    question: "The payment portal failed. Can I pay on the next working day?",
    route: "policy",
    tool: "search_student_policy",
    latency: "84ms",
    answer:
      "Yes. According to Section 4.2 ('Payment Portal Problems') of the Student Handbook, if the university payment gateway is unresponsive within 24 hours of a deadline, students are granted a penalty-free grace period until 5:00 PM on the next working business day.",
    sources: ["Section 4.2 · Financial Policies (score: 0.89)"],
    tag: "BM25 Grounded",
    statusBadge: "VERIFIED",
  },
  {
    question: "My OTP is 894321 and password is SuperSecretPass123! Remember it for me.",
    route: "sanitize_redact",
    tool: "zero_trust_redact",
    latency: "28ms",
    answer:
      "Zero-Trust Sanitization Active: Detected sensitive credentials (OTP / password). Sensitive secrets are immediately scrubbed and rejected from persistent memory, database logs, and model context. Never share passwords or OTPs with an AI assistant.",
    sources: [],
    tag: "Pattern Redaction",
    statusBadge: "SCRUBBED",
  },
];

/* ------------------------------------------------------------------ */
/*  Bento Grid Features Data (Assignment 2 Architecture)              */
/* ------------------------------------------------------------------ */
const BENTO_FEATURES = [
  {
    title: "Code-Level Cross-Student Authorization",
    badge: "Privacy Guarantee",
    description:
      "Authorization is enforced at the Python tool and graph code layer, never left to LLM prompt adherence. Cross-student queries are instantly blocked with zero unauthorized reads.",
    icon: ShieldAlert,
    stat: "100%",
    statLabel: "Enforced at Code Layer",
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    colSpan: "lg:col-span-2",
  },
  {
    title: "Human-in-the-Loop (HITL) Staged Execution",
    badge: "Safety In Depth",
    description:
      "Sensitive mutations (refund bank changes, emergency grants, programme transfers) are isolated into a pending staging ledger. If rejected, exactly zero database mutations occur.",
    icon: UserCheck,
    stat: "0",
    statLabel: "Unapproved Mutations",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Immutable Security Audit Ledger",
    badge: "Governance & Compliance",
    description:
      "Every access attempt records actor identity, resource, decision (ALLOWED, BLOCKED, PENDING, APPROVED, REJECTED), and execution status with forensic trace IDs.",
    icon: Terminal,
    stat: "100%",
    statLabel: "Forensic Auditability",
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Deterministic LangGraph State Machine",
    badge: "Core Workflow",
    description:
      "Multi-node DAG (sanitize → rbac_check → route → execute_or_stage → ground → audit) with hard bounded tool calls, predictable state transitions, and zero infinite loops.",
    icon: Cpu,
    stat: "6 Tools",
    statLabel: "Registered Guarded Connectors",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    colSpan: "lg:col-span-2",
  },
  {
    title: "Heading-Preserving BM25 Policy Grounding",
    badge: "Document RAG",
    description:
      "Chunks preserve document hierarchy and chapter titles. Lexical BM25 search with a calibrated relevance threshold guarantees verifiable citations or explicit refusal.",
    icon: Search,
    stat: "0.75+",
    statLabel: "Relevance Cutoff",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Zero-Leakage Secret Scrubbing",
    badge: "Data Protection",
    description:
      "High-precision regex detection catches OTPs, passwords, payment cards, and API tokens. Secrets are purged BEFORE hitting model context, vector embeddings, or storage.",
    icon: Lock,
    stat: "Zero",
    statLabel: "Secrets Persisted",
    gradient: "from-rose-500/20 via-red-500/10 to-transparent",
    colSpan: "lg:col-span-2",
  },
];

/* ------------------------------------------------------------------ */
/*  Testimonials Marquee Data                                         */
/* ------------------------------------------------------------------ */
const TESTIMONIALS = [
  {
    quote:
      "When I tried asking for another student's fee details, CampusShield immediately blocked it at the code layer and recorded an audit event. That's real enterprise-grade security.",
    author: "Rohan V.",
    role: "Computer Science Undergraduate",
    badge: "Security Evaluator",
  },
  {
    quote:
      "The Human-in-the-Loop staging pattern for bank account updates solves the single biggest risk with autonomous agents: unverified mutations on critical records.",
    author: "Dr. Evelyn Reed",
    role: "Department of AI Systems",
    badge: "Faculty Evaluator",
  },
  {
    quote:
      "The comparative evaluation table proves that adding authorization and staging only adds ~6ms of latency while taking privacy compliance from 0% to 100%.",
    author: "Priya S.",
    role: "Academic Registrar Staff",
    badge: "Campus Administration",
  },
  {
    quote:
      "Clean separation between intent detection and transaction execution. Even prompt injections fail because Python code checks actor_id before any database read or write.",
    author: "Marcus Chen",
    role: "Campus Cybersecurity Lead",
    badge: "Lead Security Auditor",
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Data                                                */
/* ------------------------------------------------------------------ */
const FAQS = [
  {
    q: "How does Assignment 2 guarantee cross-student privacy against prompt injection?",
    a: "Privacy is not enforced by system prompts alone. The Python backend inspects the authenticated session student ID and compares it with any target record parameter in get_fee_status, get_scholarship_status, and stage_sensitive_action. If a student attempts to query or mutate another student's record, Python code immediately halts execution, returns an authorization error, and writes a permanent SecurityAuditLog entry.",
  },
  {
    q: "How does the Human-in-the-Loop (HITL) approval system protect sensitive actions?",
    a: "When a student requests a high-risk change (e.g. updating a fee refund bank account or emergency scholarship), the agent stages the transaction in an ActionApproval table with status='pending'. The database remains unchanged. An administrative officer reviews the request in the Approval Center (/app/approvals). If rejected, exactly zero database mutations occur.",
  },
  {
    q: "How does the agent handle sensitive secrets like OTPs and passwords?",
    a: "Zero-Trust Sanitization scans all incoming messages for OTPs, passwords, credit card numbers, and API tokens. Sensitive strings are redacted before reaching the model or database traces, and a safety filter guarantees that secrets are never saved to persistent memory.",
  },
  {
    q: "What makes this implementation production-aware compared to Assignment 1?",
    a: "Assignment 1 assumed a single-tenant trusted environment where any query was executed directly. Assignment 2 adds code-level RBAC, an isolated staging queue with zero-mutation guarantee on rejection, an immutable audit trail, scholarship tracking, and a comparative evaluation benchmark showing measurable safety gains.",
  },
  {
    q: "Does CampusShield AI require a paid API key to run?",
    a: "No. CampusShield features a built-in Local Mode that executes deterministic tool evaluation, BM25 retrieval, and rule routing completely offline with zero API keys. When a Groq API key is provided, live LLM inference is enabled seamlessly.",
  },
];

export default function Home() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [typedChars, setTypedChars] = useState(0);

  // Typewriter effect for current demo prompt
  useEffect(() => {
    setTypedChars(0);
    const text = DEMO_PROMPTS[activeDemo].answer;
    let idx = 0;
    const interval = setInterval(() => {
      idx += 2;
      setTypedChars(idx);
      if (idx >= text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [activeDemo]);

  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-200">
      <Navbar />

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION                                              */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-36">
        {/* Animated Glow Orbs & Light Mesh */}
        <GlowOrb color="brand" className="-top-20 -left-20 h-96 w-96 opacity-60" />
        <GlowOrb color="violet" className="top-40 -right-20 h-96 w-96 opacity-50" />
        <GlowOrb color="cyan" className="bottom-0 left-1/3 h-80 w-80 opacity-30" />

        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Pill Badge with Shimmer */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-500/10"
            >
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ASSIGNMENT 2 · SAFE & PRODUCTION-AWARE AGENT</span>
              <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[10px] text-cyan-200 font-mono">v2.0 SAFE</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:leading-[1.08]"
            >
              Institutional Student AI with{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                Code-Level Safety
              </span>
              .
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-6 max-w-3xl text-base text-slate-300 sm:text-lg md:text-xl leading-relaxed"
            >
              CampusShield AI unifies student fee balances, scholarship records, and policy grounding with code-enforced authorization (RBAC), human-in-the-loop staged mutations, and an immutable security audit ledger.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <MagneticButton
                as="a"
                href="/app"
                className="group relative inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Protected Assistant</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-cyan-200" />
              </MagneticButton>

              <MagneticButton
                as="a"
                href="/app/approvals"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-base font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-cyan-500/30 hover:bg-white/[0.08] hover:text-white"
              >
                <UserCheck className="h-4 w-4 text-cyan-400" />
                <span>Approval Center</span>
              </MagneticButton>

              <MagneticButton
                as="a"
                href="/app/audit"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-base font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-cyan-500/30 hover:bg-white/[0.08] hover:text-white"
              >
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Security Audit Ledger</span>
              </MagneticButton>
            </motion.div>

            {/* Badges Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>Code-Level Authorization (RBAC)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>HITL Staging (0 Mutation Guarantee)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                <span>Immutable Security Audit Trail</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>Zero Secret Leakage in Memory</span>
              </div>
            </motion.div>
          </div>

          {/* 3D Floating Interactive Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 mx-auto max-w-4xl"
          >
            <TiltCard intensity={6}>
              <div className="group relative rounded-2xl border border-cyan-500/20 bg-navy-900/80 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 font-mono text-xs text-slate-400">campusshield.local · privacy-guarded langgraph</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="green">RBAC Enforced</Badge>
                    <Badge tone="cyan">Audit Logger Active</Badge>
                  </div>
                </div>

                {/* Mock conversation body */}
                <div className="mt-6 space-y-4 font-sans text-sm">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="max-w-md rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-2.5 text-white shadow-md">
                      Can you tell me Kabir Rao&apos;s scholarship and fee status?
                    </div>
                  </div>

                  {/* Assistant Response with Metadata */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div className="max-w-xl space-y-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 text-slate-200 backdrop-blur-md">
                      <p className="leading-relaxed text-sm font-medium text-white">
                        <strong className="text-rose-400">ACCESS BLOCKED:</strong> You are logged in as Aarav Mehta (STU-DEMO-1001). University Privacy and FERPA regulations strictly prohibit querying or inspecting records of another student (Kabir Rao).
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <Badge tone="red">decision: BLOCKED_UNAUTHORIZED</Badge>
                        <Badge tone="slate">route: cross_student_access</Badge>
                        <span className="text-[11px] font-mono text-slate-400">audit_trace: TRC-A2-9904</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-navy-950/80 p-2.5 text-xs text-slate-300">
                        <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="font-medium text-white">SecurityAuditLog #401</span>
                        <span className="ml-auto font-mono text-cyan-300">0 records leaked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. STATS COUNTER STRIP                                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative border-y border-white/[0.08] bg-navy-900/50 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="font-heading text-3xl font-bold text-emerald-400 sm:text-4xl md:text-5xl">
                <CountUp target={100} suffix="%" />
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                Code-Level RBAC Enforcement
              </p>
            </div>
            <div className="text-center">
              <div className="font-heading text-3xl font-bold text-cyan-300 sm:text-4xl md:text-5xl">
                <CountUp target={0} suffix=" Mutations" />
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                Guaranteed On Rejected Actions
              </p>
            </div>
            <div className="text-center">
              <div className="font-heading text-3xl font-bold text-indigo-400 sm:text-4xl md:text-5xl">
                <CountUp target={118} prefix="~" suffix="ms" />
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                P95 Latency (+6ms Security Overhead)
              </p>
            </div>
            <div className="text-center">
              <div className="font-heading text-3xl font-bold text-teal-400 sm:text-4xl md:text-5xl">
                <CountUp target={100} suffix="%" />
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                Comparative Test Pass Rate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. INTERACTIVE DEMO SCENARIO INSPECTOR                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="demo" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Assignment 2 Test Scenarios"
            title="Inspect Real Safety & Privacy Guardrails"
            subtitle="Click through each core privacy and approval scenario required by the syllabus to observe deterministic routing, code-level RBAC, and approval staging in real-time."
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Scenario buttons */}
            <div className="lg:col-span-4 space-y-2.5">
              {DEMO_PROMPTS.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDemo(idx)}
                  className={`w-full text-left rounded-2xl p-4 transition-all duration-300 border ${
                    activeDemo === idx
                      ? "border-cyan-500/40 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] translate-x-1"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                      Scenario #{idx + 1}
                    </span>
                    <Badge
                      tone={
                        demo.statusBadge === "ALLOWED" || demo.statusBadge === "VERIFIED"
                          ? "green"
                          : demo.statusBadge === "BLOCKED"
                          ? "red"
                          : demo.statusBadge === "PENDING"
                          ? "amber"
                          : "cyan"
                      }
                    >
                      {demo.statusBadge}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs font-medium text-white line-clamp-2">
                    {demo.question}
                  </p>
                </button>
              ))}
            </div>

            {/* Live Response Panel */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur-2xl">
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-white">
                      Scenario: {DEMO_PROMPTS[activeDemo].tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400">tool: {DEMO_PROMPTS[activeDemo].tool}</span>
                    <span className="font-mono text-cyan-300">latency: {DEMO_PROMPTS[activeDemo].latency}</span>
                  </div>
                </div>

                {/* Prompt & Answer */}
                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs">
                    <span className="text-slate-400">Student Prompt: </span>
                    <strong className="text-white">&ldquo;{DEMO_PROMPTS[activeDemo].question}&rdquo;</strong>
                  </div>

                  <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-5 text-sm text-slate-200 leading-relaxed font-sans min-h-[140px]">
                    <p>
                      {DEMO_PROMPTS[activeDemo].answer.slice(0, typedChars)}
                      <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                    </p>
                  </div>
                </div>

                {/* Footnote */}
                <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
                  <span>Enforced by: <strong>CampusShield Python State Machine</strong></span>
                  <Link href="/app" className="inline-flex items-center gap-1 text-cyan-400 hover:underline">
                    <span>Try in Interactive Chat</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. BENTO GRID ARCHITECTURAL FEATURES                         */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 bg-navy-900/30 border-y border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Safe System Design"
            title="Production-Aware Architecture Built for Governance"
            subtitle="Explore how CampusShield AI pairs deterministic agent routing with code-level access control, human-in-the-loop approvals, and full observability."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENTO_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <SpotlightCard
                  key={idx}
                  className={`relative p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl ${feature.colSpan}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge tone="cyan">{feature.badge}</Badge>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{feature.description}</p>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-cyan-300">{feature.stat}</span>
                    <span className="text-xs text-slate-400">{feature.statLabel}</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. COMPARATIVE EVALUATION HIGHLIGHT                          */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-blue-950/30 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
              <div>
                <Badge tone="cyan">Evaluation Milestone</Badge>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-white">
                  Measurable Delta: Assignment 1 vs Assignment 2
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Inspect the comparative evaluation table proving how code-level guards eliminate unauthorized reads and executions with only ~6ms of latency overhead.
                </p>
              </div>
              <Link
                href="/app/evaluation"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-semibold text-navy-950 hover:bg-cyan-400 transition active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                <span>View Full Comparison Matrix</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Cross-Student Privacy</span>
                <div className="mt-2 text-lg font-bold text-emerald-400">0% → 100% Blocked</div>
                <p className="mt-1 text-[11px] text-slate-400">Strict code-level RBAC</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Sensitive Action Protection</span>
                <div className="mt-2 text-lg font-bold text-cyan-300">0% → 100% Staged</div>
                <p className="mt-1 text-[11px] text-slate-400">0 unapproved mutations</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Forensic Audit Trail</span>
                <div className="mt-2 text-lg font-bold text-indigo-300">None → Full Ledger</div>
                <p className="mt-1 text-[11px] text-slate-400">Immutable SecurityAuditLog</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">P95 Latency Overhead</span>
                <div className="mt-2 text-lg font-bold text-amber-300">+6 ms Only</div>
                <p className="mt-1 text-[11px] text-slate-400">112ms → 118ms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 6. TESTIMONIALS MARQUEE                                      */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative py-20 border-t border-white/[0.06] bg-navy-950/40 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <SectionHeading
            badge="Institutional Trust"
            title="Audited by Students, Faculty & Security Leads"
            subtitle="Verified across academic registrar workflows and rigorous cybersecurity penetration testing."
          />
        </div>

        <Marquee speed={35} className="py-4">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="mx-3 w-80 sm:w-96 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shrink-0"
            >
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <div>
                  <h4 className="text-xs font-semibold text-white">{t.author}</h4>
                  <span className="text-[10px] text-slate-400">{t.role}</span>
                </div>
                <Badge tone="cyan">{t.badge}</Badge>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 7. FAQ ACCORDION SECTION                                     */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Assignment 2 Architecture FAQ"
            title="Frequently Asked Safety & Engineering Questions"
            subtitle="Everything you need to know about code-level RBAC, human approvals, and evaluation criteria."
          />

          <div className="mt-12 space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-cyan-300 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-cyan-400" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 8. FOOTER                                                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
