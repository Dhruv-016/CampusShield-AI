"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Code, ExternalLink, FileText, Layers, ShieldCheck, Terminal } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GlowOrb, MagneticButton } from "@/components/effects";
import { Badge, GlassCard, SectionHeading } from "@/components/ui";

const FILES = [
  { file: "README.md", summary: "Complete project overview, setup commands, and architectural diagram", category: "Core" },
  { file: "docs/ARCHITECTURE.md", summary: "Component topology, SQLite persistence schema, and API contracts", category: "System" },
  { file: "docs/AGENT_FLOW.md", summary: "LangGraph state machine, nodes, conditional routing, and fallback guards", category: "Agent" },
  { file: "docs/RETRIEVAL.md", summary: "Heading-preserving chunking methodology, BM25 indexing, and score thresholds", category: "RAG" },
  { file: "docs/MEMORY_AND_PRIVACY.md", summary: "Deduplicated preference memory rules, regex redaction patterns, and privacy policies", category: "Safety" },
  { file: "docs/TRACING_AND_EVALUATION.md", summary: "Execution tracing specifications, token attribution, and 10-scenario evaluation", category: "Eval" },
  { file: "docs/LOCAL_SETUP.md", summary: "Step-by-step local installation instructions for macOS, Linux, and Windows", category: "Dev" },
  { file: "docs/DEMO_SCRIPT.md", summary: "Instructor verification walkthrough and test query sequence", category: "Demo" },
  { file: "docs/LIMITATIONS.md", summary: "Honest academic disclosure of known boundaries and lexical search trade-offs", category: "Auditing" },
];

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-200">
      <Navbar />

      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
        <GlowOrb color="brand" className="-top-20 left-1/3 h-96 w-96 opacity-30" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="cyan">Technical Documentation</Badge>
          <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            System Architecture & Guides
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            All primary architectural specifications and design documents are version-controlled in the repository. Interactive API documentation is available via FastAPI Swagger.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition"
            >
              <Terminal className="h-4 w-4" />
              <span>FastAPI Swagger Explorer (Port 8000)</span>
              <ExternalLink className="h-3.5 w-3.5 text-cyan-300" />
            </a>
          </div>
        </div>
      </section>

      <section className="relative py-12 pb-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {FILES.map((doc) => (
              <GlassCard key={doc.file} hover={true} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-cyan-300 ring-1 ring-indigo-500/30">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold text-white">
                        {doc.file}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {doc.summary}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Badge tone="blue">{doc.category}</Badge>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="mt-12 text-center">
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
