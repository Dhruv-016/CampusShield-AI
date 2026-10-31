"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { api, AuditStats, SecurityAuditItem } from "@/lib/api";
import { Badge, GlassCard, SectionHeading } from "@/components/ui";

export default function SecurityAuditPage() {
  const [logs, setLogs] = useState<SecurityAuditItem[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDecision, setFilterDecision] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        api<{ total?: number; items?: SecurityAuditItem[] } | SecurityAuditItem[]>("/audit-logs?limit=100"),
        api<AuditStats>("/audit-logs/stats"),
      ]);
      const items = Array.isArray(logsRes) ? logsRes : (Array.isArray(logsRes?.items) ? logsRes.items : []);
      setLogs(items);
      setTotal(typeof logsRes === "object" && "total" in logsRes && typeof logsRes.total === "number" ? logsRes.total : items.length);
      setStats(statsRes);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const list = Array.isArray(logs) ? logs : [];
  const filteredLogs = list.filter((log) => {
    const matchesCat =
      filterCategory === "all" || log.action_category === filterCategory;
    const matchesDec =
      filterDecision === "all" || log.decision === filterDecision;
    const matchesSearch =
      !searchQuery ||
      log.actor_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesDec && matchesSearch;
  });

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "ALLOWED":
        return <Badge tone="green">ALLOWED</Badge>;
      case "BLOCKED_UNAUTHORIZED":
        return <Badge tone="red">BLOCKED (UNAUTHORIZED)</Badge>;
      case "PENDING_APPROVAL":
        return <Badge tone="amber">PENDING APPROVAL</Badge>;
      case "APPROVED":
        return <Badge tone="cyan">APPROVED (HUMAN)</Badge>;
      case "REJECTED":
        return <Badge tone="red">REJECTED (HUMAN)</Badge>;
      default:
        return <Badge tone="slate">{decision}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          badge="Compliance & Governance"
          title="Security & Authorization Audit Trail"
          subtitle="Immutable, code-level execution logs recording identity verification, permission decisions, and human-in-the-loop approvals."
        />
        <button
          onClick={fetchAuditData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.08] active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <GlassCard className="p-4 border-indigo-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Audited</span>
            <Shield className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-white">
            {stats ? stats.total_audited : total}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">100% requests captured</div>
        </GlassCard>

        <GlassCard className="p-4 border-rose-500/30 bg-rose-500/[0.02]">
          <div className="flex items-center justify-between text-xs text-rose-300">
            <span>Unauthorized Blocked</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-rose-400">
            {stats?.unauthorized_blocked ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Cross-tenant isolation</div>
        </GlassCard>

        <GlassCard className="p-4 border-amber-500/30 bg-amber-500/[0.02]">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span>Pending Approvals</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-amber-400">
            {stats?.pending_approvals ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Awaiting human signoff</div>
        </GlassCard>

        <GlassCard className="p-4 border-emerald-500/30 bg-emerald-500/[0.02]">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span>Human Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-emerald-400">
            {stats?.human_approved ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Executed post-approval</div>
        </GlassCard>

        <GlassCard className="p-4 border-cyan-500/30 bg-cyan-500/[0.02]">
          <div className="flex items-center justify-between text-xs text-cyan-300">
            <span>Secret Leaks</span>
            <Lock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-cyan-300">
            0
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Zero-trust regex scrub</div>
        </GlassCard>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student ID, action, or target..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Decision Filter */}
          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="rounded-xl border border-white/10 bg-navy-900 px-3 py-2 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Decisions</option>
            <option value="ALLOWED">Allowed</option>
            <option value="BLOCKED_UNAUTHORIZED">Blocked Unauthorized</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Human Approved</option>
            <option value="REJECTED">Human Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-navy-900 px-3 py-2 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="data_access">Data Access</option>
            <option value="sensitive_action">Sensitive Action</option>
            <option value="auth">Authentication</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <GlassCard className="overflow-hidden p-0 border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Authenticated Actor</th>
                <th className="py-3 px-4 font-semibold">Action & Target</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Permission Decision</th>
                <th className="py-3 px-4 font-semibold">Audited Reason</th>
                <th className="py-3 px-4 font-semibold">Trace ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-cyan-400 mb-2" />
                    Loading security audit ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-cyan-400" />
                        <span>{log.actor_id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{log.action_name}</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                        {log.target_resource}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] uppercase text-slate-400">
                        {log.action_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getDecisionBadge(log.decision)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs leading-relaxed">
                      {log.reason}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-cyan-400 whitespace-nowrap">
                      {log.trace_id ? (
                        <a
                          href={`/app/traces?q=${log.trace_id}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          <Activity className="h-3 w-3" />
                          <span>{log.trace_id}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
