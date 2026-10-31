"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo, Badge } from "@/components/ui";
import { api, authLogout, authMe, getStoredUser, StudentUser } from "@/lib/api";

const NAV = [
  { href: "/app", label: "Assistant", icon: MessageSquare },
  { href: "/app/approvals", label: "Human Approvals", icon: ShieldAlert, badge: "HITL" },
  { href: "/app/audit", label: "Security Audit Trail", icon: ShieldCheck, badge: "New" },
  { href: "/app/student", label: "My Student Info", icon: GraduationCap },
  { href: "/app/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/app/memory", label: "Memory & Privacy", icon: Brain },
  { href: "/app/traces", label: "Traces & Telemetry", icon: Activity },
  { href: "/app/evaluation", label: "Comparative Evaluation", icon: FlaskConical },
  { href: "/app/settings", label: "System Settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [live, setLive] = useState<boolean | null>(null);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());

    // Check backend status
    const check = () =>
      api<{ llm_configured: boolean }>("/status")
        .then((s) => {
          setOnline(true);
          setLive(s.llm_configured);
        })
        .catch(() => setOnline(false));

    check();
    const t = setInterval(check, 15000);

    // Fetch authenticated user profile
    authMe().then((res) => {
      if (res.authenticated && res.student) {
        setUser(res.student);
      }
    });

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const handleLogout = async () => {
    await authLogout();
    router.push("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "CP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const nav = (
    <nav aria-label="Main" className="flex-1 space-y-1 px-3 py-2">
      {NAV.map(({ href, label, icon: Icon, badge }) => {
        const active = href === "/app" ? path === "/app" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-transparent text-white border-l-2 border-indigo-400 font-semibold shadow-sm"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                active ? "text-cyan-300" : "text-slate-400 group-hover:text-white"
              }`}
            />
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span className="truncate">{label}</span>
                {badge && (
                  <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 ring-1 ring-indigo-500/30">
                    {badge}
                  </span>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4">
          <Link href="/">
            <Logo />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar width"
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Return to home link */}
        {!collapsed && (
          <div className="px-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Exit to Public Site</span>
            </Link>
          </div>
        )}

        {nav}
      </div>

      {/* Bottom Profile & Status Card */}
      <div className="mx-3 space-y-3">
        {!collapsed && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  suppressHydrationWarning
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 font-bold text-white text-xs shadow-md"
                >
                  {mounted ? getInitials(user?.name) : "CP"}
                </div>
                <div className="min-w-0 flex-1">
                  <div suppressHydrationWarning className="truncate text-xs font-semibold text-white">
                    {mounted ? (user?.name || "Student") : "Student"}
                  </div>
                  <div suppressHydrationWarning className="truncate font-mono text-[10px] text-slate-400">
                    {mounted ? (user?.id || "STU-ACTIVE") : "STU-ACTIVE"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge tone={mounted && user?.is_demo ? "amber" : "cyan"}>
                {mounted && user?.is_demo ? "Demo Mode" : "Official Account"}
              </Badge>
              <Badge tone={online ? "green" : online === false ? "red" : "slate"}>
                {online ? "API Online" : online === false ? "API Offline" : "Checking…"}
              </Badge>
              {online && (
                <Badge tone={live ? "green" : "amber"}>
                  {live ? "Live LLM" : "Limited Mode"}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Small icon indicator if collapsed */}
        {collapsed && (
          <div className="flex flex-col items-center gap-2 py-2">
            <span
              className={`h-3 w-3 rounded-full ${
                online ? "bg-emerald-400" : online === false ? "bg-red-400" : "bg-slate-400"
              }`}
              title={online ? "Backend Online" : "Backend Offline"}
            />
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1 text-slate-400 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-navy-950 text-slate-200">
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-white/[0.08] bg-navy-950/70 backdrop-blur-2xl transition-all duration-300 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-navy-950 border-r border-white/10 shadow-2xl transition duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between border-b border-white/[0.08] bg-navy-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="p-1 rounded-lg text-slate-300 hover:text-white"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Logo />
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Offline Alert Banner */}
        {online === false && (
          <div
            role="alert"
            className="border-b border-red-500/20 bg-red-500/10 px-4 py-2.5 text-center text-xs font-medium text-red-300"
          >
            Backend unreachable on port 8000. Start it with{" "}
            <code className="bg-white/10 px-1 py-0.5 rounded font-mono">
              uvicorn app.main:app --reload --port 8000
            </code>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>

        <footer className="border-t border-white/[0.06] px-4 py-3 text-center text-xs text-slate-500">
          CampusPilot AI · Private student support assistant · Zero-trust telemetry
        </footer>
      </div>
    </div>
  );
}
