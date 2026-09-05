import React from "react";
import {
  ShieldAlert,
  Zap,
  TrendingUp,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Target,
  Layers,
  ArrowRight,
} from "lucide-react";
import { AiAnalysisResult, RecoveryAction, RevenueProblemInput, RiskLevel } from "../types";

interface AnalysisCardProps {
  analysis: AiAnalysisResult;
  amount: number;
  input?: RevenueProblemInput;
  onSelectStrategy?: (action: RecoveryAction) => void;
  canSelectStrategy?: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  amount,
  input,
  onSelectStrategy,
  canSelectStrategy = true,
}) => {
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "LOW":
        return {
          bg: "bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]",
          label: "LOW RISK",
        };
      case "MEDIUM":
        return {
          bg: "bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]",
          label: "MEDIUM RISK",
        };
      case "HIGH":
        return {
          bg: "bg-[#F97316]/15 border-[#F97316]/40 text-[#FB923C]",
          label: "HIGH RISK",
        };
      case "CRITICAL":
      default:
        return {
          bg: "bg-[#E52B50]/15 border-[#E52B50]/40 text-[#FA7298]",
          label: "CRITICAL RISK",
        };
    }
  };

  const formatActionName = (action: RecoveryAction) => {
    return action.replace(/_/g, " ");
  };

  const riskBadge = getRiskBadge(analysis.riskLevel);
  const confidencePct = Math.round(analysis.confidence * 100);
  const recoveryProbPct = Math.round(analysis.expectedRecoveryProbability * 100);
  const expectedValue = Math.round(amount * analysis.expectedRecoveryProbability);

  return (
    <div className="space-y-5">
      {/* Bento Tile 1: Authoritative Input Facts vs. AI Inferences */}
      <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
              01. Data Integrity Gate
            </span>
            <span className="w-1 h-1 rounded-full bg-[#71717A]" />
            <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
              Input Facts vs. AI Inferences
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2.5 py-0.5 rounded-full font-bold">
            ZERO HALLUCINATION PROTOCOL
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Verified Input Facts Column */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                Authoritative Input Facts
              </span>
              <span className="text-[10px] font-mono text-[#71717A]">Merchant Provided</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Customer</span>
                <span className="font-semibold text-white">{input?.customer || "Supplied Customer"}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Amount At Risk</span>
                <span className="font-mono font-bold text-white">₹{amount.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Problem Type</span>
                <span className="text-[#D4D4D8]">{input?.problemType || "Payment Issue"}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Failure Reason</span>
                <span className="text-[#D4D4D8]">{input?.failureReason || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Previous Retry Attempts</span>
                <span className="font-mono text-white">{input?.previousAttempts ?? 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Prior Successful Payments</span>
                <span className="font-mono text-white">{input?.previousSuccessfulPayments ?? 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Time Since Issue</span>
                <span className="text-[#D4D4D8]">{input?.timeSinceIssue || "Recent"}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Customer Outreach History</span>
                <span className="text-[#A1A1AA] italic">Not provided</span>
              </div>
            </div>

            {input?.additionalContext && (
              <div className="pt-2 border-t border-[#27272A] text-[11px]">
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Context Note</span>
                <span className="text-[#A1A1AA]">{input.additionalContext}</span>
              </div>
            )}
          </div>

          {/* AI Inferences Column */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
              <span className="text-xs font-mono font-bold text-[#E52B50] uppercase flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#E52B50]" />
                AI Inferences & Risk Signals
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border border-[#E52B50]/30 text-[#FA7298] bg-[#E52B50]/10">
                PROBABILISTIC INFERENCE
              </span>
            </div>

            <div className="space-y-2">
              <div className="bg-[#161618] p-2.5 rounded-lg border border-[#27272A]">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">Risk Diagnosis</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${riskBadge.bg}`}>
                    {riskBadge.label}
                  </span>
                </div>
                <p className="text-xs text-[#E4E4E7] leading-relaxed">
                  {analysis.diagnosis}
                </p>
              </div>

              {/* Behavioral Signals */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#71717A] uppercase block">
                  Extracted Signals ({analysis.signals.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {analysis.signals.map((sig, idx) => {
                    let impactColor = "text-[#A1A1AA] bg-[#161618] border-[#27272A]";
                    if (sig.impact === "positive") {
                      impactColor = "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30";
                    } else if (sig.impact === "negative") {
                      impactColor = "text-[#FA7298] bg-[#E52B50]/10 border-[#E52B50]/30";
                    }

                    return (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#161618] border border-[#27272A] flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-semibold text-[#A1A1AA] truncate">
                            {sig.name}
                          </span>
                          <span className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded border font-bold ${impactColor}`}>
                            {sig.impact}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-white line-clamp-1">
                          {sig.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deterministic Financial Accounting Formula */}
        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] font-bold">
              Deterministic Valuation:
            </span>
            <span className="font-mono text-white">
              Potential (₹{amount.toLocaleString("en-IN")}) × Recovery Prob ({recoveryProbPct}%) = Expected Recovery (₹{expectedValue.toLocaleString("en-IN")})
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
            Actually Recovered: ₹0 (Awaiting verified callback)
          </span>
        </div>
      </div>

      {/* Bento Tile 2: Recommended Recovery Strategy & Probability Matrix */}
      <div className="bg-[#161618] border border-[#E52B50]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E52B50]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
              03. Selected Strategy
            </span>
            <span className="w-1 h-1 rounded-full bg-[#71717A]" />
            <h4 className="text-base font-extrabold text-white tracking-tight">
              {formatActionName(analysis.recommendedAction)}
            </h4>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block font-mono">
                Model Confidence
              </span>
              <span className="text-sm font-mono font-bold text-[#E52B50]">
                {confidencePct}%
              </span>
            </div>
            <div className="h-6 w-px bg-[#27272A]" />
            <div className="text-right">
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block font-mono">
                Expected Value
              </span>
              <span className="text-sm font-mono font-bold text-[#10B981]">
                ₹{Math.round(analysis.expectedRecoveryAmount).toLocaleString("en-IN")}
                <span className="text-[11px] text-[#A1A1AA] font-normal ml-1">
                  ({recoveryProbPct}%)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Reasoning box */}
        <div className="bg-[#121214] rounded-xl p-4 border border-[#27272A]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block mb-1 font-semibold">
            Decision Rationale
          </span>
          <p className="text-xs text-[#E4E4E7] leading-relaxed font-sans">
            {analysis.reasoning}
          </p>
        </div>

        {/* Candidate Alternatives Evaluation */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold">
            <Layers className="w-3.5 h-3.5 text-[#E52B50]" />
            <span>Strategy Comparison & Expected Value Matrix</span>
          </div>

          <div className="space-y-2">
            {analysis.candidateActions.map((cand, idx) => {
              const isSelected = cand.action === analysis.recommendedAction;
              const probPct = Math.round(cand.estimatedRecoveryProbability * 100);

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? "bg-[#E52B50]/10 border-[#E52B50]/50 text-white shadow-sm"
                      : "bg-[#121214] border-[#27272A] text-[#A1A1AA]"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${
                        isSelected
                          ? "bg-gradient-to-r from-[#E52B50] to-[#B53389] text-white"
                          : "bg-[#1E1E22] text-[#71717A]"
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {formatActionName(cand.action)}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-mono uppercase font-bold text-[#E52B50] bg-[#E52B50]/15 border border-[#E52B50]/30 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">{cand.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:self-center self-end">
                    <div className="text-right">
                      <span className="text-[10px] text-[#71717A] block font-mono">
                        Success Prob
                      </span>
                      <span className="font-mono font-semibold text-white">
                        {probPct}%
                      </span>
                    </div>
                    <div className="text-right min-w-[75px]">
                      <span className="text-[10px] text-[#71717A] block font-mono">
                        Est. Recoverable
                      </span>
                      <span className="font-mono font-semibold text-[#10B981]">
                        ₹{Math.round(cand.estimatedRecoveryAmount).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {!isSelected && onSelectStrategy && canSelectStrategy && (
                      <button
                        type="button"
                        onClick={() => onSelectStrategy(cand.action)}
                        className="px-2.5 py-1 rounded-lg bg-[#161618] hover:bg-[#E52B50] hover:text-white border border-[#27272A] hover:border-[#E52B50] text-[#A1A1AA] text-[10px] font-mono font-bold transition-all cursor-pointer"
                      >
                        Select Strategy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discarded Alternatives */}
        {analysis.rejectedAlternatives && analysis.rejectedAlternatives.length > 0 && (
          <div className="pt-3 border-t border-[#27272A]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block mb-2 font-semibold">
              Discarded Alternatives & Exclusion Justifications
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.rejectedAlternatives.map((rej, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#121214] border border-[#27272A] flex items-start gap-2"
                >
                  <X className="w-3.5 h-3.5 text-[#E52B50] shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-snug">
                    <span className="font-semibold text-[#E4E4E7]">
                      {formatActionName(rej.action)}:
                    </span>{" "}
                    <span className="text-[#A1A1AA]">{rej.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
