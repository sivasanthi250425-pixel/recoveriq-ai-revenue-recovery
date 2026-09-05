export type RecoveryAction =
  | 'RETRY_PAYMENT'
  | 'CREATE_RECOVERY_PAYMENT_LINK'
  | 'SEND_REMINDER'
  | 'OFFER_ALTERNATIVE_RECOVERY_PATH'
  | 'ESCALATE_TO_MERCHANT'
  | 'STOP_RECOVERY'
  | 'NO_ACTION';

export type CaseState =
  | 'REVENUE_AT_RISK'
  | 'AI_ANALYSIS_UNAVAILABLE'
  | 'AI_ANALYZED'
  | 'DECISION_MADE'
  | 'POLICY_APPROVED'
  | 'MERCHANT_APPROVAL_REQUIRED'
  | 'ACTION_EXECUTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUCCESSFUL'
  | 'ACTUALLY_RECOVERED'
  | 'PAYMENT_FAILED'
  | 'RECOVERY_STOPPED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PaymentSignal {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface CandidateAction {
  action: RecoveryAction;
  reason: string;
  estimatedRecoveryProbability: number;
  estimatedRecoveryAmount: number;
}

export interface RejectedAlternative {
  action: RecoveryAction;
  reason: string;
}

export interface AiAnalysisResult {
  diagnosis: string;
  riskLevel: RiskLevel;
  signals: PaymentSignal[];
  candidateActions: CandidateAction[];
  recommendedAction: RecoveryAction;
  confidence: number;
  expectedRecoveryProbability: number;
  expectedRecoveryAmount: number;
  reasoning: string;
  rejectedAlternatives: RejectedAlternative[];
  requiresMerchantApproval: boolean;
}

export interface PolicyEvaluation {
  ruleId: string;
  ruleName: string;
  threshold: string | number;
  evaluatedValue: string | number;
  passed: boolean;
  message: string;
}

export interface PolicyCheckResult {
  policyApproved: boolean;
  requiresMerchantApproval: boolean;
  violations: string[];
  ruleEvaluations: PolicyEvaluation[];
}

export interface DecisionTraceEntry {
  id: string;
  timestamp: string;
  phase:
    | 'REVENUE_EVENT_RECEIVED'
    | 'ANALYZING_PAYMENT_SIGNALS'
    | 'DIAGNOSING_REVENUE_RISK'
    | 'EVALUATING_RECOVERY_OPTIONS'
    | 'SELECTING_RECOVERY_STRATEGY'
    | 'CHECKING_MERCHANT_POLICY'
    | 'EXECUTING_RECOVERY'
    | 'VERIFYING_OUTCOME';
  title: string;
  detail: string;
  status: 'info' | 'success' | 'warning' | 'error' | 'pending';
  metadata?: Record<string, unknown>;
}

export interface RevenueProblemInput {
  customer: string;
  amount: number;
  currency?: string;
  problemType: string;
  failureReason: string;
  previousAttempts: number;
  previousSuccessfulPayments: number;
  timeSinceIssue: string;
  additionalContext?: string;
}

export interface RecoveryExecutionResult {
  executionId: string;
  action: RecoveryAction;
  provider: string;
  status: 'DISPATCHED' | 'FAILED' | 'COMPLETED';
  referenceId: string;
  paymentLink?: string;
  summary: string;
  executedAt: string;
}

export interface RecoveryCase {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: RevenueProblemInput;
  currentState: CaseState;
  diagnosis?: string;
  riskLevel?: RiskLevel;
  signals?: PaymentSignal[];
  candidateActions?: CandidateAction[];
  recommendedAction?: RecoveryAction;
  confidence?: number;
  expectedRecoveryProbability?: number;
  expectedRecoveryAmount?: number;
  reasoning?: string;
  rejectedAlternatives?: RejectedAlternative[];
  policyResult?: PolicyCheckResult;
  executionResult?: RecoveryExecutionResult;
  outcome?: 'SUCCESS' | 'FAILED' | 'PENDING';
  actualRecoveredAmount: number;
  decisionTrace: DecisionTraceEntry[];
  isDemoCase?: boolean;
}

export interface PerformanceMetrics {
  totalRevenueAtRisk: number;
  totalExpectedRecovery: number;
  totalActuallyRecovered: number;
  recoveryRate: number;
  casesInvestigated: number;
  actionsExecuted: number;
  actionsBlockedByPolicy: number;
}
