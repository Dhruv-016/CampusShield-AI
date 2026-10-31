"use client";

import { RefreshCw, Calendar, CreditCard, GraduationCap, Clock, AlertCircle } from "lucide-react";
import { useApi } from "@/lib/hooks";
import { Badge, Btn, Card, ErrorBox, PageTitle, Spinner } from "@/components/ui";
import { CountUp } from "@/components/motion";

type Profile = {
  id: string;
  name: string;
  email?: string | null;
  programme: string;
  semester: string;
  is_demo_data?: boolean;
  notice: string;
};

type Fee = {
  semester?: string;
  total_fee: number;
  paid_amount: number;
  outstanding_amount: number;
  status: string;
  due_date?: string | null;
  currency?: string;
  message?: string;
  is_demo_data?: boolean;
};

type Cal = {
  as_of: string;
  events: { title: string; date: string; type: string; description: string }[];
};

export default function Student() {
  const p = useApi<Profile>("/student/profile");
  const f = useApi<Fee>("/student/fee-status");
  const c = useApi<Cal>("/calendar");

  const reload = () => {
    p.reload();
    f.reload();
    c.reload();
  };

  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const paidPercentage =
    f.data && f.data.total_fee > 0
      ? Math.round((f.data.paid_amount / f.data.total_fee) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle
        title="My Student Information"
        sub="Verified student record for academic evaluation — synthetic mock data."
        action={
          <Btn variant="ghost" onClick={reload}>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Btn>
        }
      />

      {p.loading && <Spinner />}
      {p.error && <ErrorBox message={p.error} onRetry={p.reload} />}

      {/* Student Profile Identity Card */}
      {p.data && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 font-bold text-white text-xl shadow-lg">
                {p.data.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div>
                <div className="font-heading text-xl font-bold text-white">
                  {p.data.name}
                </div>
                <div className="text-sm text-slate-400">
                  {p.data.programme} · {p.data.semester}
                </div>
              </div>
            </div>
            <div className="sm:text-right">
              <div className="font-mono text-sm text-cyan-300 font-semibold">
                {p.data.id}
              </div>
              <div className="mt-1">
                <Badge tone={p.data.is_demo_data ? "cyan" : "green"}>
                  {p.data.is_demo_data ? "Demo Account" : "Registered Student"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tuition & Financial Balance Card */}
      {f.error && <ErrorBox message={f.error} onRetry={f.reload} />}
      {f.data && f.data.status === "no_record" && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              <h2 className="font-heading text-lg font-bold text-white">
                Tuition & Fees
              </h2>
            </div>
            <Badge tone="green">All Clear</Badge>
          </div>
          <p className="text-sm text-slate-300">
            {f.data.message || "No fee records are available for your account yet. Invoices will appear here once published by the bursar."}
          </p>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-400">
            Outstanding balance: <span className="font-mono font-semibold text-emerald-400">₹0</span> · Next billing cycle will be reflected automatically upon registration approval.
          </div>
        </Card>
      )}
      {f.data && f.data.status !== "no_record" && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              <h2 className="font-heading text-lg font-bold text-white">
                Tuition & Fees — {f.data.semester}
              </h2>
            </div>
            <Badge tone={f.data.status === "PAID" ? "green" : "amber"}>
              {(f.data.status || "STATUS").replace("_", " ")}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">Total Semester Fee</div>
              <div className="mt-1 font-heading text-xl font-bold text-white">
                {inr(f.data.total_fee)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs text-emerald-400">Paid Amount</div>
              <div className="mt-1 font-heading text-xl font-bold text-emerald-300">
                {inr(f.data.paid_amount)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs text-amber-400">Outstanding Balance</div>
              <div className="mt-1 font-heading text-xl font-bold text-amber-300">
                {inr(f.data.outstanding_amount)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-400">Next Due Date</div>
              <div className="mt-1 font-mono text-base font-semibold text-white">
                {f.data.due_date}
              </div>
            </div>
          </div>

          {/* Payment progress bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Settlement Progress</span>
              <span className="font-mono text-cyan-300">{paidPercentage}% Cleared</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Academic Calendar Events Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            <h2 className="font-heading text-lg font-bold text-white">
              Upcoming Academic Milestones
            </h2>
          </div>
          {c.data && (
            <span className="text-xs text-slate-400 font-mono">
              as of {c.data.as_of}
            </span>
          )}
        </div>

        {c.loading && <Spinner />}
        {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}

        {c.data && c.data.events.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">
            No upcoming events found in demo range. Adjust DEMO_TODAY in backend/.env to inspect historical events.
          </div>
        )}

        <ul className="divide-y divide-white/[0.06]">
          {c.data?.events.map((e) => (
            <li
              key={e.title + e.date}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 text-sm hover:bg-white/[0.02] px-2 rounded-xl transition"
            >
              <div>
                <div className="font-semibold text-white">{e.title}</div>
                <div className="text-xs text-slate-400">{e.description}</div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <Badge tone="blue">{e.type}</Badge>
                <span className="font-mono text-xs text-cyan-300">{e.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
