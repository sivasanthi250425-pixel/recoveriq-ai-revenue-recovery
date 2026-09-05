import React from "react";
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  BarChart2,
  PieChart,
} from "lucide-react";
import { PerformanceMetrics, RecoveryCase } from "../types";

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  cases: RecoveryCase[];
  onSelectCase: (c: RecoveryCase) => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics,
  cases,
  onSelectCase,
}) => {
  const formatINR = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;

  const recoveryEfficiency =
    metrics.totalRevenueAtRisk > 0
      ? Math.round((metrics.totalActuallyRecovered / metrics.totalRevenueAtRisk) * 100)
      : 0;

  const policyAdherenceRate =
    metrics.casesInvestigated > 0
      ? Math.round(
          ((metrics.casesInvestigated - metrics.actionsBlockedByPolicy) /
            metrics.casesInvestigated) *
            100
        )
      : 100;

  return (
    <div className="space-y-6 pb-16 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E52B50]" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono uppercase">
              Agent Performance & Revenue Ledger
            </h2>
          </div>
          <p className="text-sm text-[#A1A1AA] max-w-2xl">
            Real-time metrics strictly aggregated from live session cases. Displays true financial
            recovery versus theoretical projections.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#161618] border border-[#27272A] px-3.5 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs font-mono text-[#A1A1AA]">
            Ledger Active • {cases.length} Tracked Situations
          </span>
        </div>
      </div>

      {/* 1. Core Financial Metric Cards - Bento 4-Tile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue at Risk */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-[#A1A1AA] font-semibold block">
                01. Revenue At Risk
              </span>
              <span className="text-[10px] font-mono text-[#71717A]">Gross</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
              {formatINR(metrics.totalRevenueAtRisk)}
            </div>
          </div>
          <p className="text-xs text-[#71717A] mt-3 pt-3 border-t border-[#27272A]">
            Cumulative value of investigated payment failures
          </p>
        </div>

        {/* Expected Recovery */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-[#A1A1AA] font-semibold block">
                02. Expected Recovery
              </span>
              <span className="text-[10px] font-mono text-[#E52B50]">AI Model</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#E52B50] tracking-tight">
              {formatINR(metrics.totalExpectedRecovery)}
            </div>
          </div>
          <p className="text-xs text-[#71717A] mt-3 pt-3 border-t border-[#27272A]">
            Statistical projection (Unsettled probability)
          </p>
        </div>

        {/* Actually Recovered */}
        <div className="bg-[#161618] border border-[#10B981]/50 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-[#10B981] font-bold block">
                03. Actually Recovered
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                LEDGER VERIFIED
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#10B981] tracking-tight">
              {formatINR(metrics.totalActuallyRecovered)}
            </div>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-3 pt-3 border-t border-[#27272A]">
            Settled via confirmed payment callbacks
          </p>
        </div>

        {/* Recovery Rate */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-[#A1A1AA] font-semibold block">
                04. Recovery Rate
              </span>
              <span className="text-[10px] font-mono text-[#71717A]">Efficiency</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
              {metrics.recoveryRate}%
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#27272A]">
            <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden border border-[#27272A]">
              <div
                className="bg-gradient-to-r from-[#E52B50] to-[#10B981] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.recoveryRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Operational Metrics & Policy Compliance - Bento 3-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Operations Breakdown */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
              01. Operations
            </span>
            <span className="w-1 h-1 rounded-full bg-[#71717A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#E52B50]" />
              Activity Dispatch
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#121214] border border-[#27272A]">
              <span className="text-xs text-[#A1A1AA]">Cases Investigated</span>
              <span className="font-mono text-sm font-bold text-white">
                {metrics.casesInvestigated}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#121214] border border-[#27272A]">
              <span className="text-xs text-[#A1A1AA]">Actions Executed (Provider)</span>
              <span className="font-mono text-sm font-bold text-[#E52B50]">
                {metrics.actionsExecuted}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#121214] border border-[#27272A]">
              <span className="text-xs text-[#A1A1AA]">Actions Blocked by Policy</span>
              <span className="font-mono text-sm font-bold text-[#F59E0B]">
                {metrics.actionsBlockedByPolicy}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Guardrail Health */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
              02. Safety
            </span>
            <span className="w-1 h-1 rounded-full bg-[#71717A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              Policy Guardrails
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#A1A1AA]">Auto-Execution Safety Rate</span>
                <span className="font-mono text-xs font-bold text-[#10B981]">
                  {policyAdherenceRate}%
                </span>
              </div>
              <div className="w-full bg-[#161618] h-1.5 rounded-full overflow-hidden border border-[#27272A]">
                <div
                  className="bg-[#10B981] h-full rounded-full"
                  style={{ width: `${policyAdherenceRate}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-[#A1A1AA] leading-relaxed">
              <strong className="text-white block mb-1">Guaranteed Safety Invariant:</strong>
              The agent has zero authority to bypass policy limits. All transactions above
              ₹10,000 or with &lt;75% confidence require explicit human merchant sign-off.
            </div>
          </div>
        </div>

        {/* Recovery Accounting Model */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
              03. Governance
            </span>
            <span className="w-1 h-1 rounded-full bg-[#71717A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#E52B50]" />
              Accounting Invariant
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272A] text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#E52B50]/20 text-[#FA7298] flex items-center justify-center font-bold shrink-0 text-[10px]">
                ✕
              </span>
              <span className="text-[#A1A1AA]">
                <strong className="text-[#E4E4E7]">AI recommendation</strong> is NOT booked revenue.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#E52B50]/20 text-[#FA7298] flex items-center justify-center font-bold shrink-0 text-[10px]">
                ✕
              </span>
              <span className="text-[#A1A1AA]">
                <strong className="text-[#E4E4E7]">Expected recovery</strong> is NOT booked revenue.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-bold shrink-0 text-[10px]">
                ✓
              </span>
              <span className="text-[#E4E4E7]">
                Only <strong className="text-[#10B981]">verified successful payment capture</strong> increments the actual
                recovered revenue ledger.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Session Cases Quick Ledger - Bento Table Card */}
      <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
              04. Ledger Details
            </span>
            <span className="w-1 h-1 rounded-full bg-[#71717A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Active Session Case Ledger ({cases.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#27272A] text-[#71717A] font-mono uppercase text-[10px]">
                <th className="pb-3 pr-4">Case ID</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">At Risk</th>
                <th className="pb-3 pr-4">Strategy</th>
                <th className="pb-3 pr-4">Current State</th>
                <th className="pb-3 pr-4">Actually Recovered</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-[#121214] transition-colors">
                  <td className="py-3.5 pr-4 font-mono text-[11px] text-[#A1A1AA]">
                    {c.id.slice(-8)}
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-white">{c.input.customer}</td>
                  <td className="py-3.5 pr-4 font-mono font-bold text-white">
                    ₹{c.input.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 pr-4 text-[#A1A1AA]">
                    {c.recommendedAction ? c.recommendedAction.replace(/_/g, " ") : "Pending"}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        c.currentState === "ACTUALLY_RECOVERED"
                          ? "bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]"
                          : c.currentState === "MERCHANT_APPROVAL_REQUIRED"
                          ? "bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]"
                          : c.currentState === "PAYMENT_FAILED"
                          ? "bg-[#E52B50]/15 border-[#E52B50]/30 text-[#FA7298]"
                          : "bg-[#121214] border-[#27272A] text-[#A1A1AA]"
                      }`}
                    >
                      {c.currentState}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-mono font-bold">
                    {c.actualRecoveredAmount > 0 ? (
                      <span className="text-[#10B981]">
                        ₹{c.actualRecoveredAmount.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-[#71717A]">₹0</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onSelectCase(c)}
                      className="px-3 py-1 rounded-xl bg-[#121214] hover:bg-[#E52B50] hover:text-white text-[#A1A1AA] text-[11px] transition-all font-medium border border-[#27272A] hover:border-[#E52B50] cursor-pointer"
                    >
                      Inspect Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
