import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PaymentStatus, RegistrationStatus } from '@prisma/client';
import axios from 'axios';
import { NotificationService } from '../notification/notification.service';

/**
 * Payment Service
 *
 * Handles payment processing via Moyasar gateway
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly moyasarApiUrl = 'https://api.moyasar.com/v1';
  private readonly moyasarSecretKey: string;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {
    this.moyasarSecretKey = process.env.MOYASAR_SECRET_KEY || '';
  }

  private getMoyasarHeaders() {
    return {
      Authorization: `Basic ${Buffer.from(this.moyasarSecretKey + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a payment intent for a registration
   */
  async createPayment(
    userId: string,
    registrationId: string,
    amount: number,
    currency: string = 'SAR',
  ) {
    // Get registration details
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        cohort: {
          include: {
            program: true,
          },
        },
        user: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('التسجيل غير موجود');
    }

    console.log('Payment authorization check:', {
      registrationUserId: registration.userId,
      requestUserId: userId,
      match: registration.userId === userId,
    });

    if (registration.userId !== userId) {
      throw new BadRequestException('غير مصرح لك بهذا الإجراء');
    }

    if (registration.status !== RegistrationStatus.PENDING_PAYMENT) {
      throw new BadRequestException('هذا التسجيل لا يحتاج إلى دفع');
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { registrationId },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('تم الدفع بالفعل');
    }

    // Create or update payment record
    const payment = await this.prisma.payment.upsert({
      where: { registrationId },
      create: {
        registrationId,
        userId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        method: 'CARD',
      },
      update: {
        amount,
        status: PaymentStatus.PENDING,
      },
    });

    // Create Moyasar payment
    try {
      const response = await axios.post(
        `${this.moyasarApiUrl}/payments`,
        {
          amount: Math.round(amount * 100), // Convert to halalas
          currency,
          description: `${registration.cohort.program.titleAr} - ${registration.cohort.nameAr}`,
          callback_url: `${process.env.FRONTEND_URL}/payment/success?id=${payment.id}`,
          source: {
            type: 'creditcard',
          },
          metadata: {
            registrationId,
            paymentId: payment.id,
            userId,
            programId: registration.cohort.programId,
            cohortId: registration.cohortId,
          },
        },
        { headers: this.getMoyasarHeaders() },
      );

      const moyasarPayment = response.data;

      // Update payment with Moyasar ID
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: moyasarPayment.id,
          metadata: {
            moyasarPayment: moyasarPayment,
          },
        },
      });

      return {
        paymentId: payment.id,
        moyasarPaymentId: moyasarPayment.id,
        amount: payment.amount,
        currency: payment.currency,
        publishableKey: process.env.MOYASAR_PUBLISHABLE_KEY,
      };
    } catch (error) {
      console.error('Moyasar payment creation failed:', error);
      throw new BadRequestException('فشل إنشاء عملية الدفع');
    }
  }

  /**
   * Confirm payment after successful Moyasar transaction
   * PRODUCTION-READY: Verifies amount, currency, and status
   */
  async confirmPayment(moyasarPaymentId: string) {
    // Fetch payment from Moyasar
    let moyasarPayment;
    try {
      const response = await axios.get(
        `${this.moyasarApiUrl}/payments/${moyasarPaymentId}`,
        { headers: this.getMoyasarHeaders() },
      );
      moyasarPayment = response.data;
      this.logger.log(
        `Fetched Moyasar payment: ${moyasarPaymentId}, status: ${moyasarPayment.status}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch Moyasar payment ${moyasarPaymentId}:`,
        error,
      );
      throw new NotFoundException('عملية الدفع غير موجودة');
    }

    // Find our payment record
    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: moyasarPaymentId },
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
      this.logger.error(
        `Payment record not found for Moyasar payment: ${moyasarPaymentId}`,
      );
      throw new NotFoundException('سجل الدفع غير موجود');
    }

    // CRITICAL: Verify amount and currency match
    const expectedAmountInHalalas = Math.round(Number(payment.amount) * 100);
    if (moyasarPayment.amount !== expectedAmountInHalalas) {
      this.logger.error(
        `Amount mismatch: expected ${expectedAmountInHalalas}, got ${moyasarPayment.amount}`,
      );
      throw new BadRequestException('مبلغ الدفع غير صحيح');
    }

    if (moyasarPayment.currency !== payment.currency) {
      this.logger.error(
        `Currency mismatch: expected ${payment.currency}, got ${moyasarPayment.currency}`,
      );
      throw new BadRequestException('عملة الدفع غير صحيحة');
    }

    // Check Moyasar payment status
    if (moyasarPayment.status === 'paid') {
      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          providerTransactionId: moyasarPayment.source?.transaction_id,
          metadata: {
            ...((payment.metadata as any) || {}),
            moyasarResponse: moyasarPayment,
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
      } catch (error) {
        this.logger.warn('Failed to send payment receipt email:', error);
        // Don't fail the payment if email fails
      }

      return {
        success: true,
        message: 'تم الدفع بنجاح',
        payment,
      };
    } else if (moyasarPayment.status === 'failed') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          metadata: {
            ...((payment.metadata as any) || {}),
            moyasarResponse: moyasarPayment,
          },
        },
      });

      throw new BadRequestException('فشلت عملية الدفع');
    }

    return {
      success: false,
      message: 'عملية الدفع قيد المعالجة',
      status: moyasarPayment.status,
    };
  }

  /**
   * Handle Moyasar webhook
   * PRODUCTION-READY: Async processing, idempotency, error handling
   */
  async handleWebhook(payload: any) {
    const { type, data } = payload;
    const webhookId = `${type}_${data.id}_${Date.now()}`;

    this.logger.log(`Received webhook: ${type} for payment ${data.id}`);

    try {
      // Check idempotency - prevent duplicate processing
      const existingPayment = await this.prisma.payment.findFirst({
        where: { providerPaymentId: data.id },
      });

      if (!existingPayment) {
        this.logger.warn(`Webhook received for unknown payment: ${data.id}`);
        return {
          received: true,
          processed: false,
          reason: 'payment_not_found',
        };
      }

      // Idempotency check: if already processed, return success
      if (
        type === 'payment_paid' &&
        existingPayment.status === PaymentStatus.COMPLETED
      ) {
        this.logger.log(`Payment ${data.id} already processed, skipping`);
        return {
          received: true,
          processed: false,
          reason: 'already_processed',
        };
      }

      if (
        type === 'payment_failed' &&
        existingPayment.status === PaymentStatus.FAILED
      ) {
        this.logger.log(
          `Payment ${data.id} already marked as failed, skipping`,
        );
        return {
          received: true,
          processed: false,
          reason: 'already_processed',
        };
      }

      // Process webhook asynchronously
      if (type === 'payment_paid') {
        // Process in background to return 200 quickly
        setImmediate(async () => {
          try {
            await this.confirmPayment(data.id);
            this.logger.log(
              `Successfully processed payment_paid webhook for ${data.id}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process payment_paid webhook for ${data.id}:`,
              error,
            );
          }
        });
      } else if (type === 'payment_failed') {
        setImmediate(async () => {
          try {
            await this.prisma.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: PaymentStatus.FAILED,
                metadata: {
                  ...((existingPayment.metadata as any) || {}),
                  moyasarResponse: data,
                  webhookProcessedAt: new Date().toISOString(),
                },
              },
            });
            this.logger.log(
              `Successfully processed payment_failed webhook for ${data.id}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process payment_failed webhook for ${data.id}:`,
              error,
            );
          }
        });
      } else if (type === 'payment_refunded') {
        setImmediate(async () => {
          try {
            await this.prisma.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: PaymentStatus.REFUNDED,
                refundedAt: new Date(),
                metadata: {
                  ...((existingPayment.metadata as any) || {}),
                  moyasarResponse: data,
                  webhookProcessedAt: new Date().toISOString(),
                },
              },
            });
            this.logger.log(
              `Successfully processed payment_refunded webhook for ${data.id}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process payment_refunded webhook for ${data.id}:`,
              error,
            );
          }
        });
      }

      return { received: true, processed: true };
    } catch (error) {
      this.logger.error(`Webhook processing error for ${type}:`, error);
      // Still return 200 to prevent retries for unrecoverable errors
      return { received: true, processed: false, error: 'processing_error' };
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: {
          include: {
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
      throw new NotFoundException('عملية الدفع غير موجودة');
    }

    if (payment.registration.userId !== userId) {
      throw new BadRequestException('غير مصرح لك بعرض هذه العملية');
    }

    return payment;
  }

  /**
   * Initiate refund (full or partial)
   * PRODUCTION-READY: Supports partial refunds, validation, and proper error handling
   */
  async refundPayment(
    userId: string,
    paymentId: string,
    amount?: number,
    reason?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('عملية الدفع غير موجودة');
    }

    if (payment.registration.userId !== userId) {
      throw new BadRequestException('غير مصرح لك بهذا الإجراء');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('لا يمكن استرداد هذه العملية');
    }

    // Determine refund amount (full or partial)
    const refundAmount = amount || Number(payment.amount);
    const currentRefunded = Number(payment.refundAmount || 0);
    const totalPaid = Number(payment.amount);

    // Validate refund amount
    if (refundAmount <= 0) {
      throw new BadRequestException('مبلغ الاسترداد يجب أن يكون أكبر من صفر');
    }

    if (currentRefunded + refundAmount > totalPaid) {
      throw new BadRequestException('مبلغ الاسترداد يتجاوز المبلغ المدفوع');
    }

    try {
      // Create refund via Moyasar - CORRECT ENDPOINT
      const refundAmountInHalalas = Math.round(refundAmount * 100);
      const response = await axios.post(
        `${this.moyasarApiUrl}/payments/${payment.providerPaymentId}/refund`,
        {
          amount: refundAmountInHalalas,
        },
        { headers: this.getMoyasarHeaders() },
      );
      const refund = response.data;
      this.logger.log(
        `Refund created for payment ${paymentId}: ${refund.id}, amount: ${refundAmount} SAR`,
      );

      // Update payment status
      const newRefundedAmount = currentRefunded + refundAmount;
      const isFullyRefunded = newRefundedAmount >= totalPaid;

      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: isFullyRefunded
            ? PaymentStatus.REFUNDED
            : PaymentStatus.COMPLETED,
          refundedAt: isFullyRefunded ? new Date() : payment.refundedAt,
          refundAmount: newRefundedAmount,
          metadata: {
            ...((payment.metadata as any) || {}),
            refunds: [
              ...((payment.metadata as any)?.refunds || []),
              {
                id: refund.id,
                amount: refundAmount,
                reason,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        },
      });

      return {
        success: true,
        message: isFullyRefunded
          ? 'تم استرداد المبلغ بالكامل'
          : 'تم استرداد جزء من المبلغ',
        refund: {
          id: refund.id,
          amount: refundAmount,
          totalRefunded: newRefundedAmount,
          remainingAmount: totalPaid - newRefundedAmount,
          isFullyRefunded,
        },
      };
    } catch (error) {
      this.logger.error(
        `Refund failed for payment ${paymentId}:`,
        error.response?.data || error.message,
      );

      // Provide specific error messages
      if (error.response?.status === 404) {
        throw new NotFoundException('عملية الدفع غير موجودة في Moyasar');
      } else if (error.response?.status === 400) {
        throw new BadRequestException(
          error.response.data?.message || 'لا يمكن استرداد هذه العملية',
        );
      }

      throw new BadRequestException('فشلت عملية الاسترداد');
    }
  }
}
