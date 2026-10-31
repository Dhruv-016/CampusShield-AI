"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo, Badge, Btn } from "@/components/ui";
import { GlowOrb } from "@/components/effects";
import { authLogin, authDemo, ApiError } from "@/lib/api";

const QUOTES = [
  {
    quote: "Education is not the learning of facts, but the training of the mind to think.",
    author: "Albert Einstein",
  },
  {
    quote: "The future belongs to those who prepare for it today.",
    author: "Malcolm X",
  },
  {
    quote: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteIdx] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both your university email address and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authLogin({
        email: email.trim(),
        password,
      });
      router.push("/app");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Sign in failed. Please check your network and credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await authDemo();
      router.push("/app");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to launch demo session. Please try again.");
      }
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-950 text-slate-200">
      {/* Left Artwork Column */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-navy-900 via-indigo-950/40 to-navy-950 p-12 flex-col justify-between border-r border-white/10">
        <GlowOrb color="brand" className="-top-20 -left-20 h-96 w-96 opacity-50" />
        <GlowOrb color="violet" className="bottom-10 right-10 h-80 w-80 opacity-40" />

        <div className="relative z-10">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        {/* Center Artwork / 3D Hologram Mock */}
        <div className="relative z-10 my-auto text-center">
          <motion.div
            animate={{
              y: [-8, 8, -8],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-2xl shadow-indigo-500/30"
          >
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-navy-950/90 backdrop-blur-xl">
              <GraduationCap className="h-16 w-16 text-cyan-300" />
            </div>
          </motion.div>

          <h2 className="mt-8 font-heading text-3xl font-bold text-white">
            Welcome back to CampusPilot
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            Your university companion for fees, policies, and semester calendars.
          </p>

          {/* Rotating Quote */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md max-w-md mx-auto text-left">
            <p className="text-sm italic text-slate-300 leading-relaxed">
              &ldquo;{QUOTES[quoteIdx].quote}&rdquo;
            </p>
            <div className="mt-3 text-xs font-semibold text-cyan-400">
              — {QUOTES[quoteIdx].author}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>Official University Portal</span>
          <span>Zero-Trust Privacy</span>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Return to Homepage
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md my-auto py-8">
          <div className="space-y-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Sign in to your account
            </h1>
            <p className="text-sm text-slate-400">
              Access your student assistant or launch the instant demo workspace.
            </p>
          </div>

          {/* Quick Demo Access Pill */}
          <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-cyan-300">Instant Demo Session</div>
                <div className="text-xs text-slate-400 mt-0.5">Explore full features with synthetic student data</div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow disabled:opacity-50"
              >
                {demoLoading ? "Launching…" : "Launch Demo →"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="student@university.edu"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Btn
              type="submit"
              disabled={loading || demoLoading}
              className="w-full mt-2"
            >
              {loading ? "Authenticating…" : "Sign In to Student Portal"}
            </Btn>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-cyan-400 hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CampusPilot AI · Official University Services
        </div>
      </div>
    </div>
  );
}
