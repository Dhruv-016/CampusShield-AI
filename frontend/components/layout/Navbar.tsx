"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui";

/* ------------------------------------------------------------------ */
/*  Navigation link definitions                                       */
/* ------------------------------------------------------------------ */
const navLinks = [
  { label: "Features", href: "/features" },
  { label: "HITL Approvals", href: "/app/approvals" },
  { label: "Security Audit", href: "/app/audit" },
  { label: "A1 vs A2 Eval", href: "/app/evaluation" },
  { label: "Docs", href: "/docs" },
];

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                            */
/* ------------------------------------------------------------------ */
const mobileMenuVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const mobileLinkVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: { opacity: 0, y: -12, filter: "blur(4px)" },
};

/* ------------------------------------------------------------------ */
/*  Navbar component                                                  */
/* ------------------------------------------------------------------ */
export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* --- Scroll progress (thin gradient bar) --- */
  const { scrollYProgress } = useScroll();
  const [scrollProgress, setScrollProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
  });

  /* --- Detect scroll for glass-bg strengthening + height shrink --- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* --- Lock body scroll when mobile menu is open --- */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /** Check if a nav link is "active" */
  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* ---- Scroll progress bar ---- */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left"
        style={{
          scaleX: scrollProgress,
          background:
            "linear-gradient(90deg, #6366f1, #a855f7, #3b82f6, #6366f1)",
          backgroundSize: "200% 100%",
        }}
      />

      {/* ---- Navbar ---- */}
      <header
        className={`fixed top-[2px] left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-2 bg-navy-950/80 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/20"
            : "py-4 bg-transparent backdrop-blur-sm"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* --- Logo --- */}
          <Link href="/" className="relative z-10 flex items-center gap-2">
            <Logo />
          </Link>

          {/* --- Desktop nav links (center) --- */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(href)
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                  {/* Active indicator dot */}
                  {isActive(href) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* --- Desktop right actions --- */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/app"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Assistant</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-cyan-300" />
            </Link>
          </div>

          {/* --- Mobile hamburger button --- */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="relative z-10 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </header>

      {/* ---- Mobile menu overlay ---- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-navy-950/90 backdrop-blur-2xl md:hidden"
          >
            <motion.ul
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center gap-6"
            >
              {navLinks.map(({ label, href }) => (
                <motion.li key={href} variants={mobileLinkVariants}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-2xl font-semibold transition-colors ${
                      isActive(href)
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}

              {/* Divider */}
              <motion.li
                variants={mobileLinkVariants}
                className="h-px w-24 bg-white/[0.1]"
              />

              {/* CTA links */}
              <motion.li variants={mobileLinkVariants}>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Sign In
                </Link>
              </motion.li>

              <motion.li variants={mobileLinkVariants}>
                <Link
                  href="/app"
                  onClick={() => setMobileOpen(false)}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                >
                  Launch Assistant
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 text-cyan-300" />
                </Link>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
