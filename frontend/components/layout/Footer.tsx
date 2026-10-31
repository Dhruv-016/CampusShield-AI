"use client";

import Link from "next/link";
import { Logo } from "@/components/ui";
import { Send } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Footer column definitions                                         */
/* ------------------------------------------------------------------ */
const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Student Assistant", href: "/app" },
      { label: "Knowledge Base", href: "/app/knowledge" },
      { label: "Traces & Observability", href: "/app/traces" },
      { label: "Model Evaluation", href: "/app/evaluation" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Agentic Architecture", href: "/how-it-works" },
      { label: "FastAPI Swagger", href: "http://localhost:8000/docs", external: true },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "About CampusPilot", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Capabilities", href: "/features" },
      { label: "Support & Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal & Safety",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
] as const;

const socialLinks = [
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Footer component                                                  */
/* ------------------------------------------------------------------ */
export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-navy-900">
      {/* Noise texture overlay */}
      <div className="noise pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---- Top section: Logo + tagline + newsletter ---- */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/[0.06] py-12 md:flex-row md:items-center">
          <div className="max-w-md">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Your intelligent campus companion — powered by AI to help
              students navigate university life effortlessly.
            </p>
          </div>

          {/* Newsletter */}
          <div className="w-full max-w-sm">
            <p className="mb-2 text-sm font-medium text-slate-300">
              Stay updated
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 hover:brightness-110"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Subscribe</span>
              </button>
            </form>
          </div>
        </div>

        {/* ---- Middle section: 4-column link grid ---- */}
        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ---- Bottom section: copyright + socials ---- */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} CampusPilot AI. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-slate-500 transition-colors hover:text-white"
              >
                {social.icon}
              </a>
            ))}
          </div>

          <p className="text-sm text-slate-500">
            Built with <span className="text-red-400">❤️</span> for students
          </p>
        </div>
      </div>
    </footer>
  );
}
