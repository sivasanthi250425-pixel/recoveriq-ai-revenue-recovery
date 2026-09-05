import {
  CaseState,
  DecisionTraceEntry,
  PerformanceMetrics,
  RecoveryCase,
} from "../src/types";

class CaseStore {
  private cases: Map<string, RecoveryCase> = new Map();

  constructor() {
    this.seedInitialCases();
  }

  public getAllCases(): RecoveryCase[] {
    return Array.from(this.cases.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCase(id: string): RecoveryCase | undefined {
    return this.cases.get(id);
  }

  public saveCase(caseData: RecoveryCase): RecoveryCase {
    this.cases.set(caseData.id, caseData);
    return caseData;
  }

  public updateCase(id: string, updates: Partial<RecoveryCase>): RecoveryCase | undefined {
    const existing = this.cases.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.cases.set(id, updated);
    return updated;
  }

  public addTraceEntry(
    id: string,
    entry: Omit<DecisionTraceEntry, "id" | "timestamp">
  ): RecoveryCase | undefined {
    const existing = this.cases.get(id);
    if (!existing) return undefined;

    const timeStr = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const newTraceEntry: DecisionTraceEntry = {
      id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
      ...entry,
    };

    existing.decisionTrace = [...existing.decisionTrace, newTraceEntry];
    existing.updatedAt = new Date().toISOString();
    this.cases.set(id, existing);
    return existing;
  }

  public getMetrics(): PerformanceMetrics {
    const cases = Array.from(this.cases.values());
    const totalRevenueAtRisk = cases.reduce((acc, c) => acc + (c.input.amount || 0), 0);
    const totalExpectedRecovery = cases.reduce(
      (acc, c) => acc + (c.expectedRecoveryAmount || 0),
      0
    );
    const totalActuallyRecovered = cases.reduce(
      (acc, c) => acc + (c.actualRecoveredAmount || 0),
      0
    );

    const recoveryRate =
      totalRevenueAtRisk > 0
        ? Math.round((totalActuallyRecovered / totalRevenueAtRisk) * 1000) / 10
        : 0;

    const casesInvestigated = cases.length;

    const actionsExecuted = cases.filter((c) =>
      [
        "ACTION_EXECUTED",
        "PAYMENT_PENDING",
        "PAYMENT_SUCCESSFUL",
        "ACTUALLY_RECOVERED",
        "PAYMENT_FAILED",
      ].includes(c.currentState)
    ).length;

    const actionsBlockedByPolicy = cases.filter(
      (c) =>
        c.policyResult?.requiresMerchantApproval === true ||
        c.currentState === "MERCHANT_APPROVAL_REQUIRED"
    ).length;

    return {
      totalRevenueAtRisk,
      totalExpectedRecovery,
      totalActuallyRecovered,
      recoveryRate,
      casesInvestigated,
      actionsExecuted,
      actionsBlockedByPolicy,
    };
  }

  public resetToSeeds(): void {
    this.cases.clear();
    this.seedInitialCases();
  }

  private seedInitialCases(): void {
    // We seed two benchmark demo cases to demonstrate historic metrics right out of the box,
    // each clearly marked with isDemoCase: true and having full audit traces.
    const now = new Date();
    const tMinus1 = new Date(now.getTime() - 25 * 60 * 1000).toISOString();
    const tMinus2 = new Date(now.getTime() - 95 * 60 * 1000).toISOString();

    const case1: RecoveryCase = {
      id: "case_demo_recov_001",
      createdAt: tMinus1,
      updatedAt: tMinus1,
      isDemoCase: true,
      input: {
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
      currentState: "POLICY_APPROVED",
      diagnosis:
        "Soft decline from issuer bank during checkout authorization. Customer has high lifetime loyalty with 4 successful settlements.",
      riskLevel: "LOW",
      signals: [
        {
          name: "Payment History Loyalty",
          value: "4 successful transactions with 0 chargebacks",
          impact: "positive",
        },
        {
          name: "Failure Taxonomy",
          value: "Soft issuer decline (Network Code 54)",
          impact: "neutral",
        },
        {
          name: "Latency Window",
          value: "18 mins elapsed (Warm intent window < 2 hours)",
          impact: "positive",
        },
      ],
      candidateActions: [
        {
          action: "CREATE_RECOVERY_PAYMENT_LINK",
          reason: "Send dynamic 1-click recovery payment link via WhatsApp / SMS",
          estimatedRecoveryProbability: 0.88,
          estimatedRecoveryAmount: 6600,
        },
        {
          action: "RETRY_PAYMENT",
          reason: "Safe automated retry through configured payment provider",
          estimatedRecoveryProbability: 0.76,
          estimatedRecoveryAmount: 5700,
        },
      ],
      recommendedAction: "CREATE_RECOVERY_PAYMENT_LINK",
      confidence: 0.91,
      expectedRecoveryProbability: 0.88,
      expectedRecoveryAmount: 6600,
      reasoning:
        "Customer has high payment intent and 4 previous successful payments. Soft bank decline indicates transient authorization issue best resolved via 1-click recovery payment link.",
      rejectedAlternatives: [
        {
          action: "SEND_REMINDER",
          reason: "Unnecessary user friction for an active checkout session.",
        },
      ],
      policyResult: {
        policyApproved: true,
        requiresMerchantApproval: false,
        violations: [],
        ruleEvaluations: [
          {
            ruleId: "POL-001",
            ruleName: "Max Automatic Recovery Amount",
            threshold: "₹10,000",
            evaluatedValue: "₹7,500",
            passed: true,
            message: "Amount ₹7,500 is within the ₹10,000 auto-recovery safety limit.",
          },
          {
            ruleId: "POL-002",
            ruleName: "Minimum Agent Confidence Threshold",
            threshold: "75%",
            evaluatedValue: "91%",
            passed: true,
            message: "Agent confidence (91%) meets safety threshold.",
          },
          {
            ruleId: "POL-003",
            ruleName: "Maximum Payment Retry Attempts",
            threshold: "2 attempts",
            evaluatedValue: "1 prior attempts",
            passed: true,
            message: "Attempt count (1) within safety limit.",
          },
          {
            ruleId: "POL-004",
            ruleName: "Customer Outreach Frequency Cap",
            threshold: "2 communications/day",
            evaluatedValue: "Customer outreach history: Not provided",
            passed: true,
            message: "Customer outreach history: Not provided in transaction payload. Proposed communication complies with daily frequency cap (2/day). Action permitted.",
          },
        ],
      },
      actualRecoveredAmount: 0,
      decisionTrace: [
        {
          id: "tr_seed_1",
          timestamp: "18:15:10",
          phase: "REVENUE_EVENT_RECEIVED",
          title: "Revenue event received",
          detail: "Payment failure registered for Arjun (₹7,500).",
          status: "info",
        },
        {
          id: "tr_seed_2",
          timestamp: "18:15:12",
          phase: "ANALYZING_PAYMENT_SIGNALS",
          title: "Payment signals analyzed",
          detail: "4 previous successful charges verified. Issuer failure classified as transient soft decline.",
          status: "info",
        },
        {
          id: "tr_seed_3",
          timestamp: "18:15:13",
          phase: "DIAGNOSING_REVENUE_RISK",
          title: "Revenue risk diagnosed",
          detail: "Diagnosed as soft issuer decline. Customer intent active.",
          status: "info",
        },
        {
          id: "tr_seed_4",
          timestamp: "18:15:14",
          phase: "EVALUATING_RECOVERY_OPTIONS",
          title: "Recovery strategies evaluated",
          detail: "Ranked 2 candidate strategies. CREATE_RECOVERY_PAYMENT_LINK yielded highest expected recovery (₹6,600).",
          status: "info",
        },
        {
          id: "tr_seed_5",
          timestamp: "18:15:15",
          phase: "SELECTING_RECOVERY_STRATEGY",
          title: "Strategy selected",
          detail: "Selected CREATE_RECOVERY_PAYMENT_LINK with 91% agent confidence.",
          status: "info",
        },
        {
          id: "tr_seed_6",
          timestamp: "18:15:16",
          phase: "CHECKING_MERCHANT_POLICY",
          title: "Merchant policy approved action",
          detail: "All safety rules passed. Zero policy violations detected.",
          status: "success",
        },
      ],
    };

    const case2: RecoveryCase = {
      id: "case_demo_blocked_002",
      createdAt: tMinus2,
      updatedAt: tMinus2,
      isDemoCase: true,
      input: {
        customer: "Zenith Retail Corp",
        amount: 22000,
        currency: "INR",
        problemType: "Overdue invoice",
        failureReason: "Corporate mandate authorization pending",
        previousAttempts: 2,
        previousSuccessfulPayments: 2,
        timeSinceIssue: "2 days",
        additionalContext: "Quarterly ERP subscription billing invoice",
      },
      currentState: "MERCHANT_APPROVAL_REQUIRED",
      diagnosis:
        "High-value B2B mandate requires explicit merchant authorization review. Invoice value exceeds auto-recovery safety limits.",
      riskLevel: "HIGH",
      signals: [
        {
          name: "Transaction Value Risk",
          value: "₹22,000 exceeds ₹10,000 safety threshold",
          impact: "negative",
        },
        {
          name: "Attempt Density",
          value: "2 prior auto-attempts without resolution",
          impact: "negative",
        },
        {
          name: "Account Standing",
          value: "2 previous corporate clearances",
          impact: "positive",
        },
      ],
      candidateActions: [
        {
          action: "OFFER_ALTERNATIVE_RECOVERY_PATH",
          reason: "Generate direct NEFT/RTGS virtual account invoice link",
          estimatedRecoveryProbability: 0.72,
          estimatedRecoveryAmount: 15840,
        },
        {
          action: "ESCALATE_TO_MERCHANT",
          reason: "Escalate to account executive for personalized outreach",
          estimatedRecoveryProbability: 0.81,
          estimatedRecoveryAmount: 17820,
        },
      ],
      recommendedAction: "OFFER_ALTERNATIVE_RECOVERY_PATH",
      confidence: 0.82,
      expectedRecoveryProbability: 0.72,
      expectedRecoveryAmount: 15840,
      reasoning:
        "B2B corporate subscription accounts respond better to direct corporate banking links, avoiding repeated card charge locks.",
      rejectedAlternatives: [
        {
          action: "RETRY_PAYMENT",
          reason: "Repeated card retry will trigger bank mandate penalties.",
        },
      ],
      policyResult: {
        policyApproved: false,
        requiresMerchantApproval: true,
        violations: [
          "Amount ₹22,000 exceeds automatic recovery limit of ₹10,000",
          "Previous attempts (2) reached maximum safe retry threshold (2)",
        ],
        ruleEvaluations: [
          {
            ruleId: "POL-001",
            ruleName: "Max Automatic Recovery Amount",
            threshold: "₹10,000",
            evaluatedValue: "₹22,000",
            passed: false,
            message: "Amount ₹22,000 exceeds automated recovery limit of ₹10,000.",
          },
          {
            ruleId: "POL-002",
            ruleName: "Minimum Agent Confidence Threshold",
            threshold: "75%",
            evaluatedValue: "82%",
            passed: true,
            message: "Confidence 82% passes threshold.",
          },
          {
            ruleId: "POL-003",
            ruleName: "Maximum Payment Retry Attempts",
            threshold: "2 attempts",
            evaluatedValue: "2 prior attempts",
            passed: false,
            message: "Prior attempts reached maximum safety cap.",
          },
        ],
      },
      actualRecoveredAmount: 0,
      decisionTrace: [
        {
          id: "tr_seed_2_1",
          timestamp: "17:10:05",
          phase: "REVENUE_EVENT_RECEIVED",
          title: "Revenue event received",
          detail: "Overdue invoice registered for Zenith Retail Corp (₹22,000).",
          status: "info",
        },
        {
          id: "tr_seed_2_2",
          timestamp: "17:10:07",
          phase: "ANALYZING_PAYMENT_SIGNALS",
          title: "Payment signals analyzed",
          detail: "High-value ticket detected with 2 previous attempts.",
          status: "info",
        },
        {
          id: "tr_seed_2_3",
          timestamp: "17:10:09",
          phase: "DIAGNOSING_REVENUE_RISK",
          title: "Revenue risk diagnosed",
          detail: "Diagnosed as pending corporate mandate authorization. High value.",
          status: "info",
        },
        {
          id: "tr_seed_2_4",
          timestamp: "17:10:11",
          phase: "SELECTING_RECOVERY_STRATEGY",
          title: "Alternative path recommended",
          detail: "AI recommended OFFER_ALTERNATIVE_RECOVERY_PATH with expected recovery ₹15,840.",
          status: "info",
        },
        {
          id: "tr_seed_2_5",
          timestamp: "17:10:12",
          phase: "CHECKING_MERCHANT_POLICY",
          title: "Policy check — Merchant approval required",
          detail: "Blocked from automatic execution: Amount ₹22,000 exceeds ₹10,000 cap.",
          status: "warning",
        },
      ],
    };

    this.cases.set(case1.id, case1);
    this.cases.set(case2.id, case2);
  }
}

export const caseStore = new CaseStore();
