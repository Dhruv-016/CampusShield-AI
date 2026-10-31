import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core dark surfaces
        navy: { 950: "#050510", 900: "#0a0a1a", 800: "#111127", 700: "#1a1a3e", 600: "#252560" },
        // Brand gradient endpoints
        brand: { DEFAULT: "#6366f1", dark: "#4F46E5", light: "#818cf8" },
        violet: { DEFAULT: "#7C3AED", dark: "#6D28D9", light: "#A78BFA" },
        cyan2: { DEFAULT: "#06B6D4", dark: "#0891B2", light: "#22D3EE" },
        // Surfaces & glass
        glass: { DEFAULT: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)", hover: "rgba(255,255,255,0.1)" },
      },
      fontFamily: {
        heading: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 6vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display": ["clamp(2.25rem, 4.5vw, 3.75rem)", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-sm": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" }],
        "heading": ["clamp(1.25rem, 2vw, 1.75rem)", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" }],
      },
      spacing: { 18: "4.5rem", 22: "5.5rem", 88: "22rem", 128: "32rem" },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" },
      boxShadow: {
        glow: "0 0 40px rgba(99, 102, 241, 0.15)",
        "glow-lg": "0 0 80px rgba(99, 102, 241, 0.2)",
        "glow-violet": "0 0 60px rgba(124, 58, 237, 0.2)",
        "glow-cyan": "0 0 60px rgba(6, 182, 212, 0.15)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.5)",
        "inner-glow": "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #4F46E5, #7C3AED, #06B6D4)",
        "gradient-brand-h": "linear-gradient(90deg, #4F46E5, #7C3AED, #06B6D4)",
        "gradient-text": "linear-gradient(135deg, #818cf8, #c084fc, #22d3ee)",
        "noise": "url('/noise.svg')",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite",
        "float-reverse": "float-reverse 8s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient": "gradient 8s ease infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
      },
      keyframes: {
        float: { "0%, 100%": { transform: "translate3d(0, 0, 0)" }, "50%": { transform: "translate3d(0, -20px, 0)" } },
        "float-reverse": { "0%, 100%": { transform: "translate3d(0, 0, 0)" }, "50%": { transform: "translate3d(0, 20px, 0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        gradient: { "0%, 100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        "pulse-glow": { "0%, 100%": { opacity: "0.4" }, "50%": { opacity: "0.8" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-down": { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        "marquee-reverse": { "0%": { transform: "translateX(-50%)" }, "100%": { transform: "translateX(0)" } },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      zIndex: { 60: "60", 70: "70", 80: "80" },
    },
  },
  plugins: [],
};
export default config;
