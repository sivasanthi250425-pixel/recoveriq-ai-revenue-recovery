import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { analyzeRevenueLossWithGemini } from "./server/gemini";
import { evaluateMerchantPolicy } from "./server/policyEngine";
import { defaultPaymentProvider } from "./server/paymentProvider";
import { caseStore } from "./server/store";
import { RecoveryCase, RevenueProblemInput } from "./src/types";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API Routes
  // ==========================================

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      name: "RecoverIQ API",
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Get all cases
  app.get("/api/cases", (_req, res) => {
    const cases = caseStore.getAllCases();
    res.json({ cases });
  });

  // Get single case
  app.get("/api/cases/:id", (req, res) => {
    const caseData = caseStore.getCase(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: "Recovery case not found" });
    }
    res.json({ case: caseData });
  });

  // Get live derived metrics
  app.get("/api/metrics", (_req, res) => {
    const metrics = caseStore.getMetrics();
    res.json({ metrics });
  });

  // Reset store to demo seeds
  app.post("/api/cases/reset-demo", (_req, res) => {
    caseStore.resetToSeeds();
    res.json({ success: true, metrics: caseStore.getMetrics() });
  });

  // Main Investigation Endpoint: FIND -> DIAGNOSE -> DECIDE -> SAFETY CHECK
  app.post("/api/recovery/analyze", async (req, res) => {
    const input: RevenueProblemInput = req.body;

    if (!input || !input.customer || !input.amount || !input.problemType) {
      return res.status(400).json({
        error: "Invalid input. Customer, amount, and problem type are required.",
      });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const caseId = `case_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Initial Case Record
    const newCase: RecoveryCase = {
      id: caseId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      input: {
        ...input,
        amount: Number(input.amount),
        previousAttempts: Number(input.previousAttempts) || 0,
        previousSuccessfulPayments: Number(input.previousSuccessfulPayments) || 0,
      },
      currentState: "REVENUE_AT_RISK",
      actualRecoveredAmount: 0,
      decisionTrace: [
        {
          id: `tr_${Date.now()}_init`,
          timestamp: timeStr,
          phase: "REVENUE_EVENT_RECEIVED",
          title: "Revenue event received",
          detail: `At-risk revenue event registered for ${input.customer}: ₹${Number(input.amount).toLocaleString("en-IN")} (${input.problemType} - ${input.failureReason}).`,
          status: "info",
        },
      ],
    };

    caseStore.saveCase(newCase);

    // Call Real Gemini API
    try {
      const aiAnalysis = await analyzeRevenueLossWithGemini(newCase.input);

      // Append Trace for Analysis
      const tAnalysis = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      newCase.diagnosis = aiAnalysis.diagnosis;
      newCase.riskLevel = aiAnalysis.riskLevel;
      newCase.signals = aiAnalysis.signals;
      newCase.candidateActions = aiAnalysis.candidateActions;
      newCase.recommendedAction = aiAnalysis.recommendedAction;
      newCase.confidence = aiAnalysis.confidence;
      newCase.expectedRecoveryProbability = aiAnalysis.expectedRecoveryProbability;
      newCase.expectedRecoveryAmount = aiAnalysis.expectedRecoveryAmount;
      newCase.reasoning = aiAnalysis.reasoning;
      newCase.rejectedAlternatives = aiAnalysis.rejectedAlternatives;

      newCase.decisionTrace.push({
        id: `tr_${Date.now()}_signals`,
        timestamp: tAnalysis,
        phase: "ANALYZING_PAYMENT_SIGNALS",
        title: "Payment signals analyzed",
        detail: `Extracted ${aiAnalysis.signals.length} dynamic signals (Payment reliability: ${newCase.input.previousSuccessfulPayments} historical clears, Failure code: ${newCase.input.failureReason}).`,
        status: "info",
      });

      newCase.decisionTrace.push({
        id: `tr_${Date.now()}_diag`,
        timestamp: tAnalysis,
        phase: "DIAGNOSING_REVENUE_RISK",
        title: "Revenue risk diagnosed",
        detail: `Diagnosis: ${aiAnalysis.diagnosis} [Risk: ${aiAnalysis.riskLevel}].`,
        status: "info",
      });

      newCase.decisionTrace.push({
        id: `tr_${Date.now()}_eval`,
        timestamp: tAnalysis,
        phase: "EVALUATING_RECOVERY_OPTIONS",
        title: "Recovery strategies evaluated",
        detail: `Evaluated ${aiAnalysis.candidateActions.length} recovery strategies against historical intent and loss minimization.`,
        status: "info",
      });

      newCase.decisionTrace.push({
        id: `tr_${Date.now()}_select`,
        timestamp: tAnalysis,
        phase: "SELECTING_RECOVERY_STRATEGY",
        title: `${aiAnalysis.recommendedAction.replace(/_/g, " ")} selected`,
        detail: `Selected ${aiAnalysis.recommendedAction} with ${Math.round(aiAnalysis.confidence * 100)}% confidence. Expected recovery: ₹${Math.round(aiAnalysis.expectedRecoveryAmount).toLocaleString("en-IN")} (${Math.round(aiAnalysis.expectedRecoveryProbability * 100)}% prob).`,
        status: "info",
      });

      // Deterministic Safety Policy Check
      const policyResult = evaluateMerchantPolicy(newCase.input, aiAnalysis);
      newCase.policyResult = policyResult;

      const tPolicy = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      if (policyResult.policyApproved) {
        newCase.currentState = "POLICY_APPROVED";
        newCase.decisionTrace.push({
          id: `tr_${Date.now()}_policy`,
          timestamp: tPolicy,
          phase: "CHECKING_MERCHANT_POLICY",
          title: "Merchant policy approved action",
          detail: `All safety constraints satisfied. Automated execution authorized.`,
          status: "success",
        });
      } else {
        newCase.currentState = "MERCHANT_APPROVAL_REQUIRED";
        newCase.decisionTrace.push({
          id: `tr_${Date.now()}_policy_blk`,
          timestamp: tPolicy,
          phase: "CHECKING_MERCHANT_POLICY",
          title: "Policy check — Merchant approval required",
          detail: `Blocked from automated execution: ${policyResult.violations.join("; ")}. Requires explicit merchant approval.`,
          status: "warning",
        });
      }

      caseStore.saveCase(newCase);
      return res.json({ case: newCase });
    } catch (err: any) {
      console.error("[RecoverIQ] AI Analysis Failure:", err);

      const tErr = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      newCase.currentState = "AI_ANALYSIS_UNAVAILABLE";
      newCase.decisionTrace.push({
        id: `tr_${Date.now()}_err`,
        timestamp: tErr,
        phase: "DIAGNOSING_REVENUE_RISK",
        title: "AI analysis unavailable",
        detail: "AI service is temporarily unavailable. No autonomous recovery decision was made. Automated recovery stopped.",
        status: "error",
      });

      caseStore.saveCase(newCase);

      return res.status(503).json({
        error:
          "AI service is temporarily unavailable. No autonomous recovery decision was made.",
        aiUnavailable: true,
        case: newCase,
      });
    }
  });

  // Merchant Approval Override
  app.post("/api/recovery/merchant-approve", (req, res) => {
    const { caseId, overrideReason } = req.body;
    const caseData = caseStore.getCase(caseId);

    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (caseData.currentState !== "MERCHANT_APPROVAL_REQUIRED") {
      return res.status(400).json({
        error: `Case is in state '${caseData.currentState}', not requiring merchant approval.`,
      });
    }

    const t = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    caseData.currentState = "POLICY_APPROVED";
    caseData.decisionTrace.push({
      id: `tr_${Date.now()}_appr`,
      timestamp: t,
      phase: "CHECKING_MERCHANT_POLICY",
      title: "Merchant Manual Approval Granted",
      detail: `Operator authorized execution: ${overrideReason || "Policy exception approved by merchant supervisor."}`,
      status: "success",
    });

    caseStore.saveCase(caseData);
    return res.json({ case: caseData });
  });

  // Switch or Select Alternative Recovery Strategy
  app.post("/api/recovery/select-strategy", (req, res) => {
    const { caseId, action } = req.body;
    const caseData = caseStore.getCase(caseId);

    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (
      caseData.currentState === "ACTION_EXECUTED" ||
      caseData.currentState === "ACTUALLY_RECOVERED" ||
      caseData.currentState === "PAYMENT_SUCCESSFUL"
    ) {
      return res.status(400).json({
        error: `Cannot switch strategy in state '${caseData.currentState}' after action has already been dispatched.`,
      });
    }

    const previousAction = caseData.recommendedAction || "UNKNOWN";
    caseData.recommendedAction = action;

    // Find candidate action metadata if available
    const candidate = caseData.candidateActions?.find((c) => c.action === action);
    if (candidate) {
      caseData.expectedRecoveryProbability = candidate.estimatedRecoveryProbability;
      caseData.expectedRecoveryAmount = candidate.estimatedRecoveryAmount;
    }

    // Re-evaluate merchant policy for the new strategy
    const dummyAiAnalysis = {
      diagnosis: caseData.diagnosis || "",
      riskLevel: caseData.riskLevel || "MEDIUM",
      signals: caseData.signals || [],
      candidateActions: caseData.candidateActions || [],
      recommendedAction: action,
      confidence: caseData.confidence || 0.85,
      expectedRecoveryProbability: caseData.expectedRecoveryProbability || 0.75,
      expectedRecoveryAmount: caseData.expectedRecoveryAmount || 0,
      reasoning: caseData.reasoning || "",
      rejectedAlternatives: caseData.rejectedAlternatives || [],
      requiresMerchantApproval: false,
    };

    const policyResult = evaluateMerchantPolicy(caseData.input, dummyAiAnalysis);
    caseData.policyResult = policyResult;

    const t = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (policyResult.policyApproved) {
      caseData.currentState = "POLICY_APPROVED";
      caseData.decisionTrace.push({
        id: `tr_${Date.now()}_alt_sel`,
        timestamp: t,
        phase: "SELECTING_RECOVERY_STRATEGY",
        title: `Strategy Switched to ${action.replace(/_/g, " ")}`,
        detail: `Evaluated alternative safe strategy (previous: ${previousAction}). Policy check PASSED: all guardrails satisfied. Automated execution authorized.`,
        status: "success",
      });
    } else {
      caseData.currentState = "MERCHANT_APPROVAL_REQUIRED";
      caseData.decisionTrace.push({
        id: `tr_${Date.now()}_alt_blk`,
        timestamp: t,
        phase: "CHECKING_MERCHANT_POLICY",
        title: `Strategy Switched to ${action.replace(/_/g, " ")} — Approval Required`,
        detail: `Evaluated alternative strategy (previous: ${previousAction}). Policy check flagged: ${policyResult.violations.join("; ")}.`,
        status: "warning",
      });
    }

    caseStore.saveCase(caseData);
    return res.json({ case: caseData });
  });

  // Execute Action via PaymentProvider
  app.post("/api/recovery/execute", async (req, res) => {
    const { caseId } = req.body;
    const caseData = caseStore.getCase(caseId);

    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (
      caseData.currentState === "ACTION_EXECUTED" ||
      caseData.currentState === "PAYMENT_PENDING" ||
      caseData.currentState === "PAYMENT_SUCCESSFUL" ||
      caseData.currentState === "ACTUALLY_RECOVERED"
    ) {
      return res.status(400).json({
        error: "Recovery action already executed for this event.",
      });
    }

    if (caseData.currentState !== "POLICY_APPROVED") {
      return res.status(400).json({
        error: `Cannot execute action in state '${caseData.currentState}'. Must be POLICY_APPROVED.`,
      });
    }

    const action = caseData.recommendedAction || "RETRY_PAYMENT";
    const executionResult = await defaultPaymentProvider.executeAction(action, caseData);

    const t = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    caseData.executionResult = executionResult;
    caseData.currentState = "PAYMENT_PENDING";

    caseData.decisionTrace.push({
      id: `tr_${Date.now()}_exec`,
      timestamp: t,
      phase: "EXECUTING_RECOVERY",
      title: "Recovery action executed",
      detail: `${executionResult.summary} (Ref: ${executionResult.referenceId}). Payment pending settlement.`,
      status: "info",
    });

    caseStore.saveCase(caseData);
    return res.json({ case: caseData });
  });

  // Simulate Outcome: Verified Successful Payment vs Failed Payment
  app.post("/api/recovery/simulate-outcome", (req, res) => {
    const { caseId, outcome } = req.body;
    const caseData = caseStore.getCase(caseId);

    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }

    const t = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (outcome === "SUCCESS") {
      caseData.outcome = "SUCCESS";
      caseData.currentState = "ACTUALLY_RECOVERED";
      caseData.actualRecoveredAmount = caseData.input.amount;

      caseData.decisionTrace.push({
        id: `tr_${Date.now()}_outcome_succ`,
        timestamp: t,
        phase: "VERIFYING_OUTCOME",
        title: "Payment successful — Actually Recovered",
        detail: `Payment settlement verified via gateway callback. ₹${caseData.input.amount.toLocaleString("en-IN")} marked as ACTUALLY RECOVERED into merchant ledger.`,
        status: "success",
      });
    } else {
      caseData.outcome = "FAILED";
      caseData.currentState = "PAYMENT_FAILED";
      caseData.actualRecoveredAmount = 0;

      caseData.decisionTrace.push({
        id: `tr_${Date.now()}_outcome_fail`,
        timestamp: t,
        phase: "VERIFYING_OUTCOME",
        title: "Payment verification failed",
        detail: `Recovery attempt could not be settled (Simulated issuer decline). Actual recovered revenue remains ₹0.`,
        status: "error",
      });
    }

    caseStore.saveCase(caseData);
    return res.json({ case: caseData, metrics: caseStore.getMetrics() });
  });

  // ==========================================
  // Vite Integration
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RecoverIQ Server listening on port ${PORT}`);
  });
}

startServer();
