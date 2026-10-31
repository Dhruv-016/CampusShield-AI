"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GlowOrb, MagneticButton } from "@/components/effects";
import { Badge, GlassCard, SectionHeading, Btn } from "@/components/ui";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-200">
      <Navbar />

      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <GlowOrb color="brand" className="-top-20 left-1/4 h-96 w-96 opacity-40" />
        <GlowOrb color="cyan" className="top-40 -right-20 h-96 w-96 opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="cyan">Support & Inquiries</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            We&apos;re here to help you{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              succeed
            </span>
            .
          </motion.h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
            Have questions about CampusPilot AI architecture, policy ingestion, or academic integration? Reach out to our engineering lab.
          </p>
        </div>
      </section>

      <section className="relative py-12 pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Information & Lab Info */}
            <div className="space-y-8">
              <GlassCard hover={false} className="p-8 space-y-6">
                <h2 className="font-heading text-2xl font-bold text-white">
                  Academic Engineering Lab
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  CampusPilot AI is maintained under the Agentic AI Engineering curriculum. For student feedback, bug reports, or evaluation queries, utilize the channels below.
                </p>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Email Address</div>
                      <div className="text-slate-400">support@campuspilot.local</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Campus Location</div>
                      <div className="text-slate-400">Department of AI & Data Systems · Room 402</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Evaluation Office Hours</div>
                      <div className="text-slate-400">Monday & Thursday: 2:00 PM – 5:00 PM IST</div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Quick FAQ Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                  <HelpCircle className="h-4 w-4" />
                  <span>Looking for quick answers?</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Most policy questions regarding exam schedules and tuition deadlines are already indexed in our Knowledge Base.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    href="/how-it-works"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    View System Workflow →
                  </Link>
                  <Link
                    href="/docs"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    Read Documentation →
                  </Link>
                </div>
              </div>
            </div>

            {/* Interactive Message Form */}
            <GlassCard hover={false} className="p-8">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white">
                    Message Dispatched!
                  </h3>
                  <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. In this academic demonstration environment, messages are simulated and handled directly by the demo agent.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                    className="mt-4 text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-heading text-xl font-bold text-white">
                    Send a Message
                  </h2>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aarav Mehta"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav.mehta@university.edu"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Question regarding BM25 threshold evaluation"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Message Content
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist your research or campus experience?"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none"
                    />
                  </div>

                  <Btn type="submit" className="w-full mt-2">
                    <Send className="h-4 w-4 mr-2" />
                    <span>Send Message</span>
                  </Btn>
                </form>
              )}
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
