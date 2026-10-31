"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  CreditCard,
  Database,
  FileCheck,
  FileText,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TiltCard, GlowOrb, MagneticButton } from "@/components/effects";
import { Badge, GlassCard, SectionHeading } from "@/components/ui";

const PILLARS = [
  {
    icon: Cpu,
    title: "Deterministic State Machine",
    badge: "Reliability",
    desc: "Cyclic-free LangGraph workflow that guarantees finite termination, predictable response latencies, and zero unhandled edge states.",
  },
  {
    icon: Search,
    title: "Heading-Preserving BM25",
    badge: "Lexical RAG",
    desc: "Indexes official student handbooks with preserved parent headings, calculating BM25 relevance scores and enforcing evidence thresholds.",
  },
  {
    icon: CreditCard,
    title: "Live Fee Balance Checker",
    badge: "Tool Automation",
    desc: "Native tool connection to student fee ledgers, returning total fees, paid amounts, outstanding balances, and penalty due dates.",
  },
  {
    icon: Calendar,
    title: "Academic Calendar Connector",
    badge: "Milestones",
    desc: "Fetches forthcoming exam periods, registration windows, and university holidays relative to the configured semester date.",
  },
  {
    icon: Brain,
    title: "Persistent Preference Memory",
    badge: "Context Retention",
    desc: "Saves communication style and language preferences across conversations with automated deduplication and a 25-item ceiling.",
  },
  {
    icon: Lock,
    title: "Zero-Trust Secret Scrubbing",
    badge: "Security",
    desc: "Proactive regex redaction sweeps for OTPs, passwords, payment cards, and auth tokens before saving to database or context.",
  },
];

const COMPARISON = [
  {
    feature: "Policy Grounding",
    legacy: "Manually searching 80-page unindexed PDFs",
    campusPilot: "Instant BM25 heading search with cited clauses",
  },
  {
    feature: "Hallucination Control",
    legacy: "Generic LLMs fabricate non-existent rules",
    campusPilot: "Strict threshold refusal: declines without evidence",
  },
  {
    feature: "Student Privacy",
    legacy: "Plaintext credentials logged to server databases",
    campusPilot: "Pattern-based regex scrub before memory or trace",
  },
  {
    feature: "Response Speed",
    legacy: "5-10 business days for admin support email",
    campusPilot: "<120ms P95 local response time",
  },
  {
    feature: "Offline Support",
    legacy: "Fails entirely when cloud services hiccup",
    campusPilot: "Built-in deterministic Limited Mode without network",
  },
  {
    feature: "Observability",
    legacy: "Black-box operations with zero student feedback",
    campusPilot: "Open local traces with tool timing and token audits",
  },
];

const USE_CASES = [
  {
    tag: "Financial Support",
    title: "Fee Payment Outages & Deadlines",
    scenario: "A student encounters a payment gateway error at 11:30 PM on the due date.",
    resolution: "CampusPilot cites Handbook Section 4.2 granting an automatic penalty-free grace period until 5:00 PM the next business day.",
  },
  {
    tag: "Academic Records",
    title: "Exam Scheduling & Clash Resolution",
    scenario: "A student needs to plan travel around mid-semester exams and official recess.",
    resolution: "The agent executes get_academic_calendar and provides dates for midterms (Nov 24) and winter break (Dec 18).",
  },
  {
    tag: "Campus Living",
    title: "Hostel Allotment & Leave Protocols",
    scenario: "A student asks about hostel room allocation policies not contained in the handbook.",
    resolution: "Instead of hallucinating hostel criteria, the agent gracefully clarifies that the handbook does not establish an answer.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-200">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <GlowOrb color="violet" className="-top-20 left-1/3 h-96 w-96 opacity-40" />
        <GlowOrb color="brand" className="top-40 -right-20 h-96 w-96 opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="cyan">Core Capabilities</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Engineered for every facet of{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              student success
            </span>
            .
          </motion.h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
            Discover the six core pillars powering CampusPilot AI, from deterministic tool invocation to verifiable handbook citations and zero-trust privacy.
          </p>
        </div>
      </section>

      {/* 6 Feature Pillars */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl transition hover:border-indigo-500/40 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-cyan-300 ring-1 ring-indigo-500/30">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge tone="cyan">{p.badge}</Badge>
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-bold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-navy-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="The CampusPilot Difference"
            title="Legacy University Portals vs. CampusPilot AI"
            subtitle="Why deterministic agentic engineering outperforms static websites and raw LLMs."
            center
          />

          <div className="mt-16 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  <th className="py-4 px-6 font-semibold text-white">Dimension</th>
                  <th className="py-4 px-6 font-semibold text-slate-400">Legacy University Portals</th>
                  <th className="py-4 px-6 font-semibold text-cyan-300">CampusPilot AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-6 font-medium text-white">{row.feature}</td>
                    <td className="py-4 px-6 text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-400 shrink-0" />
                        <span>{row.legacy}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-200">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="font-medium text-white">{row.campusPilot}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Real-World Student Use Cases */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Real-World Impact"
            title="Student Scenarios Solved in Milliseconds"
            subtitle="Common campus challenges resolved with deterministic certainty."
            center
          />

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {USE_CASES.map((uc) => (
              <GlassCard key={uc.title} hover={false} className="p-7">
                <Badge tone="cyan">{uc.tag}</Badge>
                <h3 className="mt-4 font-heading text-xl font-bold text-white">{uc.title}</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scenario</div>
                    <p className="text-slate-300 mt-1">{uc.scenario}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">CampusPilot Solution</div>
                    <p className="text-slate-200 mt-1 leading-relaxed">{uc.resolution}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 border-t border-white/[0.08]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge tone="cyan">Ready to test these capabilities?</Badge>
          <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
            Launch your personal assistant now
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Ask about fees, search the student handbook, or verify upcoming campus milestones with zero friction.
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
