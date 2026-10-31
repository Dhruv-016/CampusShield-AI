"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GlowOrb } from "@/components/effects";
import { Badge } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-200">
      <Navbar />

      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
        <GlowOrb color="brand" className="-top-20 left-1/4 h-96 w-96 opacity-30" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="cyan">Privacy & Data Governance</Badge>
          <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-slate-400">
            Last Updated: October 2026 · CampusPilot Platform Specification
          </p>
        </div>
      </section>

      <section className="relative py-12 pb-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert prose-indigo max-w-none space-y-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">1. Academic Demonstration Nature</h2>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                CampusPilot AI is an educational project created for the Agentic AI Engineering curriculum. All student records, fee amounts, payment transaction dates, and calendar events are 100% synthetic mock fixtures. This platform is not connected to any official university production registry.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-heading">2. Proactive Sensitive-Data Redaction</h2>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                The application operates a zero-trust sanitization pipeline. Before any user prompt enters conversation history, agent context, local trace storage, or the language model, regular expression filters sweep for:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-slate-300 space-y-1">
                <li>One-Time Passwords (OTPs) and 6-digit verification codes</li>
                <li>Payment card numbers (Visa, Mastercard, RuPay patterns)</li>
                <li>Bearer tokens, API keys, and Authorization headers</li>
                <li>Plaintext password declarations</li>
              </ul>
              <p className="text-sm text-slate-400 mt-2 italic">
                Notice: Regex detection is best-effort and heuristic. Users are instructed never to input real production passwords or financial credentials.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-heading">3. Persistent Preference Memory</h2>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                The system provides an explicit long-term memory feature. Only non-sensitive operational preferences are preserved:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-slate-300 space-y-1">
                <li>Response brevity preference (e.g., &quot;concise explanations&quot;)</li>
                <li>Language preferences</li>
                <li>Academic programme focus</li>
              </ul>
              <p className="text-sm text-slate-300 mt-2">
                Memories are deduplicated and strictly capped at 25 items per student ID. You can view, audit, or permanently delete all saved preferences at any time from the Memory dashboard.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-heading">4. Local Traces & Observability</h2>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                To fulfill academic observability mandates, every chat execution generates an execution trace in the local SQLite database. Recorded fields include execution latency (ms), tool invocation status, retrieved chunk IDs, and provider-reported token usage. User prompts in traces are stored exclusively in redacted form.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-heading">5. External Model Providers</h2>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                When running in live inference mode, prompts are routed to Groq Cloud using encrypted TLS connections. If no API key is configured, the system executes in Limited Mode, maintaining 100% offline data confinement on your local machine.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
              <span>CampusPilot AI Safety Compliance</span>
              <Link href="/terms" className="text-cyan-400 hover:underline">
                Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
