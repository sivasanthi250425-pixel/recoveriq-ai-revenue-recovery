import React, { useState } from "react";
import {
  Shield,
  Zap,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  ChevronDown,
} from "lucide-react";
import { RecoveryAction, RecoveryCase, RevenueProblemInput } from "../types";
import { AgentStepper, AGENT_STEPS } from "./AgentStepper";
import { AnalysisCard } from "./AnalysisCard";
import { PolicyCheckCard } from "./PolicyCheckCard";
import { ExecutionPanel } from "./ExecutionPanel";
import { DecisionTraceView } from "./DecisionTraceView";

interface InvestigationWorkspaceProps {
  currentCase: RecoveryCase | null;
  setCurrentCase: (c: RecoveryCase | null) => void;
  onAnalyze: (input: RevenueProblemInput) => Promise<void>;
  onExecute: () => Promise<void>;
  onSimulateOutcome: (outcome: "SUCCESS" | "FAILURE") => Promise<void>;
  onApprovePolicyException: (reason: string) => Promise<void>;
  onSelectStrategy?: (action: RecoveryAction) => void;
  isAnalyzing: boolean;
  isExecuting: boolean;
  isSimulating: boolean;
  isApproving: boolean;
  analysisError: string | null;
  hasApiKey: boolean;
}

interface ScenarioTemplate {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  data: RevenueProblemInput;
}

