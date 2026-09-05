import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  FileCheck2,
  Info,
} from "lucide-react";
import { CaseState, PolicyCheckResult, RecoveryAction } from "../types";

interface PolicyCheckCardProps {
  policyResult: PolicyCheckResult;
  currentState: CaseState;
  onApproveException: (reason: string) => Promise<void>;
  onSelectStrategy?: (action: RecoveryAction) => void;
  isApproving: boolean;
}

export const PolicyCheckCard: React.FC<PolicyCheckCardProps> = ({
  policyResult,
  currentState,
  onApproveException,
  onSelectStrategy,
  isApproving,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState(
    "Merchant verified customer balance & approved manual retry exception."
  );

  const isBlocked =
    policyResult.requiresMerchantApproval ||
    currentState === "MERCHANT_APPROVAL_REQUIRED";

  const isApproved =
    policyResult.policyApproved ||
    currentState === "POLICY_APPROVED" ||
    currentState === "ACTION_EXECUTED" ||
    currentState === "ACTUALLY_RECOVERED" ||
    currentState === "PAYMENT_FAILED";

  const handleConfirmApproval = async () => {
    await onApproveException(overrideReason);
    setShowModal(false);
  };

  return (
    <div
      id="policy-safety-card"
      className={`border rounded-2xl p-6 shadow-xl transition-all space-y-5 ${
        isBlocked
          ? "bg-[#161618] border-[#F59E0B]/50 shadow-[#F59E0B]/5"
          : "bg-[#161618] border-[#27272A]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
            04. Safety Policy Check
          </span>
          <span className="w-1 h-1 rounded-full bg-[#71717A]" />
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
              Merchant Safety Policy Gate
            </h3>
            <p className="text-[11px] text-[#A1A1AA]">
              Deterministic guardrail engine evaluating autonomous agent safety
            </p>
          </div>
        </div>

        <div>
          {isBlocked ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-[#F59E0B]/15 border border-[#F59E0B]/50 text-[#F59E0B]">
              <Lock className="w-3 h-3" />
              MERCHANT APPROVAL REQUIRED
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-[#10B981]/15 border border-[#10B981]/50 text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              POLICY CHECK PASSED
            </span>
          )}
        </div>
      </div>

      {/* Blocked Warning Banner */}
      {isBlocked && (
        <div className="bg-[#1C1712] border border-[#F59E0B]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold text-[#FDE68A] uppercase font-mono block">
                Automatic Recovery Blocked by Policy
              </span>
              <p className="text-xs text-[#FCD34D] mt-0.5 leading-relaxed">
                The agent cannot execute this recovery strategy automatically because it violates
                deterministic merchant limits:
              </p>
              <ul className="mt-1.5 space-y-1">
                {policyResult.violations.map((violation, idx) => (
                  <li
                    key={idx}
                    className="text-[11px] font-mono text-[#FEE3A2] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    {violation}
                  </li>
                ))}
              </ul>

              {currentState === "MERCHANT_APPROVAL_REQUIRED" && (
                <div className="mt-3.5 flex flex-wrap items-center gap-3">
                  <button
                    id="btn-open-merchant-approval"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Review & Grant Merchant Approval
                  </button>

                  {policyResult.violations.some((v) =>
                    v.toLowerCase().includes("retry ceiling")
                  ) &&
                    onSelectStrategy && (
                      <button
                        type="button"
                        id="btn-switch-safe-alternative"
                        onClick={() => onSelectStrategy("CREATE_RECOVERY_PAYMENT_LINK")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161618] hover:bg-[#27272A] border border-[#10B981]/50 text-[#10B981] text-xs font-bold transition-all shadow cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Evaluate Alternative Strategy: Payment Link
                      </button>
                    )}

                  <span className="text-[11px] text-[#A1A1AA]">
                    Manual operator authorization bypass or switch to non-card strategy
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rules Evaluation Matrix */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold block">
          Deterministic Rule Verification Matrix
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {policyResult.ruleEvaluations.map((rule) => (
            <div
              key={rule.ruleId}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                rule.passed
                  ? "bg-[#121214] border-[#27272A]"
                  : "bg-[#1C1215] border-[#E52B50]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#A1A1AA]">
                    [{rule.ruleId}]
                  </span>
                  <span className="font-semibold text-white truncate">{rule.ruleName}</span>
                </div>
                {rule.passed ? (
                  <span className="text-[#10B981] flex items-center gap-1 text-[10px] font-mono font-bold shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> PASSED
                  </span>
                ) : (
                  <span className="text-[#FA7298] flex items-center gap-1 text-[10px] font-mono font-bold shrink-0">
                    <XCircle className="w-3 h-3" /> VIOLATED
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] font-mono mb-1.5">
                <span>Cap: {rule.threshold}</span>
                <span>Eval: <strong className="text-white">{rule.evaluatedValue}</strong></span>
              </div>

              <p className="text-[11px] text-[#A1A1AA] leading-tight line-clamp-2">
                {rule.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#27272A] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B]">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase font-mono">
                  Confirm Merchant Policy Override
                </h4>
                <p className="text-xs text-[#A1A1AA]">
                  Authorize automated execution for this high-risk revenue event
                </p>
              </div>
            </div>

            <div className="bg-[#121214] p-3.5 rounded-xl border border-[#27272A] space-y-2">
              <span className="text-[11px] font-mono text-[#F59E0B] uppercase font-bold block">
                Safety Violations Overridden:
              </span>
              <ul className="space-y-1">
                {policyResult.violations.map((v, i) => (
                  <li key={i} className="text-xs text-[#E4E4E7] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">
                Supervisor Override Justification Note
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={2}
                className="w-full bg-[#121214] border border-[#27272A] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E52B50]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white bg-[#121214] hover:bg-[#27272A] border border-[#27272A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-override"
                onClick={handleConfirmApproval}
                disabled={isApproving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#F59E0B] hover:bg-[#D97706] transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isApproving ? "Authorizing..." : "Authorize Recovery Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
