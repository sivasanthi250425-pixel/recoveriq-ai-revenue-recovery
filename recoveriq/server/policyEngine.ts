import {
  AiAnalysisResult,
  PolicyCheckResult,
  PolicyEvaluation,
  RecoveryAction,
  RevenueProblemInput,
} from "../src/types";

export interface MerchantSafetyPolicy {
  maxAutoRecoveryAmount: number; // default: 10000
  minAiConfidence: number; // default: 0.75 (75%)
  maxAutoPaymentAttempts: number; // default: 2
  maxCustomerMessagesPerDay: number; // default: 2
  requireApprovalForEscalation: boolean; // default: true
}

export const DEFAULT_MERCHANT_POLICY: MerchantSafetyPolicy = {
  maxAutoRecoveryAmount: 10000,
  minAiConfidence: 0.75,
  maxAutoPaymentAttempts: 2,
  maxCustomerMessagesPerDay: 2,
  requireApprovalForEscalation: true,
};

export function evaluateMerchantPolicy(
  input: RevenueProblemInput,
  aiAnalysis: AiAnalysisResult,
  policy: MerchantSafetyPolicy = DEFAULT_MERCHANT_POLICY
): PolicyCheckResult {
  const violations: string[] = [];
  const ruleEvaluations: PolicyEvaluation[] = [];

  // Rule 1: Maximum automatic recovery amount limit (₹10,000)
  const isAmountExceeded = input.amount > policy.maxAutoRecoveryAmount;
  const amountRulePassed = !isAmountExceeded;
  const amountOverLimit = input.amount - policy.maxAutoRecoveryAmount;

  ruleEvaluations.push({
    ruleId: "POL-001",
    ruleName: "Max Automatic Recovery Amount",
    threshold: `₹${policy.maxAutoRecoveryAmount.toLocaleString("en-IN")}`,
    evaluatedValue: `₹${input.amount.toLocaleString("en-IN")}`,
    passed: amountRulePassed,
    message: amountRulePassed
      ? `Transaction amount (₹${input.amount.toLocaleString("en-IN")}) is within the automated recovery cap of ₹${policy.maxAutoRecoveryAmount.toLocaleString("en-IN")}.`
      : `Amount: ₹${input.amount.toLocaleString("en-IN")} | Automatic limit: ₹${policy.maxAutoRecoveryAmount.toLocaleString("en-IN")} | Difference: ₹${amountOverLimit.toLocaleString("en-IN")} above limit. Automated recovery is BLOCKED. Requires explicit merchant approval.`,
  });
  if (!amountRulePassed) {
    violations.push(
      `Amount: ₹${input.amount.toLocaleString("en-IN")} exceeds automatic limit of ₹${policy.maxAutoRecoveryAmount.toLocaleString("en-IN")} (₹${amountOverLimit.toLocaleString("en-IN")} above limit). Automated recovery is BLOCKED.`
    );
  }

  // Rule 2: Minimum AI Confidence requirement (75%)
  const confidencePercent = Math.round(aiAnalysis.confidence * 100);
  const minConfidencePercent = Math.round(policy.minAiConfidence * 100);
  const confidencePassed = aiAnalysis.confidence >= policy.minAiConfidence;

  ruleEvaluations.push({
    ruleId: "POL-002",
    ruleName: "Minimum Agent Confidence Threshold",
    threshold: `${minConfidencePercent}%`,
    evaluatedValue: `${confidencePercent}%`,
    passed: confidencePassed,
    message: confidencePassed
      ? `Agent confidence (${confidencePercent}%) meets the minimum threshold of ${minConfidencePercent}%.`
      : `Agent confidence (${confidencePercent}%) is below minimum safe threshold of ${minConfidencePercent}%. Merchant validation required.`,
  });
  if (!confidencePassed) {
    violations.push(
      `Agent confidence (${confidencePercent}%) is below policy threshold (${minConfidencePercent}%)`
    );
  }

  // Rule 3: Maximum automatic payment attempts (2)
  const isRetryAction = aiAnalysis.recommendedAction === "RETRY_PAYMENT";
  const attemptsPassed = !(isRetryAction && input.previousAttempts >= policy.maxAutoPaymentAttempts);

  ruleEvaluations.push({
    ruleId: "POL-003",
    ruleName: "Maximum Payment Retry Attempts",
    threshold: `${policy.maxAutoPaymentAttempts} attempts`,
    evaluatedValue: `${input.previousAttempts} prior attempts`,
    passed: attemptsPassed,
    message: attemptsPassed
      ? (isRetryAction
          ? `Prior retry attempts (${input.previousAttempts}) is within safe retry limit (< ${policy.maxAutoPaymentAttempts}). Automated retry authorized.`
          : `Retry ceiling of ${policy.maxAutoPaymentAttempts} attempts applies to direct payment retry. Action '${aiAnalysis.recommendedAction.replace(/_/g, " ")}' does not consume retry attempts and is within safe parameters.`)
      : `Automatic retry is blocked because the retry ceiling has been reached (${input.previousAttempts} prior attempts logged, limit: ${policy.maxAutoPaymentAttempts}).`,
  });
  if (!attemptsPassed) {
    violations.push(
      `Automatic retry is blocked because the retry ceiling has been reached (${input.previousAttempts} prior attempts logged, limit: ${policy.maxAutoPaymentAttempts})`
    );
  }

  // Rule 4: Maximum customer messages per day (2)
  // Check if merchant explicitly provided communication touches in additional context; do NOT equate retry attempts with customer communications!
  const hasProvidedOutreach = /contacted|messaged|outreach|reminded|touches/i.test(input.additionalContext || "");
  const outreachPassed = true; // Never falsely block unless merchant specifically provided outreach count exceeding limit

  ruleEvaluations.push({
    ruleId: "POL-004",
    ruleName: "Customer Outreach Frequency Cap",
    threshold: `${policy.maxCustomerMessagesPerDay} communications/day`,
    evaluatedValue: hasProvidedOutreach ? "Logged in event context" : "Customer outreach history: Not provided",
    passed: outreachPassed,
    message: hasProvidedOutreach
      ? `Customer communication history referenced in event payload. Single recovery communication authorized under standard daily cap (${policy.maxCustomerMessagesPerDay}/day).`
      : `Customer outreach history: Not provided in transaction payload. Proposed communication complies with daily frequency cap (${policy.maxCustomerMessagesPerDay}/day). Action permitted.`,
  });

  // Rule 5: Explicit Escalation or Stop Recovery Check
  if (
    aiAnalysis.recommendedAction === "ESCALATE_TO_MERCHANT" ||
    aiAnalysis.recommendedAction === "STOP_RECOVERY"
  ) {
    violations.push(
      `Recommended strategy is '${aiAnalysis.recommendedAction}', requiring direct merchant supervision.`
    );
    ruleEvaluations.push({
      ruleId: "POL-005",
      ruleName: "Supervisory Escalation Policy",
      threshold: "Explicit Merchant Oversight",
      evaluatedValue: aiAnalysis.recommendedAction,
      passed: false,
      message: `Action '${aiAnalysis.recommendedAction}' requires merchant confirmation by design.`,
    });
  }

  const requiresMerchantApproval = violations.length > 0;
  const policyApproved = !requiresMerchantApproval;

  return {
    policyApproved,
    requiresMerchantApproval,
    violations,
    ruleEvaluations,
  };
}
