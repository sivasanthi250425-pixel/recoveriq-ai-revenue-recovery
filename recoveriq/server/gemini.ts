import { GoogleGenAI } from "@google/genai";
import {
  AiAnalysisResult,
  CandidateAction,
  PaymentSignal,
  RecoveryAction,
  RejectedAlternative,
  RevenueProblemInput,
  RiskLevel,
} from "../src/types";

export async function analyzeRevenueLossWithGemini(
  input: RevenueProblemInput
): Promise<AiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI service is temporarily unavailable. No autonomous recovery decision was made."
    );
  }

  const authoritativeAmount = Number(input.amount) || 0;
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are the Autonomous Decision Core of "RecoverIQ", an enterprise-grade AI Revenue Recovery Agent for digital merchants.
Your role is to deeply analyze revenue-loss events, identify subtle payment degradation signals, evaluate candidate recovery strategies, and recommend the optimal, highest-expected-value recovery action while protecting merchant reputation and customer goodwill.

CRITICAL FINANCIAL INTEGRITY & TRUTHFULNESS DIRECTIVES:
1. The base transaction amount is strictly ₹${authoritativeAmount} (INR). You MUST NOT alter, recalculate, or invent any different base transaction amount.
2. DO NOT make unsupported claims about having direct access to internal bank rails, secondary card networks, or backup acquiring routes.
3. Use truthful, technically defensible language:
   - "Retry payment through the configured payment provider"
   - "Create a recovery payment link"
   - "Offer an alternative payment method"
   - "Send payment reminder across communication channels"
   - "Escalate case to merchant operations"
4. Do NOT invent customer communication touches unless explicitly stated in the input.

Available Recovery Actions:
- RETRY_PAYMENT: For transient banking downtime, processing network blips, or soft card decline where previous payment history is solid and customer didn't intentionally cancel.
- CREATE_RECOVERY_PAYMENT_LINK: For abandoned carts, checkout drops, expired card sessions, or when sending an alternative link (e.g. UPI/Card/Netbanking) maximizes recovery without re-entering the checkout funnel.
- SEND_REMINDER: For unpaid invoices or abandoned payments where customer high-intent is present, but needs a notification across channels.
- OFFER_ALTERNATIVE_RECOVERY_PATH: For recurring or card failure where switching payment methods (e.g. from credit card to instant UPI or bank transfer) prevents hard churn.
- ESCALATE_TO_MERCHANT: When transaction amount is high risk, unusual fraud signals are detected, or repeated failure exceeds safe bounds.
- STOP_RECOVERY: For clear fraud, confirmed stolen card, abusive behavior, or customer explicit cancellation.
- NO_ACTION: When recovery costs exceed transaction value or customer has already settled.

Return ONLY valid JSON matching this exact structure:
{
  "diagnosis": "string",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "signals": [
    {
      "name": "string",
      "value": "string",
      "impact": "positive" | "negative" | "neutral"
    }
  ],
  "candidateActions": [
    {
      "action": "RETRY_PAYMENT" | "CREATE_RECOVERY_PAYMENT_LINK" | "SEND_REMINDER" | "OFFER_ALTERNATIVE_RECOVERY_PATH" | "ESCALATE_TO_MERCHANT" | "STOP_RECOVERY" | "NO_ACTION",
      "reason": "string",
      "estimatedRecoveryProbability": number (0.0 to 1.0),
      "estimatedRecoveryAmount": number
    }
  ],
  "recommendedAction": "RETRY_PAYMENT" | "CREATE_RECOVERY_PAYMENT_LINK" | "SEND_REMINDER" | "OFFER_ALTERNATIVE_RECOVERY_PATH" | "ESCALATE_TO_MERCHANT" | "STOP_RECOVERY" | "NO_ACTION",
  "confidence": number (0.0 to 1.0),
  "expectedRecoveryProbability": number (0.0 to 1.0),
  "expectedRecoveryAmount": number,
  "reasoning": "string",
  "rejectedAlternatives": [
    {
      "action": "string",
      "reason": "string"
    }
  ],
  "requiresMerchantApproval": boolean
}
`;

  const prompt = `
AUTHORITATIVE FINANCIAL EVENT DATA:
- Customer: ${input.customer}
- Authoritative Amount At Risk: ₹${authoritativeAmount.toLocaleString("en-IN")} (${input.currency || "INR"})
- Problem Type: ${input.problemType}
- Failure Reason: ${input.failureReason}
- Previous Retry Attempts: ${input.previousAttempts}
- Prior Successful Payments: ${input.previousSuccessfulPayments}
- Time Since Issue: ${input.timeSinceIssue}
- Additional Context: ${input.additionalContext || "None provided"}

Provide the comprehensive diagnosis, behavioral signal extraction, candidate strategy ranking, and recommended action.
`;

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-flash-lite"];
  let responseText: string | null | undefined = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }

        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.15,
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(
          `[RecoverIQ] Model ${model} attempt ${attempt + 1} failed:`,
          err.message || err
        );
      }
    }
    if (responseText) break;
  }

  // If Gemini remote calls fail, STOP automated recovery and never fabricate fake AI decisions
  if (!responseText) {
    throw new Error(
      "AI service is temporarily unavailable. No autonomous recovery decision was made."
    );
  }

  try {
    let parsed: AiAnalysisResult;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    if (!parsed.diagnosis || !parsed.recommendedAction) {
      throw new Error(
        "AI service returned incomplete analysis. Automated recovery stopped."
      );
    }

    // Normalize confidence and probability to valid numeric ranges (0 to 1)
    if (parsed.confidence > 1 && parsed.confidence <= 100) {
      parsed.confidence = parsed.confidence / 100;
    }
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence || 0.8));

    if (
      parsed.expectedRecoveryProbability > 1 &&
      parsed.expectedRecoveryProbability <= 100
    ) {
      parsed.expectedRecoveryProbability =
        parsed.expectedRecoveryProbability / 100;
    }
    parsed.expectedRecoveryProbability = Math.max(
      0,
      Math.min(1, parsed.expectedRecoveryProbability || 0.75)
    );

    // Enforce strictly derived mathematical accounting from user input amount
    parsed.expectedRecoveryAmount = Math.round(
      authoritativeAmount * parsed.expectedRecoveryProbability
    );

    if (Array.isArray(parsed.candidateActions)) {
      parsed.candidateActions.forEach((c) => {
        if (
          c.estimatedRecoveryProbability > 1 &&
          c.estimatedRecoveryProbability <= 100
        ) {
          c.estimatedRecoveryProbability =
            c.estimatedRecoveryProbability / 100;
        }
        c.estimatedRecoveryProbability = Math.max(
          0,
          Math.min(1, c.estimatedRecoveryProbability || 0.5)
        );
        c.estimatedRecoveryAmount = Math.round(
          authoritativeAmount * c.estimatedRecoveryProbability
        );
      });
    }

    return parsed;
  } catch (parseErr: any) {
    console.warn(
      "[RecoverIQ] Failed to parse Gemini response JSON:",
      parseErr
    );
    throw new Error(
      "AI service returned invalid analysis format. Automated recovery stopped."
    );
  }
}

