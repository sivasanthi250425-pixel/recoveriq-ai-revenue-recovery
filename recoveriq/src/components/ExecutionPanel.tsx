import React, { useState } from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  ExternalLink,
  CreditCard,
  Send,
  Link as LinkIcon,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";
import { CaseState, RecoveryCase, RecoveryExecutionResult } from "../types";

interface ExecutionPanelProps {
  caseData: RecoveryCase;
  onExecute: () => Promise<void>;
  onSimulateOutcome: (outcome: "SUCCESS" | "FAILURE") => Promise<void>;
  isExecuting: boolean;
  isSimulating: boolean;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  caseData,
  onExecute,
  onSimulateOutcome,
  isExecuting,
  isSimulating,
}) => {
  const { currentState, input, expectedRecoveryAmount, actualRecoveredAmount, executionResult } =
    caseData;

  const canExecute = currentState === "POLICY_APPROVED";
  const isExecuted = [
    "ACTION_EXECUTED",
    "PAYMENT_PENDING",
    "PAYMENT_SUCCESSFUL",
    "ACTUALLY_RECOVERED",
    "PAYMENT_FAILED",
  ].includes(currentState);

  const isActuallyRecovered = currentState === "ACTUALLY_RECOVERED";
  const isPaymentFailed = currentState === "PAYMENT_FAILED";

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "RETRY_PAYMENT":
        return <RefreshCw className="w-4 h-4 text-[#E52B50]" />;
      case "CREATE_RECOVERY_PAYMENT_LINK":
        return <LinkIcon className="w-4 h-4 text-[#E52B50]" />;
      case "SEND_REMINDER":
        return <Send className="w-4 h-4 text-[#E52B50]" />;
      default:
        return <CreditCard className="w-4 h-4 text-[#E52B50]" />;
    }
  };

  return (
    <div
      id="recovery-execution-panel"
      className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
            05. Execution & Ledger
          </span>
          <span className="w-1 h-1 rounded-full bg-[#71717A]" />
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
              Action Execution & Revenue Ledger
            </h3>
            <p className="text-[11px] text-[#A1A1AA]">
              Autonomous provider dispatch via PaymentProvider abstraction
            </p>
          </div>
        </div>

        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border ${
              isActuallyRecovered
                ? "bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]"
                : isPaymentFailed
                ? "bg-[#E52B50]/20 border-[#E52B50]/50 text-[#FA7298]"
                : isExecuted
                ? "bg-[#E52B50]/20 border-[#E52B50]/50 text-white"
                : "bg-[#121214] border-[#27272A] text-[#A1A1AA]"
            }`}
          >
            {currentState.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Revenue Accounting Breakdown - Bento Triple Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* At Risk */}
        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block mb-1">
            1. Revenue At Risk
          </span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            ₹{input.amount.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#71717A] block mt-1">
            Original unpaid transaction value
          </span>
        </div>

        {/* Expected Recovery */}
        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block mb-1">
            2. Expected Recovery (AI Model)
          </span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#E52B50]">
            ₹{Math.round(expectedRecoveryAmount || 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#71717A] block mt-1 font-sans">
            Statistical projection (NOT booked)
          </span>
        </div>

        {/* Actually Recovered */}
        <div
          className={`rounded-xl p-4 border transition-all ${
            isActuallyRecovered
              ? "bg-[#10B981]/15 border-[#10B981]/50 shadow-md shadow-[#10B981]/10"
              : "bg-[#121214] border-[#27272A]"
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block mb-1">
            3. Actually Recovered
          </span>
          <div
            className={`text-xl sm:text-2xl font-mono font-extrabold ${
              isActuallyRecovered ? "text-[#10B981]" : "text-[#71717A]"
            }`}
          >
            ₹{actualRecoveredAmount.toLocaleString("en-IN")}
          </div>
          <span
            className={`text-[10px] block mt-1 font-sans ${
              isActuallyRecovered ? "text-[#10B981] font-semibold" : "text-[#71717A]"
            }`}
          >
            {isActuallyRecovered
              ? "Verified settlement captured in bank account"
              : "Unverified — Requires payment settlement"}
          </span>
        </div>
      </div>

      {/* Execution Action Trigger */}
      {canExecute && !isExecuted && (
        <div className="bg-[#121214] border border-[#E52B50]/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white uppercase font-mono block">
              Safety Policy Approved — Ready for Dispatch
            </span>
            <p className="text-xs text-[#E4E4E7] mt-0.5">
              Execute approved strategy:{" "}
              <strong className="text-[#E52B50]">
                {caseData.recommendedAction?.replace(/_/g, " ")}
              </strong>{" "}
              via {caseData.executionResult?.provider || "PaymentProvider"}
            </p>
          </div>

          <button
            id="btn-execute-recovery"
            onClick={onExecute}
            disabled={isExecuting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E52B50] to-[#B53389] hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-[#E52B50]/25 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            {isExecuting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isExecuting ? "Executing Dispatch..." : "Execute Recovery Action"}</span>
          </button>
        </div>
      )}

      {/* Duplicate Execution Locked Notice */}
      {isExecuted && (
        <div
          id="duplicate-execution-locked"
          className="bg-[#121214] border border-[#27272A] rounded-xl p-3 text-xs flex items-center justify-between text-[#A1A1AA]"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Recovery action already executed for this event.</span>
          </span>
          <span className="text-[10px] font-mono uppercase text-[#71717A] bg-[#1E1E22] px-2 py-0.5 rounded border border-[#27272A]">
            Duplicate Execution Blocked
          </span>
        </div>
      )}

      {/* Dispatched Execution Details */}
      {executionResult && (
        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272A] pb-2.5">
            <div className="flex items-center gap-2">
              {getActionIcon(executionResult.action)}
              <span className="text-xs font-bold text-white font-mono uppercase">
                {executionResult.action.replace(/_/g, " ")} Dispatched
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#A1A1AA]">
              Provider: <strong className="text-white">{executionResult.provider}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">
                Execution Reference
              </span>
              <span className="font-mono text-white text-xs font-semibold">
                {executionResult.referenceId}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">
                Dispatched Timestamp
              </span>
              <span className="font-mono text-[#A1A1AA] text-xs">
                {new Date(executionResult.executedAt).toLocaleTimeString("en-GB")}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#E4E4E7] leading-relaxed bg-[#161618] p-3 rounded-xl border border-[#27272A]">
            {executionResult.summary}
          </p>

          {executionResult.paymentLink && (
            <div className="flex items-center justify-between bg-[#161618] p-3 rounded-xl border border-[#27272A] text-xs">
              <span className="text-[#A1A1AA] truncate font-mono text-[11px]">
                {executionResult.paymentLink}
              </span>
              <span className="text-[10px] font-mono uppercase text-[#E52B50] font-bold shrink-0 ml-2">
                Simulated 1-Click Link
              </span>
            </div>
          )}
        </div>
      )}

      {/* Outcome Simulator Controls */}
      {isExecuted && (
        <div className="border border-[#27272A] bg-[#121214] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase font-mono block">
                Simulate Payment Settlement (MVP Verification)
              </span>
              <p className="text-xs text-[#A1A1AA]">
                Verify outcome callback to update ledger. Expected recovery is NOT booked revenue.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              id="btn-simulate-success"
              onClick={() => onSimulateOutcome("SUCCESS")}
              disabled={isSimulating || isActuallyRecovered}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isActuallyRecovered
                  ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 cursor-default"
                  : "bg-[#10B981] hover:bg-[#059669] text-black hover:text-white cursor-pointer"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Successful Payment (₹{input.amount.toLocaleString("en-IN")})</span>
            </button>

            <button
              id="btn-simulate-failed"
              onClick={() => onSimulateOutcome("FAILURE")}
              disabled={isSimulating || isPaymentFailed}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isPaymentFailed
                  ? "bg-[#E52B50]/20 text-[#FA7298] border border-[#E52B50]/40 cursor-default"
                  : "bg-[#161618] hover:bg-[#27272A] border border-[#E52B50]/40 text-[#FA7298] cursor-pointer"
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Failed Payment</span>
            </button>

            {isActuallyRecovered && (
              <span className="text-xs text-[#10B981] font-mono flex items-center gap-1 font-semibold ml-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ₹{input.amount.toLocaleString("en-IN")} BOOKED IN LEDGER
              </span>
            )}

            {isPaymentFailed && (
              <span className="text-xs text-[#FA7298] font-mono flex items-center gap-1 font-semibold ml-auto">
                <XCircle className="w-3.5 h-3.5" />
                PAYMENT RECOVERY FAILED — ACTUAL RECOVERED ₹0
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
