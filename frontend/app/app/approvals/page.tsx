"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Filter,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { api, ActionApprovalItem } from "@/lib/api";
import { Badge, GlassCard, SectionHeading } from "@/components/ui";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ActionApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedApproval, setSelectedApproval] = useState<ActionApprovalItem | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api<{ total?: number; items?: ActionApprovalItem[] } | ActionApprovalItem[]>("/approvals");
      const items = Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : []);
      setApprovals(items);
    } catch {
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (approvalId: string, decision: "approved" | "rejected") => {
    setDecidingId(approvalId);
    try {
      const res = await api<ActionApprovalItem>(`/approvals/${approvalId}/decide`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          reason: decision === "rejected" ? (rejectionNotes || "Rejected by administrator review.") : "Verified and approved by authorized officer.",
          actor: "Admin (Human Officer)",
        }),
      });

      // Optimistic update in list
      setApprovals((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) =>
          (item.id === approvalId || item.approval_id === approvalId) ? res : item
        )
      );

      if (selectedApproval && (selectedApproval.id === approvalId || selectedApproval.approval_id === approvalId)) {
        setSelectedApproval(res);
      }

      setToastMessage(
        decision === "approved"
          ? "Action approved & mutation executed into ledger."
          : "Action rejected. 0 mutations executed. Recorded in audit ledger."
      );
      setTimeout(() => setToastMessage(null), 4000);
      setRejectionNotes("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Decision execution failed";
      setToastMessage(`Error: ${msg}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setDecidingId(null);
    }
  };

  const list = Array.isArray(approvals) ? approvals : [];
  const filteredApprovals = list.filter((item) => {
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  const pendingCount = list.filter((a) => a.status === "pending").length;
  const approvedCount = list.filter((a) => a.status === "approved").length;
  const rejectedCount = list.filter((a) => a.status === "rejected").length;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-slate-900/95 px-5 py-3.5 text-sm font-medium text-cyan-200 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          badge="Human-in-the-Loop (HITL)"
          title="Sensitive Action Approval Center"
          subtitle="All mutations affecting student records, bank accounts, or financial distributions are staged in isolation. Zero execution occurs without explicit human authorization."
        />
        <button
          onClick={fetchApprovals}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.08] active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh Staged Actions</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Review</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{pendingCount}</span>
            <span className="text-xs text-amber-400 font-medium">Require HITL Sign-off</span>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Approved & Executed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{approvedCount}</span>
            <span className="text-xs text-slate-400">Mutations applied</span>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Rejected Actions</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">{rejectedCount}</span>
            <span className="text-xs text-slate-400">0 Mutations guarantee</span>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden p-5 bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-cyan-300">Safety Policy</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-cyan-200">Strict Code Enforcement</span>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              No prompt bypass can execute write transactions directly.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Filter Status:</span>
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
              filterStatus === status
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {status}
            {status === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Approvals Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="mt-4 text-sm font-medium">Fetching staging queue...</p>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
          <FileCheck2 className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white">No Approval Requests in Queue</h3>
          <p className="mt-1 max-w-md text-xs text-slate-400 leading-relaxed">
            When a student asks to change refund bank details, apply for urgent grant disbursements, or transfer degrees, requests are automatically staged here.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredApprovals.map((item) => {
            const approvalId = item.id || item.approval_id || "";
            const isPending = item.status === "pending";
            const isDeciding = decidingId === approvalId;

            return (
              <GlassCard
                key={approvalId}
                className={`relative flex flex-col justify-between p-6 transition-all duration-300 hover:border-white/20 ${
                  isPending
                    ? "border-amber-500/30 bg-amber-950/[0.04]"
                    : item.status === "approved"
                    ? "border-emerald-500/20 bg-emerald-950/[0.02]"
                    : "border-rose-500/20 bg-rose-950/[0.02]"
                }`}
              >
                <div>
                  {/* Top Bar: Action Type & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isPending
                            ? "bg-amber-500/10 text-amber-400"
                            : item.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {isPending ? (
                          <Clock className="h-4 w-4" />
                        ) : item.status === "approved" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                        <span className="text-[11px] font-mono text-slate-400">{approvalId}</span>
                      </div>
                    </div>

                    <Badge
                      tone={
                        isPending ? "amber" : item.status === "approved" ? "green" : "red"
                      }
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Staged Payload Inspector */}
                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/40 p-3">
                    <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-slate-400 border-b border-white/[0.06]">
                      <span>Staged Payload (Immutable until decided)</span>
                      <span className="text-cyan-400">Target Student: {item.student_id || "STU-DEMO-1001"}</span>
                    </div>
                    <pre className="mt-2 max-h-36 overflow-auto text-[11px] font-mono text-slate-300 scrollbar-thin">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </div>

                  {/* Review / Decision Metadata if resolved */}
                  {!isPending && (
                    <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Decided by: <strong className="text-slate-200">{item.decided_by || "Administrator"}</strong></span>
                        <span>{item.decided_at ? new Date(item.decided_at).toLocaleString() : "Recently"}</span>
                      </div>
                      {item.decision_reason && (
                        <p className="italic text-slate-300">Note: &ldquo;{item.decision_reason}&rdquo;</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions for Pending */}
                {isPending && (
                  <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Optional rejection reason / reviewer note..."
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleDecision(approvalId, "rejected")}
                        disabled={isDeciding}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 active:scale-95 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject (0 Mutations)</span>
                      </button>
                      <button
                        onClick={() => handleDecision(approvalId, "approved")}
                        disabled={isDeciding}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Authorize & Execute</span>
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
