"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Code2,
  Cpu,
  GraduationCap,
  HeartHandshake,
  Layers,
  Lock,
  Microscope,
  Milestone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TiltCard, GlowOrb, MagneticButton } from "@/components/effects";
import { Badge, GlassCard, SectionHeading } from "@/components/ui";

const TIMELINE = [
  {
    period: "Phase 1 · Foundation",
    title: "Static Portals & Rule Engines",
    description:
      "Traditional university websites relied on confusing PDF handbooks and siloed database portals with no contextual intelligence.",
    icon: Milestone,
  },
  {
    period: "Phase 2 · Agentic AI Discovery",
    title: "LangGraph State Machine Architecture",
    description:
      "Designed a cycle-free cyclic-guarded agent state machine with deterministic routing, 2-tool caps, and dedicated evidence grounding nodes.",
    icon: Cpu,
  },
  {
    period: "Phase 3 · Observability & Safety",
    title: "Lexical BM25 & Zero-Trust Redaction",
    description:
      "Integrated heading-preserving chunk retrieval and client/server regex sanitization to permanently eliminate hallucinated policies and secret leakage.",
    icon: ShieldCheck,
  },
  {
    period: "Phase 4 · Future Roadmap",
    title: "CampusShield AI (Assignment 2)",
    description:
      "Upcoming expansion introducing multi-agent approvals, human-in-the-loop workflows, and cryptographic audit trails for high-stakes institutional operations.",
    icon: Rocket,
  },
];

const VALUES = [
  {
    title: "Radical Grounding",
    desc: "If evidence does not exist in the verified handbook, the system will explicitly say so. We never invent campus regulations.",
    icon: Microscope,
  },
  {
    title: "Zero-Trust Privacy",
    desc: "Student credentials, OTPs, card numbers, and tokens are scrubbed before storage or model exposure. Privacy is not an afterthought.",
    icon: Lock,
  },
  {
    title: "Deterministic Predictability",
    desc: "Fixed routes and bounded context budgets guarantee high reliability, sub-120ms local response times, and predictable compute costs.",
    icon: Layers,
  },
  {
    title: "Open Observability",
    desc: "Every query records latency, evidence IDs, and token attribution. Transparency empowers student trust and faculty auditing.",
    icon: EyeIcon,
  },
];

function EyeIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

const STACK = [
  { name: "LangGraph", desc: "Agent State Machine & Routing", category: "Agent Core" },
  { name: "FastAPI", desc: "High-performance Async Python API", category: "Backend" },
  { name: "Next.js 14", desc: "App Router & React Server Components", category: "Frontend" },
  { name: "Tailwind CSS", desc: "Design System & Tokens", category: "Styling" },
  { name: "Framer Motion", desc: "Spring Physics & Micro-interactions", category: "Motion" },
  { name: "SQLAlchemy", desc: "ORM & Local Tracing Database", category: "Data" },
  { name: "BM25 Retriever", desc: "Lexical Heading-Aware Search", category: "RAG Engine" },
  { name: "Groq Cloud", desc: "Ultra-fast Llama Inference (Optional)", category: "Inference" },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-200">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <GlowOrb color="brand" className="-top-20 left-1/4 h-96 w-96 opacity-40" />
        <GlowOrb color="violet" className="top-20 -right-20 h-96 w-96 opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="cyan">Mission & Architecture</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Pioneering verified AI for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              higher education
            </span>
            .
          </motion.h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
            CampusPilot AI was developed as an academic exploration into deterministic agentic AI engineering: marrying state machines, lexical retrieval, and zero-trust privacy to empower university students.
          </p>
        </div>
      </section>

      {/* Mission & Vision Bento */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <GlassCard hover={false} className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-cyan-300 ring-1 ring-indigo-500/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="mt-6 font-heading text-2xl font-bold text-white">Our Mission</h2>
              <p className="mt-3 text-slate-300 leading-relaxed text-sm sm:text-base">
                To replace bureaucratic friction and ambiguous campus PDFs with a responsive, trustworthy assistant that delivers instant, verifiable answers about finances, academics, and official university statutes.
              </p>
            </GlassCard>

            <GlassCard hover={false} className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-indigo-300 ring-1 ring-violet-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-6 font-heading text-2xl font-bold text-white">Our Vision</h2>
              <p className="mt-3 text-slate-300 leading-relaxed text-sm sm:text-base">
                A modern campus where every student has an autonomous academic co-pilot capable of reasoning over complex semester rules while upholding the highest ethical standards in student data protection.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="relative py-24 sm:py-32 border-t border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Project Evolution"
            title="The journey to intelligent campus support."
            subtitle="From conceptual assignment to award-caliber agentic architecture."
            center
          />

          <div className="mt-16 relative">
            {/* Center connecting line on desktop */}
            <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-indigo-500 via-violet-500 to-cyan-500/20" />

            <div className="space-y-12">
              {TIMELINE.map((item, idx) => {
                const Icon = item.icon;
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={item.period}
                    className={`flex flex-col lg:flex-row items-center gap-8 ${
                      isEven ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex-1 w-full lg:w-1/2">
                      <div className={`p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl ${isEven ? "lg:text-left" : "lg:text-right"}`}>
                        <Badge tone="cyan">{item.period}</Badge>
                        <h3 className="mt-3 font-heading text-xl font-bold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-300 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Milestone node icon */}
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-indigo-400 bg-navy-900 text-cyan-300 shadow-xl shadow-indigo-500/20">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 hidden lg:block w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-navy-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Ethical Guiding Principles"
            title="Values that govern every token and node."
            subtitle="Built on accountability, student sovereignty, and algorithmic transparency."
            center
          />

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-cyan-300 ring-1 ring-indigo-500/30">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Technology Stack"
            title="Modern engineering from edge to model."
            subtitle="Engineered with industry-leading open source tools and async Python protocols."
            center
          />

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {STACK.map((tech) => (
              <div
                key={tech.name}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl transition hover:border-indigo-500/40 hover:bg-white/[0.05]"
              >
                <div className="text-xs font-mono text-cyan-400">{tech.category}</div>
                <div className="mt-2 font-heading text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {tech.name}
                </div>
                <div className="mt-1 text-xs text-slate-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator / Team CTA */}
      <section className="relative py-20 border-t border-white/[0.08] bg-gradient-to-b from-navy-900/60 to-navy-950">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge tone="cyan">Agentic AI Engineering · System Architecture</Badge>
          <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
            Explore the live application now.
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            No signup needed. Instantly interact with Aarav Mehta&apos;s demo profile, review real traces, and trigger the 10-scenario evaluation benchmark.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <MagneticButton
              as="a"
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              <span>Launch Student Assistant</span>
              <ArrowRight className="h-4 w-4 text-cyan-300" />
            </MagneticButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
