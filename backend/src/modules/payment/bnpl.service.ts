import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TabbyService } from './providers/tabby/tabby.service';
import { TamaraService } from './providers/tamara/tamara.service';
import {
  BNPLProvider,
  BNPLEligibilityCheck,
  BNPLCheckoutRequest,
  BNPLCheckoutResponse,
  BNPLRefundRequest,
  BNPLRefundResponse,
} from './interfaces/bnpl.interface';
import { PaymentMethod } from '@prisma/client';

/**
 * BNPL Service - Orchestrates Tabby and Tamara integrations
 * Handles eligibility checks, checkout creation, and payment processing
 */
@Injectable()
export class BNPLService {
  private readonly logger = new Logger(BNPLService.name);

  constructor(
    private prisma: PrismaService,
    private tabbyService: TabbyService,
    private tamaraService: TamaraService,
  ) {}

  /**
   * Check BNPL eligibility for a registration
   * PRODUCTION-READY: Uses pre-scoring API for accurate eligibility
   */
  async checkEligibility(registrationId: string): Promise<BNPLEligibilityCheck[]> {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        cohort: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!registration) {
      throw new BadRequestException('التسجيل غير موجود');
    }

    const amount = Number(registration.cohort.program.price);
    const eligibility: BNPLEligibilityCheck[] = [];

    // Check Tabby eligibility via pre-scoring API
    const tabbyEligibility = await this.tabbyService.checkEligibility(amount, 'SAR');
    eligibility.push({
      eligible: tabbyEligibility.eligible,
      provider: BNPLProvider.TABBY,
      minAmount: parseFloat(process.env.TABBY_MIN_AMOUNT || '100'),
      maxAmount: parseFloat(process.env.TABBY_MAX_AMOUNT || '10000'),
      reason: tabbyEligibility.reason,
    });

    // Check Tamara eligibility
    if (this.tamaraService.isEligible(amount)) {
      eligibility.push({
        eligible: true,
        provider: BNPLProvider.TAMARA,
        minAmount: parseFloat(process.env.TAMARA_MIN_AMOUNT || '100'),
        maxAmount: parseFloat(process.env.TAMARA_MAX_AMOUNT || '10000'),
      });
    } else {
      eligibility.push({
        eligible: false,
        provider: BNPLProvider.TAMARA,
        reason: 'المبلغ خارج نطاق Tamara',
      });
    }

