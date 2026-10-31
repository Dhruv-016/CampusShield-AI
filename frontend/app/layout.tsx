import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import CustomCursor from "@/components/CustomCursor";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "CampusShield AI — Safe & Production-Aware Student Support Agent (Assignment 2)",
  description:
    "Institutional agentic AI co-pilot for university campus life: code-level authorization (RBAC), human-in-the-loop approvals, immutable security audit logging, and grounded policy retrieval.",
  keywords: ["CampusShield", "Agentic AI", "Safety Guardrails", "RBAC", "Human-in-the-loop", "LangGraph", "FastAPI"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy-950 text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-white">
        <Providers>
          <CustomCursor />
          {children}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