const EXAMPLE_SCENARIOS: ScenarioTemplate[] = [
  {
    id: "scen-1",
    name: "Arjun — Bank declined (High Intent)",
    tag: "High Intent / Soft Decline",
    tagColor: "text-[#34D399] border-[#10B981]/30 bg-[#10B981]/10",
    data: {
      customer: "Arjun",
      amount: 7500,
      currency: "INR",
      problemType: "Payment failed",
      failureReason: "Bank declined the transaction",
      previousAttempts: 1,
      previousSuccessfulPayments: 4,
      timeSinceIssue: "18 minutes",
      additionalContext: "Customer usually pays immediately",
    },
  },
  {
    id: "scen-2",
    name: "Priya — Repeated failure (High Value)",
    tag: "Policy Gate Trigger (> ₹10k, 2 attempts)",
    tagColor: "text-[#FBBF24] border-[#FBBF24]/30 bg-[#FBBF24]/10",
    data: {
      customer: "Priya",
      amount: 15000,
      currency: "INR",
      problemType: "Payment failed repeatedly",
      failureReason: "Repeated bank decline",
      previousAttempts: 2,
      previousSuccessfulPayments: 1,
      timeSinceIssue: "15 minutes",
      additionalContext: "High-value transaction",
    },
  },
  {
    id: "scen-3",
    name: "Ravi — Abandoned checkout",
    tag: "Friction Drop / Recovery Link",
    tagColor: "text-[#DF2B8A] border-[#DF2B8A]/30 bg-[#DF2B8A]/10",
    data: {
      customer: "Ravi",
      amount: 2500,
      currency: "INR",
      problemType: "Abandoned checkout",
      failureReason: "Checkout abandoned",
      previousAttempts: 0,
      previousSuccessfulPayments: 0,
      timeSinceIssue: "30 minutes",
      additionalContext: "Customer added products and left checkout recently",
    },
  },
  {
    id: "scen-4",
    name: "Corporate Customer — Overdue invoice",
    tag: "B2B Mandate Escalation",
    tagColor: "text-[#60A5FA] border-[#3B82F6]/30 bg-[#3B82F6]/10",
    data: {
      customer: "Corporate Customer",
      amount: 20000,
      currency: "INR",
      problemType: "Overdue invoice",
      failureReason: "Invoice overdue",
      previousAttempts: 0,
      previousSuccessfulPayments: 5,
      timeSinceIssue: "7 days",
      additionalContext: "Previously reliable business customer",
    },
  },
];

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  currentCase,
  setCurrentCase,
  onAnalyze,
  onExecute,
  onSimulateOutcome,
  onApprovePolicyException,
  onSelectStrategy,
  isAnalyzing,
  isExecuting,
  isSimulating,
  isApproving,
  analysisError,
  hasApiKey,
}) => {
  // Form input state
  const [formData, setFormData] = useState<RevenueProblemInput>({
    customer: "Arjun",
    amount: 7500,
    currency: "INR",
    problemType: "Payment failed",
    failureReason: "Bank declined the transaction",
    previousAttempts: 1,
    previousSuccessfulPayments: 4,
    timeSinceIssue: "18 minutes",
    additionalContext: "Customer usually pays immediately",
  });

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Load a scenario template into the form
  const handleSelectScenario = (scen: ScenarioTemplate) => {
    setFormData({ ...scen.data });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;

    // Simulate animated step progression during investigation
    setActiveStepIndex(0);
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 5 ? prev + 1 : prev));
    }, 450);

    try {
      await onAnalyze(formData);
    } finally {
      clearInterval(stepInterval);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner - Agent First Statement */}
      <div className="relative pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161618] border border-[#27272A] text-[#E52B50] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Revenue Operations
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Recover revenue <span className="text-[#E52B50]">before it is lost.</span>
        </h1>

        <p className="mt-2.5 text-base sm:text-lg text-[#A1A1AA] max-w-3xl leading-relaxed">
          RecoverIQ investigates revenue at risk, chooses the safest recovery strategy, enforces
          deterministic merchant policies, and measures what was actually recovered.
        </p>
      </div>

      {/* 2. Structured Revenue Loss Input Workspace - Bento Tile */}
      <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E52B50]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E52B50]" />
              <h2 className="text-lg font-bold text-white tracking-tight uppercase font-mono">
                Revenue Recovery Investigation
              </h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Submit an at-risk transaction or payment failure. The AI agent will analyze signals,
              evaluate alternatives, and enforce safety guardrails.
            </p>
          </div>

          {/* Preset Scenario Shortcuts */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider block">
              Quick Scenarios (Shortcuts into real AI pipeline):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_SCENARIOS.map((scen) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => handleSelectScenario(scen)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#121214] hover:bg-[#27272A] border border-[#27272A] hover:border-[#E52B50]/50 text-[#E4E4E7] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{scen.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Structured Input Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Customer */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono mb-1.5">
                Customer Name / ID
              </label>
              <input
                id="input-customer"
                type="text"
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="e.g. Arjun"
                className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono mb-1.5">
                Amount At Risk (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-[#71717A] font-mono">₹</span>
                <input
                  id="input-amount"
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="7500"
                  className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl pl-7 pr-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Problem Type */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono mb-1.5">
                Problem Type
              </label>
              <select
                id="input-problem-type"
                value={formData.problemType}
                onChange={(e) => setFormData({ ...formData, problemType: e.target.value })}
                className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              >
                <option value="Payment failed">Payment failed</option>
                <option value="Abandoned payment">Abandoned checkout / payment</option>
                <option value="Overdue invoice">Overdue invoice</option>
                <option value="Repeated gateway decline">Repeated gateway decline</option>
                <option value="Subscription mandate renewal failure">
                  Subscription mandate failure
                </option>
              </select>
            </div>

            {/* Failure Reason */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono mb-1.5">
                Failure Reason / Code
              </label>
              <input
                id="input-failure-reason"
                type="text"
                required
                value={formData.failureReason}
                onChange={(e) => setFormData({ ...formData, failureReason: e.target.value })}
                placeholder="Bank declined the transaction"
                className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            {/* Previous Attempts */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono mb-1.5">
                Previous Retry Attempts
              </label>
              <input
                id="input-prev-attempts"
                type="number"
                min="0"
                value={formData.previousAttempts}
                onChange={(e) =>
                  setFormData({ ...formData, previousAttempts: Number(e.target.value) })
                }
                className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#71717A] mt-1 block">
                Safety cap: Max 2 automatic retries
              </span>
            </div>

            {/* Previous Successful Payments */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono mb-1.5">
                Prior Successful Payments
              </label>
              <input
                id="input-prev-success"
                type="number"
                min="0"
                value={formData.previousSuccessfulPayments}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    previousSuccessfulPayments: Number(e.target.value),
                  })
                }
                className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#71717A] mt-1 block">
                Signals customer lifetime reliability
              </span>
            </div>

            {/* Time Since Issue */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono mb-1.5">
                Time Since Failure / Issue
              </label>
              <input
                id="input-time-since"
                type="text"
                value={formData.timeSinceIssue}
                onChange={(e) => setFormData({ ...formData, timeSinceIssue: e.target.value })}
                placeholder="18 minutes"
                className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#71717A] mt-1 block">
                Determines intent decay & channel
              </span>
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono mb-1.5">
                Additional Merchant Context
              </label>
              <input
                id="input-context"
                type="text"
                value={formData.additionalContext || ""}
                onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                placeholder="Customer usually pays immediately"
                className="w-full bg-[#121214] border border-[#27272A] focus:border-[#E52B50] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#71717A] mt-1 block">
                Domain nuances fed directly to agent
              </span>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#27272A]">
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
              <Shield className="w-4 h-4 text-[#E52B50]" />
              <span>
                Real AI analysis via server-side Gemini core • Deterministic policy check enforces
                safety
              </span>
            </div>

            <button
              id="btn-analyze-recover"
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#E52B50] to-[#B53389] hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-[#E52B50]/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Agent Investigating Revenue Event...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white" />
                  <span>Analyze & Recover</span>
                  <ArrowRight className="w-4 h-4 text-white/80" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Analysis Error Message */}
        {analysisError && (
          <div
            id="analysis-error-banner"
            className="mt-5 p-4 rounded-xl bg-[#1C1215] border border-[#E52B50]/40 text-[#FA7298] flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[#E52B50] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="font-bold text-white uppercase font-mono block">
                AI Pipeline Offline / Error
              </strong>
              <p className="text-[#FFB3C2]">{analysisError}</p>
              <p className="text-[#A1A1AA] text-[11px] pt-1">
                Per fintech safety guidelines, no hallucinated recovery decision was fabricated.
                Automated execution was halted.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Real-Time Autonomous Stepper */}
      {(currentCase || isAnalyzing) && (
        <AgentStepper
          currentState={currentCase ? currentCase.currentState : "REVENUE_AT_RISK"}
          isAnalyzing={isAnalyzing}
          activeStepIndex={activeStepIndex}
        />
      )}

      {/* 4. Active Case Results & Execution Flow */}
      {currentCase && (
        <div className="space-y-6">
          {/* AI Analysis Unavailable Card - Zero Hallucination Halt */}
          {currentCase.currentState === "AI_ANALYSIS_UNAVAILABLE" && (
            <div
              id="ai-analysis-unavailable-card"
              className="p-6 rounded-2xl bg-[#1C1215] border border-[#E52B50]/50 text-white space-y-4 shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E52B50]/15 border border-[#E52B50]/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-[#E52B50]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                      AI Analysis Unavailable
                    </h3>
                    <p className="text-xs text-[#FA7298]">
                      Zero-Hallucination Safety Protocol Engaged
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#E52B50]/20 text-[#FA7298] border border-[#E52B50]/40">
                  AUTOMATED RECOVERY STOPPED
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] text-xs space-y-2 font-mono">
                <div className="text-white">
                  <strong className="text-[#FA7298] uppercase font-mono mr-2">Reason:</strong>
                  AI service is temporarily unavailable. No autonomous recovery decision was made.
                </div>
                <p className="text-[#A1A1AA] text-[11px] leading-relaxed font-sans">
                  Per strict fintech governance, no confidence score, recovery probability, or strategy was fabricated. The case remains protected at risk without autonomous intervention.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs text-[#71717A] font-mono">
                  Event: {currentCase.input.customer} • ₹{currentCase.input.amount.toLocaleString("en-IN")}
                </span>
                <button
                  id="btn-retry-ai-analysis"
                  type="button"
                  onClick={() => onAnalyze(currentCase.input)}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E52B50] to-[#B53389] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                  <span>Retry AI Analysis</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Diagnosis, Signals & Strategy Matrix */}
          {currentCase.currentState !== "AI_ANALYSIS_UNAVAILABLE" &&
            currentCase.diagnosis &&
            currentCase.recommendedAction && (
              <AnalysisCard
              analysis={{
                diagnosis: currentCase.diagnosis,
                riskLevel: currentCase.riskLevel || "MEDIUM",
                signals: currentCase.signals || [],
                candidateActions: currentCase.candidateActions || [],
                recommendedAction: currentCase.recommendedAction,
                confidence: currentCase.confidence || 0.85,
                expectedRecoveryProbability: currentCase.expectedRecoveryProbability || 0.75,
                expectedRecoveryAmount: currentCase.expectedRecoveryAmount || 0,
                reasoning: currentCase.reasoning || "",
                rejectedAlternatives: currentCase.rejectedAlternatives || [],
                requiresMerchantApproval:
                  currentCase.policyResult?.requiresMerchantApproval || false,
              }}
              amount={currentCase.input.amount}
              input={currentCase.input}
              onSelectStrategy={onSelectStrategy}
              canSelectStrategy={
                currentCase.currentState !== "ACTION_EXECUTED" &&
                currentCase.currentState !== "ACTUALLY_RECOVERED" &&
                currentCase.currentState !== "PAYMENT_SUCCESSFUL"
              }
            />
          )}

          {/* Deterministic Safety Policy Check */}
          {currentCase.currentState !== "AI_ANALYSIS_UNAVAILABLE" &&
            currentCase.policyResult && (
              <PolicyCheckCard
                policyResult={currentCase.policyResult}
                currentState={currentCase.currentState}
                onApproveException={onApprovePolicyException}
                onSelectStrategy={onSelectStrategy}
                isApproving={isApproving}
              />
            )}

          {/* Action Execution & Payment Outcome Measurement */}
          {currentCase.currentState !== "AI_ANALYSIS_UNAVAILABLE" &&
            currentCase.recommendedAction && (
              <ExecutionPanel
                caseData={currentCase}
                onExecute={onExecute}
                onSimulateOutcome={onSimulateOutcome}
                isExecuting={isExecuting}
                isSimulating={isSimulating}
              />
            )}

          {/* Decision Trace */}
          {currentCase.decisionTrace && currentCase.decisionTrace.length > 0 && (
            <DecisionTraceView trace={currentCase.decisionTrace} caseId={currentCase.id} />
          )}
        </div>
      )}
    </div>
  );
};
