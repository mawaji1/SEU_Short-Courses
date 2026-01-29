import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { BNPLService } from './bnpl.service';
import { BetterAuthGuard } from '../better-auth/better-auth.guard';
import { BNPLProvider } from './interfaces/bnpl.interface';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly bnplService: BNPLService,
  ) {}

  /**
   * Create payment for a registration
   * POST /api/payments
   */
  @Post()
  @UseGuards(BetterAuthGuard)
  async createPayment(
    @Request() req: any,
    @Body() body: { registrationId: string; amount: number; currency?: string },
  ) {
    return this.paymentService.createPayment(
      req.user.id,
      body.registrationId,
      body.amount,
      body.currency,
    );
  }

  /**
   * Confirm payment after provider callback
   * POST /api/payments/:providerPaymentId/confirm
   * TODO: Update when HyperPay is implemented
   */
  @Post(':providerPaymentId/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(@Param('providerPaymentId') providerPaymentId: string) {
    return this.paymentService.confirmPayment(providerPaymentId);
  }

  /**
   * Get payment details
   * GET /api/payments/:paymentId
   */
  @Get(':paymentId')
  @UseGuards(BetterAuthGuard)
  async getPayment(@Request() req: any, @Param('paymentId') paymentId: string) {
    return this.paymentService.getPayment(req.user.id, paymentId);
  }

  /**
   * Initiate refund (full or partial)
   * PUT /api/payments/:paymentId/refund
   * Body: { amount?: number, reason?: string }
   * If amount is not provided, full refund is processed
   */
  @Put(':paymentId/refund')
  @UseGuards(BetterAuthGuard)
  async refundPayment(
    @Request() req: any,
    @Param('paymentId') paymentId: string,
    @Body() body: { amount?: number; reason?: string },
  ) {
    return this.paymentService.refundPayment(
      req.user.id,
      paymentId,
      body.amount,
      body.reason,
    );
  }

  /**
   * Payment webhook handler (HyperPay)
   * POST /api/payments/webhook
   * TODO: Implement when HyperPay is integrated
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    return this.paymentService.handleWebhook(payload);
  }

  /**
   * Check BNPL eligibility for a registration
   * GET /api/payments/bnpl/eligibility/:registrationId
   */
  @Get('bnpl/eligibility/:registrationId')
  @UseGuards(BetterAuthGuard)
  async checkBNPLEligibility(@Param('registrationId') registrationId: string) {
    return this.bnplService.checkEligibility(registrationId);
  }

  /**
   * Create BNPL checkout session
   * POST /api/payments/bnpl/checkout
   */
  @Post('bnpl/checkout')
  @UseGuards(BetterAuthGuard)
  async createBNPLCheckout(
    @Body() body: { registrationId: string; provider: BNPLProvider },
  ) {
    return this.bnplService.createCheckout(body.registrationId, body.provider);
  }

  /**
   * BNPL webhook handler for Tabby
   * POST /api/payments/webhook/tabby
   */
  @Post('webhook/tabby')
  async handleTabbyWebhook(@Body() payload: any) {
    return this.bnplService.confirmPayment(BNPLProvider.TABBY, payload.id);
  }

  /**
   * BNPL webhook handler for Tamara
   * POST /api/payments/webhook/tamara
   */
  @Post('webhook/tamara')
  async handleTamaraWebhook(@Body() payload: any) {
    return this.bnplService.confirmPayment(
      BNPLProvider.TAMARA,
      payload.order_id,
    );
  }

  /**
   * Get installment plan details
   * GET /api/payments/bnpl/installment-plan
   */
  @Get('bnpl/installment-plan')
  async getInstallmentPlan(
    @Query('amount') amount: string,
    @Query('provider') provider: BNPLProvider,
  ) {
    return this.bnplService.getInstallmentPlan(parseFloat(amount), provider);
  }
}