    return eligibility;
  }

  /**
   * Create BNPL checkout session
   */
  async createCheckout(
    registrationId: string,
    provider: BNPLProvider,
  ): Promise<BNPLCheckoutResponse> {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        cohort: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!registration) {
      throw new BadRequestException('التسجيل غير موجود');
    }

    const amount = Number(registration.cohort.program.price);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const request: BNPLCheckoutRequest = {
      provider,
      registrationId: registration.id,
      amount,
      currency: 'SAR',
      description: `${registration.cohort.program.titleAr} - ${registration.cohort.nameAr}`,
      customer: {
        email: registration.user.email,
        phone: registration.user.phone || '0500000000',
        firstName: registration.user.firstName,
        lastName: registration.user.lastName,
      },
      successUrl: `${frontendUrl}/payment/success?registration=${registrationId}`,
      cancelUrl: `${frontendUrl}/payment/cancel?registration=${registrationId}`,
      failureUrl: `${frontendUrl}/payment/failure?registration=${registrationId}`,
    };

    let response: BNPLCheckoutResponse;

    // Default to Arabic (can be enhanced later with user preference)
    const userLanguage = 'ar';

    // Route to appropriate provider
    if (provider === BNPLProvider.TABBY) {
      response = await this.tabbyService.createCheckout(request, userLanguage);
    } else if (provider === BNPLProvider.TAMARA) {
      response = await this.tamaraService.createCheckout(request);
    } else {
      throw new BadRequestException('مزود الدفع غير مدعوم');
    }

    if (!response.success) {
      this.logger.error(`BNPL checkout failed for ${provider}:`, response.error);
      throw new BadRequestException(response.error);
    }

    // Create payment record with proper payment ID
    await this.prisma.payment.create({
      data: {
        userId: registration.userId,
        registrationId: registration.id,
        amount: amount,
        currency: 'SAR',
        method: provider === BNPLProvider.TABBY ? PaymentMethod.TABBY : PaymentMethod.TAMARA,
        status: 'PENDING',
        providerPaymentId: response.paymentId || response.sessionId || '',
        metadata: {
          checkoutUrl: response.checkoutUrl,
          sessionId: response.sessionId,
          paymentId: response.paymentId,
          provider,
          language: userLanguage,
        },
      },
    });

    this.logger.log(`BNPL checkout created for ${provider}: ${response.sessionId}`);

    return response;
  }

  /**
   * Handle BNPL payment confirmation (called from webhook)
   */
  async confirmPayment(provider: BNPLProvider, sessionId: string): Promise<any> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        providerPaymentId: sessionId,
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
      throw new BadRequestException('الدفع غير موجود');
    }

    // Get payment status from provider
    let paymentStatus: any;
    if (provider === BNPLProvider.TABBY) {
      paymentStatus = await this.tabbyService.getPaymentStatus(sessionId);
    } else if (provider === BNPLProvider.TAMARA) {
      paymentStatus = await this.tamaraService.getOrderDetails(sessionId);
    }

    // Update payment status
    if (paymentStatus.status === 'approved' || paymentStatus.order_status === 'approved') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          metadata: {
            ...(payment.metadata as any),
            providerResponse: paymentStatus,
          },
        },
      });

      // Update registration status
      await this.prisma.registration.update({
        where: { id: payment.registrationId },
        data: {
          status: 'CONFIRMED',
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

      this.logger.log(`BNPL payment confirmed: ${sessionId}`);

      return {
        success: true,
        message: 'تم تأكيد الدفع بنجاح',
      };
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: {
            ...(payment.metadata as any),
            providerResponse: paymentStatus,
          },
        },
      });

      return {
        success: false,
        message: 'فشل الدفع',
      };
    }
  }

  /**
   * Refund BNPL payment
   */
  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<BNPLRefundResponse> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('الدفع غير موجود');
    }

    const refundAmount = amount || Number(payment.amount);
    const provider = payment.method === PaymentMethod.TABBY ? BNPLProvider.TABBY : BNPLProvider.TAMARA;

    if (!payment.providerPaymentId) {
      throw new BadRequestException('معرف الدفع غير موجود');
    }

    const request: BNPLRefundRequest = {
      provider,
      sessionId: payment.providerPaymentId,
      amount: refundAmount,
      reason,
    };

    let response: BNPLRefundResponse;

    if (provider === BNPLProvider.TABBY) {
      response = await this.tabbyService.refundPayment(request);
    } else {
      response = await this.tamaraService.refundPayment(request);
    }

    if (response.success) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          metadata: {
            ...(payment.metadata as any),
            refundId: response.refundId,
            refundedAt: new Date().toISOString(),
          },
        },
      });

      this.logger.log(`BNPL payment refunded: ${paymentId}`);
    }

    return response;
  }

  /**
   * Get installment plan details for display
   * Fetches real-time options from provider APIs
   */
  async getInstallmentPlan(amount: number, provider: BNPLProvider): Promise<any> {
    if (provider === BNPLProvider.TABBY) {
      const options = await this.tabbyService.getInstallmentOptions(amount);
      
      if (options.length === 0) {
        throw new BadRequestException('لا توجد خيارات تقسيط متاحة من Tabby لهذا المبلغ');
      }

      // Return the first available option (usually 4 installments)
      const option = options[0];
      return {
        provider: 'Tabby',
        installments: option.installments,
        installmentAmount: option.installmentAmount,
        frequency: 'كل أسبوعين',
        totalAmount: amount,
        description: `قسّم المبلغ على ${option.installments} دفعات بدون فوائد`,
      };
    }

    if (provider === BNPLProvider.TAMARA) {
      const options = await this.tamaraService.getInstallmentOptions(amount);
      
      if (options.length === 0) {
        throw new BadRequestException('لا توجد خيارات تقسيط متاحة من Tamara لهذا المبلغ');
      }

      // Return the first available option (prefer fewer installments)
      const option = options[0];
      return {
        provider: 'Tamara',
        installments: option.installments,
        installmentAmount: option.installmentAmount,
        frequency: 'شهرياً',
        totalAmount: amount,
        description: `قسّم المبلغ على ${option.installments} دفعات بدون فوائد`,
      };
    }

    throw new BadRequestException('مزود خدمة غير مدعوم');
  }
}
