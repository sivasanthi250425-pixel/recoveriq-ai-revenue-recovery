# RecoverIQ — Autonomous AI Revenue Recovery Agent

RecoverIQ is an AI-powered revenue recovery agent that helps merchants recover revenue from failed, abandoned, and overdue payments.

## What It Does

RecoverIQ:

1. Receives a revenue-at-risk event
2. Analyzes payment and customer signals using AI
3. Diagnoses the revenue risk
4. Evaluates multiple recovery strategies
5. Selects the best recovery action
6. Applies deterministic merchant safety policies
7. Executes approved recovery actions
8. Verifies the payment outcome
9. Counts revenue only after verified successful payment
10. Maintains an auditable decision trace

## Key Innovation

RecoverIQ separates **AI decision-making from financial control**.

The AI recommends the best recovery strategy, while a deterministic policy engine controls whether that action can actually be executed.

This prevents the AI from having unrestricted authority over financial actions.

## Safety Controls

- Maximum automatic recovery amount: ₹10,000
- Minimum AI confidence threshold: 75%
- Maximum automatic payment retries: 2
- Customer outreach frequency limit
- Merchant approval for high-value recovery actions

## Example

### ₹7,500 Failed Payment

AI analyzes the customer and payment history and recommends:

**CREATE RECOVERY PAYMENT LINK**

The policy engine approves the action, the recovery action is executed, and after successful payment verification:

**Actually Recovered: ₹7,500**

### ₹15,000 Failed Payment

The AI can recommend a recovery strategy, but the deterministic policy engine blocks automatic execution because:

**₹15,000 > ₹10,000 automatic recovery limit**

The case becomes:

**MERCHANT APPROVAL REQUIRED**

## Architecture

Revenue Event  
↓  
AI Recovery Decision Engine  
↓  
Recovery Strategy  
↓  
Deterministic Policy Engine  
↓  
Approved / Blocked / Merchant Approval  
↓  
PaymentProvider  
↓  
Payment Verification  
↓  
Actual Revenue Recovered  
↓  
Audit Trace

## Technology

- React
- TypeScript
- Gemini AI
- Node.js
- PaymentProvider abstraction
- MockPaymentProvider for safe testing

## Important Design Principle

**Expected recovery is not actual revenue.**

RecoverIQ only counts money as recovered after successful payment settlement verification.

## Demo

The application demonstrates both:

- Autonomous recovery within merchant-defined limits
- Automatic blocking and merchant approval for high-value recovery

Built for the Razorpay AI Buildathon 2026.
