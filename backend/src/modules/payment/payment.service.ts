import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PaymentStatus, RegistrationStatus } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

/**
 * Payment Service
 *
 * MIGRATION STATUS: Moyasar removed (D-I01), HyperPay implementation pending.
 * Card payments are temporarily disabled until HyperPay is implemented.
 * BNPL (Tabby/Tamara) remains functional via BnplService.
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create a payment intent for a registration
   * TODO: Implement with HyperPay (see prds/payments.md)
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

    // TODO: HyperPay integration pending
    // For now, card payments are disabled - use BNPL (Tabby/Tamara) instead
    throw new NotImplementedException(
      'Card payments temporarily unavailable. Please use Tabby or Tamara for payment.',
    );
  }

  /**
   * Confirm payment after successful transaction
   * TODO: Implement with HyperPay
   */
  async confirmPayment(providerPaymentId: string) {
    throw new NotImplementedException(
      'HyperPay integration pending - card payment confirmation not available',
    );
  }

  /**
   * Handle payment webhook
   * TODO: Implement with HyperPay
   */
  async handleWebhook(payload: any) {
    this.logger.warn('HyperPay webhook handler not implemented');
    return { received: true, processed: false, reason: 'not_implemented' };
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
   * Initiate refund
   * TODO: Implement with HyperPay
   */
  async refundPayment(
    userId: string,
    paymentId: string,
    amount?: number,
    reason?: string,
  ) {
    throw new NotImplementedException(
      'HyperPay integration pending - refunds not available',
    );
  }

  /**
   * Complete a payment (used by BNPL services after successful payment)
   * This is called internally when Tabby/Tamara confirms payment
   */
  async completePaymentFromBnpl(
    paymentId: string,
    providerTransactionId: string,
    metadata: any,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
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
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        providerTransactionId,
        metadata: {
          ...((payment.metadata as any) || {}),
          ...metadata,
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
    }

    return payment;
  }
}
