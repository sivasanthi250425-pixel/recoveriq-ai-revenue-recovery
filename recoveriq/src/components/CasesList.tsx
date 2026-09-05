import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
  User,
} from "lucide-react";
import { CaseState, RecoveryCase } from "../types";
import { DecisionTraceView } from "./DecisionTraceView";

interface CasesListProps {
  cases: RecoveryCase[];
  onSelectCase: (c: RecoveryCase) => void;
}

export const CasesList: React.FC<CasesListProps> = ({ cases, onSelectCase }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.input.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.input.problemType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = stateFilter === "ALL" || c.currentState === stateFilter;

    return matchesSearch && matchesState;
  });

  const getStateBadge = (state: CaseState) => {
    switch (state) {
      case "ACTUALLY_RECOVERED":
        return "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30";
      case "MERCHANT_APPROVAL_REQUIRED":
        return "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30";
      case "POLICY_APPROVED":
      case "ACTION_EXECUTED":
        return "bg-[#E52B50]/15 text-white border-[#E52B50]/40";
      case "PAYMENT_FAILED":
      case "RECOVERY_STOPPED":
        return "bg-[#E52B50]/15 text-[#FA7298] border-[#E52B50]/30";
      default:
        return "bg-[#121214] text-[#A1A1AA] border-[#27272A]";
    }
  };

  return (
    <div className="space-y-6 pb-16 pt-2">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E52B50]" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono uppercase">
            Recovery Cases & Decision Traces
          </h2>
        </div>
        <p className="text-sm text-[#A1A1AA]">
          Inspect historical investigations, autonomous policy checks, and chronological decision traces.
        </p>
      </div>

      {/* Filter and Search Bar - Bento Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161618] p-4 rounded-2xl border border-[#27272A] shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#71717A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer, case ID, problem..."
            className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#A1A1AA]" />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors"
          >
            <option value="ALL">All States ({cases.length})</option>
            <option value="ACTUALLY_RECOVERED">Actually Recovered</option>
            <option value="MERCHANT_APPROVAL_REQUIRED">Merchant Approval Required</option>
            <option value="POLICY_APPROVED">Policy Approved</option>
            <option value="ACTION_EXECUTED">Action Executed</option>
            <option value="PAYMENT_FAILED">Payment Failed</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3.5">
        {filteredCases.length === 0 ? (
          <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-10 text-center text-xs text-[#A1A1AA]">
            No cases match the selected filter criteria.
          </div>
        ) : (
          filteredCases.map((c) => {
            const isExpanded = expandedCaseId === c.id;

            return (
              <div
                key={c.id}
                className="bg-[#161618] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 sm:p-6 shadow-xl transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#121214] border border-[#27272A] flex items-center justify-center text-white shrink-0 font-bold text-xs font-mono">
                      ₹
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {c.input.customer}
                        </span>
                        {c.isDemoCase && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#E52B50]/15 text-[#E52B50] border border-[#E52B50]/30 font-bold">
                            Demo Case
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#A1A1AA]">
                        Case: <span className="font-mono text-white">{c.id}</span> •{" "}
                        {c.input.problemType} ({c.input.failureReason})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${getStateBadge(
                        c.currentState
                      )}`}
                    >
                      {c.currentState.replace(/_/g, " ")}
                    </span>

                    <button
                      onClick={() => onSelectCase(c)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E52B50] to-[#B53389] hover:opacity-90 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Accounting Overview Banner - Bento 4 Subcells */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-[#121214] rounded-xl border border-[#27272A]">
                    <span className="text-[10px] text-[#71717A] block font-mono">
                      Revenue At Risk
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      ₹{c.input.amount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-3 bg-[#121214] rounded-xl border border-[#27272A]">
                    <span className="text-[10px] text-[#71717A] block font-mono">
                      Recommended Strategy
                    </span>
                    <span className="text-[#E52B50] font-medium truncate block text-xs mt-0.5">
                      {c.recommendedAction ? c.recommendedAction.replace(/_/g, " ") : "Pending"}
                    </span>
                  </div>

                  <div className="p-3 bg-[#121214] rounded-xl border border-[#27272A]">
                    <span className="text-[10px] text-[#71717A] block font-mono">
                      Expected Value (Model)
                    </span>
                    <span className="font-mono text-[#E52B50] font-bold text-sm">
                      ₹{Math.round(c.expectedRecoveryAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-3 bg-[#121214] rounded-xl border border-[#27272A]">
                    <span className="text-[10px] text-[#71717A] block font-mono">
                      Actually Recovered
                    </span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        c.actualRecoveredAmount > 0 ? "text-[#10B981]" : "text-[#71717A]"
                      }`}
                    >
                      ₹{c.actualRecoveredAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Toggle Decision Trace */}
                <div className="pt-1">
                  <button
                    onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                    className="text-[11px] text-[#A1A1AA] hover:text-white flex items-center gap-1.5 font-mono transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#E52B50]" />
                    <span>
                      {isExpanded ? "Hide Decision Trace" : "View Complete Decision Trace"} (
                      {c.decisionTrace.length} events)
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3.5 pt-3.5 border-t border-[#27272A]">
                      <DecisionTraceView trace={c.decisionTrace} caseId={c.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
