"use client";

import { ReactNode, InputHTMLAttributes, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Inbox,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* ──────────────────────────────────────────────
   Utility: cn() — merge Tailwind classes safely
   ────────────────────────────────────────────── */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

/* ──────────────────────────────────────────────
   1. Logo — SVG with gradient accent
   dark prop preserved for API compat; always renders bright variant
   ────────────────────────────────────────────── */
export function Logo({ dark: _dark }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="0.5" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="logo-shine" x1="8" y1="4" x2="28" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.25" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Rounded square background */}
        <rect width="36" height="36" rx="10" fill="url(#logo-grad)" />
        <rect width="36" height="36" rx="10" fill="url(#logo-shine)" />
        {/* Mortarboard cap shape */}
        <path
          d="M18 8L6 14l12 6 12-6-12-6z"
          fill="white"
          fillOpacity="0.95"
        />
        <path
          d="M10 17v6c0 2 3.5 4 8 4s8-2 8-4v-6l-8 4-8-4z"
          fill="white"
          fillOpacity="0.85"
        />
        {/* Tassel line */}
        <path
          d="M26 14v8"
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="26" cy="23" r="1.2" fill="white" fillOpacity="0.7" />
      </svg>
      <span className="font-heading text-[1.15rem] font-bold tracking-tight text-white flex items-center gap-1.5">
        <span>Campus<span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">Shield</span></span>
        <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300">SAFE</span>
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   2. Card — Glass card with backdrop-blur
   ────────────────────────────────────────────── */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/[0.04] backdrop-blur-xl",
        "border border-white/[0.08] shadow-lg shadow-black/20",
        "transition-colors duration-300 hover:border-white/[0.12]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   3. Reveal — Framer Motion fade-up with blur
   ────────────────────────────────────────────── */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   4. Badge — Dark-theme pill badges
   ────────────────────────────────────────────── */
const badgeTones: Record<string, string> = {
  slate:
    "bg-slate-500/15 text-slate-300 ring-slate-500/20",
  blue:
    "bg-blue-500/15 text-blue-300 ring-blue-500/20",
  green:
    "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20",
  amber:
    "bg-amber-500/15 text-amber-300 ring-amber-500/20",
  red:
    "bg-red-500/15 text-red-300 ring-red-500/20",
  cyan:
    "bg-cyan-500/15 text-cyan-300 ring-cyan-500/20",
};

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "blue" | "green" | "amber" | "red" | "cyan";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
        "text-xs font-medium tracking-wide ring-1 ring-inset",
        badgeTones[tone] ?? badgeTones.slate
      )}
    >
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────
   5. Btn — Primary / Ghost / Danger button
   ────────────────────────────────────────────── */
export function Btn({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  "aria-label"?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050510] disabled:pointer-events-none disabled:opacity-40";

  const variants: Record<string, string> = {
    primary: cn(
      "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%]",
      "text-white shadow-lg shadow-indigo-500/25",
      "hover:bg-[position:100%_0] hover:shadow-indigo-500/40 hover:scale-[1.02]",
      "active:scale-[0.98]"
    ),
    ghost: cn(
      "bg-white/[0.04] border border-white/[0.1] text-slate-200",
      "hover:bg-white/[0.08] hover:border-white/[0.16] hover:text-white",
      "active:scale-[0.98]"
    ),
    danger: cn(
      "bg-red-500/15 border border-red-500/25 text-red-300",
      "hover:bg-red-500/25 hover:border-red-500/40 hover:text-red-200",
      "active:scale-[0.98]"
    ),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────
   6. Spinner — Animated loader with glow
   ────────────────────────────────────────────── */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 relative" />
      </div>
      {label && (
        <p className="text-sm text-slate-400 animate-pulse">{label}</p>
      )}
      <span className="sr-only">{label ?? "Loading…"}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   7. ErrorBox — Dark error alert
   ────────────────────────────────────────────── */
export function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-red-500/20 bg-red-500/[0.08] backdrop-blur-xl",
        "p-5 text-sm shadow-lg shadow-red-500/5"
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
        <div className="flex-1 space-y-2">
          <p className="font-medium text-red-300">Something went wrong</p>
          <p className="text-red-300/80 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
                "text-xs font-medium text-red-300",
                "bg-red-500/10 border border-red-500/20",
                "hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
              )}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   8. Empty — Empty state with dashed glass border
   ────────────────────────────────────────────── */
export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
        "rounded-2xl border-2 border-dashed border-white/[0.08]",
        "bg-white/[0.02]"
      )}
    >
      <div className="rounded-2xl bg-white/[0.04] p-4">
        <Inbox className="h-8 w-8 text-slate-500" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
        <p className="max-w-sm text-sm text-slate-400 leading-relaxed">{text}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   9. PageTitle — Section title with gradient text
   ────────────────────────────────────────────── */
export function PageTitle({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        {sub && (
          <p className="text-sm text-slate-400 leading-relaxed">{sub}</p>
        )}
      </div>
      {action && <div className="mt-3 sm:mt-0">{action}</div>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   10. fmtDate — Format ISO date string
   ────────────────────────────────────────────── */
export const fmtDate = (s?: string | null): string => {
  if (!s) return "\u2014";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "\u2014";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* ═══════════════════════════════════════════════
   NEW COMPONENTS
   ═══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   11. GlassCard — Enhanced glass card with
       spotlight border effect on hover
   ────────────────────────────────────────────── */
export function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "bg-white/[0.04] backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-lg shadow-black/20",
        "transition-colors duration-300",
        hover && "hover:border-white/[0.14]",
        className
      )}
    >
      {/* Spotlight gradient that follows group hover */}
      {hover && (
        <div
          className={cn(
            "pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500",
            "group-hover:opacity-100",
            "rounded-2xl",
            "bg-[radial-gradient(600px_circle_at_var(--mouse-x,50%)_var(--mouse-y,0%),rgba(99,102,241,0.08),transparent_50%)]"
          )}
          aria-hidden
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   12. SectionHeading — Big section heading
       with optional badge above
   ────────────────────────────────────────────── */
export function SectionHeading({
  title,
  subtitle,
  badge,
  center = false,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("space-y-3", center && "text-center")}>
      {badge && (
        <Badge tone="cyan">{badge}</Badge>
      )}
      <h2
        className={cn(
          "font-heading text-2xl font-bold tracking-tight sm:text-3xl",
          "bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-base text-slate-400 leading-relaxed",
            center && "mx-auto text-center"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   13. Input — Glass-styled input with label & error
   ────────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl bg-white/[0.05] backdrop-blur-sm px-4 py-2.5",
            "border text-sm text-white placeholder:text-slate-500",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#050510]",
            error
              ? "border-red-500/40 focus:ring-red-500/40"
              : "border-white/[0.1] focus:border-indigo-500/50 focus:ring-indigo-500/40 hover:border-white/[0.16]",
            className
          )}
          {...rest}
        />
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-red-400 pt-0.5"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = "Input";

/* ──────────────────────────────────────────────
   14. Skeleton — Shimmer skeleton loader
   ────────────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/[0.06]",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent",
        "before:animate-[shimmer_2s_infinite]",
        "before:-translate-x-full",
        className
      )}
      aria-hidden
    />
  );
}
