"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Home, MessageSquare, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GlowOrb, MagneticButton } from "@/components/effects";
import { Badge } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-200 flex flex-col justify-between">
      <Navbar />

      <main className="relative flex-1 flex items-center justify-center px-4 py-32 overflow-hidden">
        <GlowOrb color="brand" className="top-1/3 left-1/3 h-96 w-96 opacity-30" />
        <GlowOrb color="cyan" className="bottom-1/4 right-1/4 h-80 w-80 opacity-20" />

        <div className="relative z-10 max-w-xl text-center">
          <Badge tone="cyan">HTTP 404 Error</Badge>

          {/* Animated 404 Display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mt-6"
          >
            <div className="font-heading text-8xl sm:text-9xl font-extrabold tracking-tighter bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-300 bg-clip-text text-transparent select-none">
              404
            </div>
          </motion.div>

          <h1 className="mt-4 font-heading text-2xl sm:text-3xl font-bold text-white">
            Lost on campus grounds?
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            The route or campus document you are searching for does not exist in our registry. Our agent can guide you back to familiar territory.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              as="a"
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              <Home className="h-4 w-4" />
              <span>Back to Campus Home</span>
            </MagneticButton>

            <MagneticButton
              as="a"
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-300 hover:border-white/20 hover:text-white"
            >
              <MessageSquare className="h-4 w-4 text-cyan-300" />
              <span>Open Student Assistant</span>
            </MagneticButton>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <Link href="/features" className="hover:text-white transition">Features</Link>
            <Link href="/how-it-works" className="hover:text-white transition">How It Works</Link>
            <Link href="/docs" className="hover:text-white transition">Documentation</Link>
            <Link href="/contact" className="hover:text-white transition">Support Lab</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
