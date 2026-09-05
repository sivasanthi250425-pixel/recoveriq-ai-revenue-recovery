import React from "react";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Play, ArrowRight } from "lucide-react";
import { CaseState } from "../types";

export interface AgentStep {
  key: string;
  label: string;
  shortLabel: string;
}

export const AGENT_STEPS: AgentStep[] = [
  { key: "EVENT_RECEIVED", label: "REVENUE EVENT RECEIVED", shortLabel: "Received" },
  { key: "ANALYZING_SIGNALS", label: "ANALYZING PAYMENT SIGNALS", shortLabel: "Signals" },
  { key: "DIAGNOSING_RISK", label: "DIAGNOSING REVENUE RISK", shortLabel: "Diagnose" },
  { key: "EVALUATING_OPTIONS", label: "EVALUATING RECOVERY OPTIONS", shortLabel: "Options" },
  { key: "SELECTING_STRATEGY", label: "SELECTING RECOVERY STRATEGY", shortLabel: "Strategy" },
  { key: "CHECKING_POLICY", label: "CHECKING MERCHANT POLICY", shortLabel: "Policy" },
  { key: "EXECUTING_RECOVERY", label: "EXECUTING RECOVERY", shortLabel: "Execute" },
  { key: "VERIFYING_OUTCOME", label: "VERIFYING OUTCOME", shortLabel: "Verify" },
];

interface AgentStepperProps {
  currentState: CaseState;
  isAnalyzing: boolean;
  activeStepIndex?: number;
}

export const AgentStepper: React.FC<AgentStepperProps> = ({
  currentState,
  isAnalyzing,
  activeStepIndex = 0,
}) => {
  // Determine effective step index from currentState if not analyzing
  const getStepIndexFromState = (state: CaseState): number => {
    switch (state) {
      case "REVENUE_AT_RISK":
        return 0;
      case "AI_ANALYSIS_UNAVAILABLE":
        return 2;
      case "AI_ANALYZED":
      case "DECISION_MADE":
        return 4;
      case "POLICY_APPROVED":
      case "MERCHANT_APPROVAL_REQUIRED":
        return 5;
      case "ACTION_EXECUTED":
      case "PAYMENT_PENDING":
        return 6;
      case "PAYMENT_SUCCESSFUL":
      case "ACTUALLY_RECOVERED":
      case "PAYMENT_FAILED":
      case "RECOVERY_STOPPED":
        return 7;
      default:
        return 0;
    }
  };

  const currentIndex = isAnalyzing ? activeStepIndex : getStepIndexFromState(currentState);

  return (
    <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E52B50] animate-pulse"></span>
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            Autonomous Recovery Pipeline
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#A1A1AA] flex items-center gap-1.5">
          {isAnalyzing ? (
            <span className="text-[#E52B50] flex items-center gap-1 font-semibold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E52B50] animate-ping" />
              Agent Investigating Case...
            </span>
          ) : currentState === "AI_ANALYSIS_UNAVAILABLE" ? (
            <span className="text-[#FA7298] font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#E52B50]" />
              AI Offline — Pipeline Halted
            </span>
          ) : currentState === "ACTUALLY_RECOVERED" ? (
            <span className="text-[#10B981] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Outcome Settled & Verified
            </span>
          ) : currentState === "MERCHANT_APPROVAL_REQUIRED" ? (
            <span className="text-[#F59E0B] font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Policy Gate: Approval Required
            </span>
          ) : (
            <span className="text-[#A1A1AA]">Step {currentIndex + 1} of {AGENT_STEPS.length}</span>
          )}
        </div>
      </div>

      {/* Steps visualization - Bento Step Cells */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {AGENT_STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          let statusClass = "bg-[#121214] border-[#27272A] text-[#71717A]";
          let dotColor = "bg-[#3F3F46]";

          if (isCurrent) {
            if (currentState === "MERCHANT_APPROVAL_REQUIRED" && idx === 5) {
              statusClass = "bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#F59E0B]";
              dotColor = "bg-[#F59E0B]";
            } else {
              statusClass = "bg-[#E52B50]/15 border-[#E52B50]/60 text-white shadow-md shadow-[#E52B50]/10";
              dotColor = "bg-[#E52B50] animate-pulse";
            }
          } else if (isPassed) {
            statusClass = "bg-[#121214] border-[#27272A] text-[#D4D4D8]";
            dotColor = "bg-[#10B981]";
          }

          return (
            <div
              key={step.key}
              id={`agent-step-${idx}`}
              className={`relative flex flex-col p-2.5 rounded-xl border text-left transition-all ${statusClass}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-semibold opacity-75">
                  0{idx + 1}
                </span>
                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
              </div>
              <span className="text-[10.5px] font-semibold tracking-tight leading-tight line-clamp-2">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
