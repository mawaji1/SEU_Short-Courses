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
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    /**
     * Create payment for a registration
     * POST /api/payments
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    async createPayment(
        @Request() req: any,
        @Body() body: { registrationId: string; amount: number; currency?: string },
    ) {
        return this.paymentService.createPayment(
            req.user.userId,
            body.registrationId,
            body.amount,
            body.currency,
        );
    }

    /**
     * Confirm payment after Moyasar callback
     * POST /api/payments/:moyasarPaymentId/confirm
     */
    @Post(':moyasarPaymentId/confirm')
    @HttpCode(HttpStatus.OK)
    async confirmPayment(@Param('moyasarPaymentId') moyasarPaymentId: string) {
        return this.paymentService.confirmPayment(moyasarPaymentId);
    }

    /**
     * Get payment details
     * GET /api/payments/:paymentId
     */
    @Get(':paymentId')
    @UseGuards(JwtAuthGuard)
    async getPayment(@Request() req: any, @Param('paymentId') paymentId: string) {
        return this.paymentService.getPayment(req.user.userId, paymentId);
    }

    /**
     * Initiate refund
     * PUT /api/payments/:paymentId/refund
     */
    @Put(':paymentId/refund')
    @UseGuards(JwtAuthGuard)
    async refundPayment(
        @Request() req: any,
        @Param('paymentId') paymentId: string,
        @Body() body: { reason?: string },
    ) {
        return this.paymentService.refundPayment(
            req.user.userId,
            paymentId,
            body.reason,
        );
    }

    /**
     * Moyasar webhook handler
     * POST /api/payments/webhook
     */
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() payload: any) {
        return this.paymentService.handleWebhook(payload);
    }
}
