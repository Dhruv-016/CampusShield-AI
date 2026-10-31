"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { Logo, Badge, Btn } from "@/components/ui";
import { GlowOrb } from "@/components/effects";
import { authRegister, authDemo, ApiError } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [programme, setProgramme] = useState("Computer Science");
  const [semester, setSemester] = useState("Semester 1");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s += 25;
    if (/[A-Z]/.test(p)) s += 25;
    if (/[0-9]/.test(p)) s += 25;
    if (/[^A-Za-z0-9]/.test(p)) s += 25;
    return s;
  };
  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please complete all registration fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authRegister({
        name: name.trim(),
        email: email.trim(),
        password,
        programme,
        semester,
      });
      router.push("/app");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Registration failed. Please check your credentials and try again.");
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
      {/* Left Artwork */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-navy-900 via-indigo-950/40 to-navy-950 p-12 flex-col justify-between border-r border-white/10">
        <GlowOrb color="cyan" className="-top-20 -left-20 h-96 w-96 opacity-40" />
        <GlowOrb color="violet" className="bottom-10 right-10 h-80 w-80 opacity-40" />

        <div className="relative z-10">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="relative z-10 my-auto text-center">
          <motion.div
            animate={{
              scale: [1, 1.04, 1],
              rotate: [0, -2, 2, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 p-0.5 shadow-2xl shadow-cyan-500/20"
          >
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-navy-950/90 backdrop-blur-xl">
              <ShieldCheck className="h-16 w-16 text-cyan-300" />
            </div>
          </motion.div>

          <h2 className="mt-8 font-heading text-3xl font-bold text-white">
            Join CampusPilot Student Intelligence
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            Evidence-grounded assistance. Instant fee verification. Verified handbook citations.
          </p>

          <div className="mt-8 space-y-2 max-w-sm mx-auto text-left text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Full access to the LangGraph AI Student Co-pilot</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Automated fee balance & payment schedule checks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Local trace recording & evaluation audit logs</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>Official University Portal</span>
          <span>Zero-Trust Privacy</span>
        </div>
      </div>

      {/* Right Form */}
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
              Create student account
            </h1>
            <p className="text-sm text-slate-400">
              Register with your university email or launch the instant demo.
            </p>
          </div>

          {/* Quick Demo Access Pill */}
          <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-cyan-300">Want to test without registering?</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Explore with pre-seeded demo student data</div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition shadow disabled:opacity-50"
              >
                {demoLoading ? "Launching…" : "Demo Mode →"}
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
              <label htmlFor="signup-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Alex Vance"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="student@university.edu"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Only institutional domain accounts (@university.edu) are accepted.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-programme" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Programme
                </label>
                <input
                  id="signup-programme"
                  type="text"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label htmlFor="signup-semester" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Semester
                </label>
                <input
                  id="signup-semester"
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Semester 1"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password (minimum 8 characters)
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
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

              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength <= 25
                          ? "bg-red-500 w-1/4"
                          : strength <= 50
                          ? "bg-amber-500 w-2/4"
                          : strength <= 75
                          ? "bg-cyan-500 w-3/4"
                          : "bg-emerald-500 w-full"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Security rating</span>
                    <span>{strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Good" : "Strong"}</span>
                  </div>
                </div>
              )}
            </div>

            <Btn
              type="submit"
              disabled={loading || demoLoading}
              className="w-full mt-2"
            >
              {loading ? "Creating Student Account…" : "Create Student Account"}
            </Btn>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Already registered?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline font-medium">
              Sign in to your account
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CampusPilot AI · University Systems
        </div>
      </div>
    </div>
  );
}
