import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PaymentStatus, RegistrationStatus } from '@prisma/client';
import axios from 'axios';

/**
 * Payment Service
 * 
 * Handles payment processing via Moyasar gateway
 */
@Injectable()
export class PaymentService {
    private readonly moyasarApiUrl = 'https://api.moyasar.com/v1';
    private readonly moyasarSecretKey: string;

    constructor(private prisma: PrismaService) {
        this.moyasarSecretKey = process.env.MOYASAR_SECRET_KEY || '';
    }

    private getMoyasarHeaders() {
        return {
            'Authorization': `Basic ${Buffer.from(this.moyasarSecretKey + ':').toString('base64')}`,
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
            const moyasarPayment = await this.moyasarClient.Payment.create({
                amount: Math.round(amount * 100), // Convert to halalas
                currency,
                description: `${registration.cohort.program.titleAr} - ${registration.cohort.nameAr}`,
                callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
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
            });

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
     */
    async confirmPayment(moyasarPaymentId: string) {
        // Fetch payment from Moyasar
        const moyasarPayment = await this.moyasarClient.Payment.fetch(moyasarPaymentId);

        if (!moyasarPayment) {
            throw new NotFoundException('عملية الدفع غير موجودة');
        }

        // Find our payment record
        const payment = await this.prisma.payment.findFirst({
            where: { providerPaymentId: moyasarPaymentId },
            include: {
                registration: {
                    include: {
                        cohort: true,
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundException('سجل الدفع غير موجود');
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
                        ...(payment.metadata as any || {}),
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
                        ...(payment.metadata as any || {}),
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
     */
    async handleWebhook(payload: any) {
        const { type, data } = payload;

        if (type === 'payment_paid') {
            await this.confirmPayment(data.id);
        } else if (type === 'payment_failed') {
            const payment = await this.prisma.payment.findFirst({
                where: { providerPaymentId: data.id },
            });

            if (payment) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: PaymentStatus.FAILED,
                        metadata: {
                            ...(payment.metadata as any || {}),
                            moyasarResponse: data,
                        },
                    },
                });
            }
        }

        return { received: true };
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
     */
    async refundPayment(userId: string, paymentId: string, reason?: string) {
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

        try {
            // Create refund via Moyasar
            const refund = await this.moyasarClient.Refund.create({
                payment_id: payment.providerPaymentId,
                amount: Math.round(Number(payment.amount) * 100),
            });

            // Update payment status
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: PaymentStatus.REFUNDED,
                    refundedAt: new Date(),
                    refundAmount: payment.amount,
                    metadata: {
                        ...(payment.metadata as any || {}),
                        refund,
                    },
                },
            });

            return {
                success: true,
                message: 'تم بدء عملية الاسترداد',
                refund,
            };
        } catch (error) {
            console.error('Refund failed:', error);
            throw new BadRequestException('فشلت عملية الاسترداد');
        }
    }
}
