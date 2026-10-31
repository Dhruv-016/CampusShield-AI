"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (latest) => {
      setProgress(latest);
      setShow(latest > 0.15);
    });
    return () => unsub();
  }, [scrollYProgress]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-navy-900/80 text-white shadow-xl shadow-indigo-500/10 backdrop-blur-xl transition hover:border-indigo-500/40 hover:bg-navy-800"
        >
          {/* Circular progress SVG */}
          <svg className="absolute inset-0 -rotate-90" width="48" height="48">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-white/10"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="url(#progress-gradient)"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray="125.66"
              strokeDashoffset={125.66 - 125.66 * progress}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <ArrowUp className="h-4 w-4 text-cyan-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
