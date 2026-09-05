import React from "react";
import { ShieldCheck, Lock, AlertTriangle, Shield, CheckCircle2, Sliders } from "lucide-react";

export const SafetyPoliciesView: React.FC = () => {
  return (
    <div className="space-y-6 pb-16 pt-2">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E52B50]" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono uppercase">
            Merchant Safety Policies & Guardrails
          </h2>
        </div>
        <p className="text-sm text-[#A1A1AA] max-w-3xl">
          RecoverIQ operates on a strict deterministic safety engine. The AI model is strictly
          an advisory engine that generates recommendations; the policy engine deterministically
          authorizes or halts automated execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Policy 1 */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E52B50]/15 text-[#E52B50] border border-[#E52B50]/30">
              POL-001
            </span>
            <span className="text-xs font-mono font-bold text-[#10B981] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE ENFORCEMENT
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Maximum Automatic Recovery Amount
          </h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Transactions with revenue at risk exceeding this limit are automatically blocked from
            silent background retries or automated payment creation, requiring human merchant
            review.
          </p>
          <div className="bg-[#121214] p-3.5 rounded-xl border border-[#27272A] flex items-center justify-between">
            <span className="text-xs text-[#71717A] font-mono">Current Policy Limit:</span>
            <span className="text-sm font-mono font-bold text-white">₹10,000 INR</span>
          </div>
        </div>

        {/* Policy 2 */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E52B50]/15 text-[#E52B50] border border-[#E52B50]/30">
              POL-002
            </span>
            <span className="text-xs font-mono font-bold text-[#10B981] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE ENFORCEMENT
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Minimum Agent Confidence Threshold
          </h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            The AI decision engine must attain an algorithmic confidence score equal to or above this
            threshold. Low-confidence edge cases are routed to the merchant approval queue.
          </p>
          <div className="bg-[#121214] p-3.5 rounded-xl border border-[#27272A] flex items-center justify-between">
            <span className="text-xs text-[#71717A] font-mono">Current Policy Limit:</span>
            <span className="text-sm font-mono font-bold text-white">75% Confidence</span>
          </div>
        </div>

        {/* Policy 3 */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E52B50]/15 text-[#E52B50] border border-[#E52B50]/30">
              POL-003
            </span>
            <span className="text-xs font-mono font-bold text-[#10B981] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE ENFORCEMENT
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Maximum Payment Retry Attempts
          </h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Prevents card network spamming and issuer penalties. If customer transaction has already
            been attempted 2 or more times, automated retries are permanently blocked.
          </p>
          <div className="bg-[#121214] p-3.5 rounded-xl border border-[#27272A] flex items-center justify-between">
            <span className="text-xs text-[#71717A] font-mono">Current Policy Limit:</span>
            <span className="text-sm font-mono font-bold text-white">2 Prior Attempts</span>
          </div>
        </div>

        {/* Policy 4 */}
        <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E52B50]/15 text-[#E52B50] border border-[#E52B50]/30">
              POL-004
            </span>
            <span className="text-xs font-mono font-bold text-[#10B981] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE ENFORCEMENT
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Customer Outreach Frequency Cap
          </h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Protects customer relationship and brand goodwill. Automated reminders or alternate
            links are restricted to prevent customer harassment.
          </p>
          <div className="bg-[#121214] p-3.5 rounded-xl border border-[#27272A] flex items-center justify-between">
            <span className="text-xs text-[#71717A] font-mono">Current Policy Limit:</span>
            <span className="text-sm font-mono font-bold text-white">2 Messages / Day</span>
          </div>
        </div>
      </div>

      {/* Safety Invariant Notice - Bento Card */}
      <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#E52B50]/15 border border-[#E52B50]/30 flex items-center justify-center text-[#E52B50] shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase font-mono">
            Zero-Bypass Architecture Guarantee
          </h4>
          <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed">
            No prompt injection, statistical edge case, or agent confidence score can override
            merchant safety policies. Even if the AI outputs 100% confidence on a ₹50,000
            transaction, the policy check will block execution and mandate human operator approval.
          </p>
        </div>
      </div>
    </div>
  );
};
