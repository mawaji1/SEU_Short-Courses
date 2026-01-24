import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { PaymentStatus, RegistrationStatus } from '@prisma/client';
import { TabbyService } from '../providers/tabby/tabby.service';
import { NotificationService } from '../../notification/notification.service';

/**
 * Tabby Webhook Service
 * Processes Tabby webhook events
 *
 * PRODUCTION-READY:
 * - Idempotency handling
 * - Payment verification via API
 * - Automatic capture after authorization
 * - Comprehensive error handling
 */
@Injectable()
export class TabbyWebhookService {
  private readonly logger = new Logger(TabbyWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tabbyService: TabbyService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Process Tabby webhook
   * Handles: authorized, closed, expired, rejected
   */
  async processWebhook(payload: any, authHeader?: string): Promise<void> {
    const { id: paymentId, status, order } = payload;

    this.logger.log(
      `Processing Tabby webhook: ${paymentId}, status: ${status}`,
    );

    // Verify webhook authenticity (optional but recommended)
    // if (authHeader) {
    //     const isValid = this.tabbyService.verifyWebhookSignature(payload, authHeader);
    //     if (!isValid) {
    //         this.logger.warn(`Invalid webhook signature for payment ${paymentId}`);
    //         return;
    //     }
    // }

    // Find payment record by provider payment ID or reference ID
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { providerPaymentId: paymentId },
          { registrationId: order?.reference_id },
        ],
      },
      include: {
        registration: {
          include: {
            user: true,
            cohort: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for Tabby webhook: ${paymentId}`);
      return;
    }

    // Handle different webhook statuses
    switch (status.toLowerCase()) {
      case 'authorized':
        await this.handleAuthorized(payment, payload);
        break;
      case 'closed':
        await this.handleClosed(payment, payload);
        break;
      case 'expired':
        await this.handleExpired(payment, payload);
        break;
      case 'rejected':
        await this.handleRejected(payment, payload);
        break;
      default:
        this.logger.warn(`Unknown Tabby webhook status: ${status}`);
    }
  }

  /**
   * Handle "authorized" webhook
   * Payment authorized by customer - needs capture
   */
  private async handleAuthorized(payment: any, payload: any): Promise<void> {
    const paymentId = payment.id;
    const tabbyPaymentId = payload.id;

    // Idempotency check
    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.log(`Payment ${paymentId} already completed, skipping`);
      return;
    }

    try {
      // CRITICAL: Verify payment via API (don't trust webhook alone)
      const verifiedPayment =
        await this.tabbyService.getPaymentStatus(tabbyPaymentId);

      if (verifiedPayment.status !== 'AUTHORIZED') {
        this.logger.error(
          `Payment status mismatch: expected AUTHORIZED, got ${verifiedPayment.status}`,
        );
        return;
      }

      // Verify amount matches
      const expectedAmount = Number(payment.amount);
      const actualAmount = parseFloat(verifiedPayment.amount);

      if (Math.abs(expectedAmount - actualAmount) > 0.01) {
        this.logger.error(
          `Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`,
        );
        return;
      }

      // Update payment status to authorized
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.COMPLETED, // Mark as completed after authorization
          paidAt: new Date(),
          providerPaymentId: tabbyPaymentId,
          providerTransactionId: verifiedPayment.id,
          metadata: {
            ...(payment.metadata || {}),
            tabbyPayment: verifiedPayment,
            webhookProcessedAt: new Date().toISOString(),
          },
        },
      });

      // Confirm registration
      await this.prisma.registration.update({
        where: { id: payment.registrationId },
        data: {
          status: RegistrationStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      // Increment enrolled count
      await this.prisma.cohort.update({
        where: { id: payment.registration.cohortId },
        data: {
          enrolledCount: { increment: 1 },
        },
      });

      this.logger.log(`Payment ${paymentId} authorized and confirmed`);

      // IMPORTANT: Capture payment automatically
      // Tabby requires capture within 30 days
      try {
        await this.tabbyService.capturePayment(tabbyPaymentId, expectedAmount);
        this.logger.log(`Payment ${paymentId} captured successfully`);

        // Update metadata with capture info
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            metadata: {
              ...(payment.metadata || {}),
              captured: true,
              capturedAt: new Date().toISOString(),
            },
          },
        });
      } catch (captureError) {
        this.logger.error(
          `Failed to capture payment ${paymentId}:`,
          captureError,
        );
        // Don't fail the whole process - capture can be retried manually
      }

      // Send payment receipt email
      try {
        await this.notificationService.sendPaymentReceipt(
          payment.registration.userId,
          payment.registration.user.email,
          {
            userName: `${payment.registration.user.firstName} ${payment.registration.user.lastName}`,
            programName: payment.registration.cohort.program.titleAr,
            cohortName: payment.registration.cohort.nameAr,
            amount: payment.amount.toString(),
            paymentId: payment.id,
            registrationId: payment.registration.id,
          },
          'ar',
        );
      } catch (emailError) {
        this.logger.warn('Failed to send payment receipt email:', emailError);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process authorized webhook for ${paymentId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle "closed" webhook
   * Payment captured and completed
   */
  private async handleClosed(payment: any, payload: any): Promise<void> {
    this.logger.log(`Payment ${payment.id} closed (captured)`);

    // Update metadata to reflect closure
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          ...(payment.metadata || {}),
          closed: true,
          closedAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Handle "expired" webhook
   * Payment session expired without completion
   */
  private async handleExpired(payment: any, payload: any): Promise<void> {
    this.logger.log(`Payment ${payment.id} expired`);

    // Only update if not already completed
    if (payment.status !== PaymentStatus.COMPLETED) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          metadata: {
            ...(payment.metadata || {}),
            expired: true,
            expiredAt: new Date().toISOString(),
          },
        },
      });
    }
  }

  /**
   * Handle "rejected" webhook
   * Payment rejected by Tabby
   */
  private async handleRejected(payment: any, payload: any): Promise<void> {
    this.logger.log(`Payment ${payment.id} rejected`);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        metadata: {
          ...(payment.metadata || {}),
          rejected: true,
          rejectedAt: new Date().toISOString(),
          rejectionReason: payload.rejection_reason,
        },
      },
    });
  }
}
