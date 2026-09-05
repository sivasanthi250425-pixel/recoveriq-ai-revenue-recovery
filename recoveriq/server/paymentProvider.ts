import { RecoveryAction, RecoveryCase, RecoveryExecutionResult } from "../src/types";

export interface PaymentProvider {
  name: string;
  executeAction(
    action: RecoveryAction,
    caseData: RecoveryCase
  ): Promise<RecoveryExecutionResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  public name = "MockPaymentProvider (Razorpay Test Ready)";

  async executeAction(
    action: RecoveryAction,
    caseData: RecoveryCase
  ): Promise<RecoveryExecutionResult> {
    const timestamp = new Date().toISOString();
    const shortCaseId = caseData.id.slice(-6);

    switch (action) {
      case "RETRY_PAYMENT": {
        return {
          executionId: `exec_retry_${Date.now()}_${shortCaseId}`,
          action,
          provider: this.name,
          status: "DISPATCHED",
          referenceId: `txn_retry_auto_${Math.floor(100000 + Math.random() * 900000)}`,
          summary: `Automatic payment retry triggered through the configured payment provider.`,
          executedAt: timestamp,
        };
      }

      case "CREATE_RECOVERY_PAYMENT_LINK": {
        const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        return {
          executionId: `exec_link_${Date.now()}_${shortCaseId}`,
          action,
          provider: this.name,
          status: "DISPATCHED",
          referenceId: `plink_${linkCode}`,
          paymentLink: `https://pay.recoveriq.internal/inv_${shortCaseId}?token=${linkCode}`,
          summary: `Recovery payment link generated for customer.`,
          executedAt: timestamp,
        };
      }

      case "SEND_REMINDER": {
        return {
          executionId: `exec_remind_${Date.now()}_${shortCaseId}`,
          action,
          provider: this.name,
          status: "DISPATCHED",
          referenceId: `msg_notif_${Math.floor(10000 + Math.random() * 90000)}`,
          summary: `Payment reminder dispatched across customer communication channels.`,
          executedAt: timestamp,
        };
      }

      case "OFFER_ALTERNATIVE_RECOVERY_PATH": {
        return {
          executionId: `exec_alt_${Date.now()}_${shortCaseId}`,
          action,
          provider: this.name,
          status: "DISPATCHED",
          referenceId: `alt_rail_${Math.floor(10000 + Math.random() * 90000)}`,
          summary: `Customer offered alternative payment method to complete transaction.`,
          executedAt: timestamp,
        };
      }

      case "ESCALATE_TO_MERCHANT": {
        return {
          executionId: `exec_esc_${Date.now()}_${shortCaseId}`,
          action,
          provider: this.name,
          status: "COMPLETED",
          referenceId: `esc_ticket_${shortCaseId}`,
          summary: `Case escalated to merchant operations with investigation summary.`,
          executedAt: timestamp,
        };
      }

      case "STOP_RECOVERY": {
        return {
          executionId: `exec_stop_${Date.now()}_${shortCaseId}`,
          action,
          provider: this.name,
          status: "COMPLETED",
          referenceId: `halt_${shortCaseId}`,
          summary: `Recovery halted according to safety policy.`,
          executedAt: timestamp,
        };
      }

      case "NO_ACTION":
      default: {
        return {
          executionId: `exec_noop_${Date.now()}_${shortCaseId}`,
          action: "NO_ACTION",
          provider: this.name,
          status: "COMPLETED",
          referenceId: `noop_${shortCaseId}`,
          summary: `No autonomous action executed per policy thresholds.`,
          executedAt: timestamp,
        };
      }
    }
  }
}

export const defaultPaymentProvider = new MockPaymentProvider();
