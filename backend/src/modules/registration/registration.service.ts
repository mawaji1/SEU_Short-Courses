import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RegistrationStatus, CohortStatus } from '@prisma/client';
import {
    InitiateRegistrationDto,
    ConfirmRegistrationDto,
    CancelRegistrationDto,
    ApplyPromoCodeDto,
    RegistrationResponseDto,
    WaitlistPositionDto,
} from './dto';
import { NotificationService } from '../notification/notification.service';
import { WaitlistService } from './waitlist.service';

/**
 * Registration Service
 * 
 * Handles B2C registration flow:
 * - Initiate registration with seat hold
 * - Confirm registration after payment
 * - Cancel registration and release seat
 * - Waitlist management
 * - Promo code application
 */
@Injectable()
export class RegistrationService {
    private readonly logger = new Logger(RegistrationService.name);
    // Seat hold duration in minutes
    private readonly SEAT_HOLD_DURATION = 15;

    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
        private waitlistService: WaitlistService,
    ) { }

    /**
     * Initiate a new registration with seat hold
     */
    async initiateRegistration(
        userId: string,
        dto: InitiateRegistrationDto,
    ): Promise<RegistrationResponseDto> {
        console.log('initiateRegistration called with:', { userId, dto });
        
        if (!userId) {
            console.error('userId is undefined or null');
            throw new BadRequestException('معرف المستخدم غير صالح');
        }

        // Get cohort with program details
        const cohort = await this.prisma.cohort.findUnique({
            where: { id: dto.cohortId },
            include: {
                program: true,
            },
        });

        if (!cohort) {
            throw new NotFoundException('الموعد غير موجود');
        }

        // Check if cohort is open for registration
        if (cohort.status !== CohortStatus.OPEN && cohort.status !== CohortStatus.UPCOMING) {
            throw new BadRequestException('التسجيل في هذا الموعد غير متاح حالياً');
        }

        // Check registration dates
        const now = new Date();
        if (now < cohort.registrationStartDate) {
            throw new BadRequestException('لم يبدأ التسجيل في هذا الموعد بعد');
        }
        if (now > cohort.registrationEndDate) {
            throw new BadRequestException('انتهت فترة التسجيل في هذا الموعد');
        }

        // Check if user already has an ACTIVE registration for this cohort (exclude CANCELLED)
        const existingRegistration = await this.prisma.registration.findFirst({
            where: {
                userId,
                cohortId: dto.cohortId,
                status: {
                    in: [RegistrationStatus.PENDING_PAYMENT, RegistrationStatus.CONFIRMED],
                },
            },
            include: {
                cohort: {
                    include: {
                        program: true,
                    },
                },
            },
        });

        if (existingRegistration) {
            if (existingRegistration.status === RegistrationStatus.CONFIRMED) {
                throw new ConflictException('أنت مسجل بالفعل في هذا الموعد');
            }
            // If pending, return existing registration to continue payment (prevents duplicates)
            return this.formatRegistrationResponse(existingRegistration, existingRegistration.cohort);
        }

        // Check if user already has a registration for this PROGRAM (any cohort)
        const existingProgramRegistration = await this.prisma.registration.findFirst({
            where: {
                userId,
                cohort: {
                    programId: cohort.programId,
                },
                status: {
                    in: [RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING_PAYMENT],
                },
            },
            include: {
                cohort: true,
            },
        });

        if (existingProgramRegistration) {
            throw new ConflictException(
                `أنت مسجل بالفعل في هذا البرنامج (${existingProgramRegistration.cohort.nameAr})`
            );
        }

        // Use transaction to prevent race conditions
        let registration;
        try {
            registration = await this.prisma.$transaction(async (tx) => {
            // Count active registrations (confirmed + pending)
            const confirmedCount = await tx.registration.count({
                where: {
                    cohortId: dto.cohortId,
                    status: RegistrationStatus.CONFIRMED,
                },
            });

            const pendingCount = await tx.registration.count({
                where: {
                    cohortId: dto.cohortId,
                    status: RegistrationStatus.PENDING_PAYMENT,
                    expiresAt: {
                        gt: new Date(), // Only count non-expired pending
                    },
                },
            });

            const totalReserved = confirmedCount + pendingCount;

            // Check capacity
            if (totalReserved >= cohort.capacity) {
                throw new ConflictException('الموعد ممتلئ - يمكنك الانضمام لقائمة الانتظار');
            }

            // Calculate expiration time for seat hold
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + this.SEAT_HOLD_DURATION);

            // Create registration with expiration
            return tx.registration.create({
                data: {
                    userId,
                    cohortId: dto.cohortId,
                    status: RegistrationStatus.PENDING_PAYMENT,
                    expiresAt,
                },
                include: {
                    cohort: {
                        include: {
                            program: true,
                        },
                    },
                    user: true,
                },
            });
        });
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('أنت مسجل بالفعل في هذا الموعد');
            }
            throw error;
        }

        try {
            await this.notificationService.sendRegistrationConfirmation(
                userId,
                registration.user?.email || '',
                {
                    userName: `${registration.user?.firstName} ${registration.user?.lastName}`,
                    programName: cohort.program.titleAr,
                    cohortName: cohort.nameAr,
                    registrationId: registration.id,
                    amount: Number(cohort.program.price).toString(),
                },
                'ar',
            );
        } catch (error) {
            this.logger.warn('Failed to send registration confirmation email:', error);
            // Don't fail the registration if email fails
        }

        const expiresAt = registration.expiresAt || undefined;

        return {
            id: registration.id,
            userId: registration.userId,
            cohortId: registration.cohortId,
            status: registration.status,
            registeredAt: registration.registeredAt,
            confirmedAt: registration.confirmedAt,
            cohort: {
                id: cohort.id,
                nameAr: cohort.nameAr,
                nameEn: cohort.nameEn,
                startDate: cohort.startDate,
                endDate: cohort.endDate,
                capacity: cohort.capacity,
                enrolledCount: cohort.enrolledCount,
                program: {
                    id: cohort.program.id,
                    titleAr: cohort.program.titleAr,
                    titleEn: cohort.program.titleEn,
                    slug: cohort.program.slug,
                    price: Number(cohort.program.price),
                },
            },
            expiresAt,
        };
    }

    /**
     * Confirm registration after successful payment
     */
    async confirmRegistration(
        userId: string,
        dto: ConfirmRegistrationDto,
    ): Promise<RegistrationResponseDto> {
        const registration = await this.prisma.registration.findUnique({
            where: { id: dto.registrationId },
            include: {
                cohort: {
                    include: {
                        program: true,
                    },
                },
            },
        });

        if (!registration) {
            throw new NotFoundException('التسجيل غير موجود');
        }

        if (registration.userId !== userId) {
            throw new BadRequestException('لا يمكنك تأكيد هذا التسجيل');
        }

        if (registration.status !== RegistrationStatus.PENDING_PAYMENT) {
            throw new BadRequestException('هذا التسجيل لا يمكن تأكيده');
        }

        // Update registration status and increment enrolled count
        const [updatedRegistration] = await this.prisma.$transaction([
            this.prisma.registration.update({
                where: { id: dto.registrationId },
                data: {
                    status: RegistrationStatus.CONFIRMED,
                    confirmedAt: new Date(),
                },
                include: {
                    cohort: {
                        include: {
                            program: true,
                        },
                    },
                },
            }),
            this.prisma.cohort.update({
                where: { id: registration.cohortId },
                data: {
                    enrolledCount: { increment: 1 },
                },
            }),
        ]);

        // Check if cohort is now full
        const cohort = await this.prisma.cohort.findUnique({
            where: { id: registration.cohortId },
        });

        if (cohort && cohort.enrolledCount >= cohort.capacity) {
            await this.prisma.cohort.update({
                where: { id: cohort.id },
                data: { status: CohortStatus.FULL },
            });
        }

        return this.formatRegistrationResponse(updatedRegistration, updatedRegistration.cohort);
    }

    /**
     * Cancel a pending registration
     */
    async cancelRegistration(
        userId: string,
        dto: CancelRegistrationDto,
    ): Promise<{ success: boolean; message: string }> {
        const registration = await this.prisma.registration.findUnique({
            where: { id: dto.registrationId },
        });

        if (!registration) {
            throw new NotFoundException('التسجيل غير موجود');
        }

        if (registration.userId !== userId) {
            throw new BadRequestException('لا يمكنك إلغاء هذا التسجيل');
        }

        if (registration.status === RegistrationStatus.CANCELLED) {
            throw new BadRequestException('هذا التسجيل ملغى بالفعل');
        }

        const wasConfirmed = registration.status === RegistrationStatus.CONFIRMED;

        await this.prisma.$transaction(async (tx) => {
            // Update registration status
            await tx.registration.update({
                where: { id: dto.registrationId },
                data: { status: RegistrationStatus.CANCELLED },
            });

            // If was confirmed, decrement enrolled count
            if (wasConfirmed) {
                await tx.cohort.update({
                    where: { id: registration.cohortId },
                    data: {
                        enrolledCount: { decrement: 1 },
                    },
                });

                // Check if cohort was full and can now accept more
                const cohort = await tx.cohort.findUnique({
                    where: { id: registration.cohortId },
                });

                if (cohort && cohort.status === CohortStatus.FULL && cohort.enrolledCount < cohort.capacity) {
                    await tx.cohort.update({
                        where: { id: cohort.id },
                        data: { status: CohortStatus.OPEN },
                    });
                }
            }
        });

        // After transaction completes, promote next person from waitlist if seat became available
        if (wasConfirmed) {
            try {
                const promoted = await this.waitlistService.promoteNext(registration.cohortId);
                if (promoted) {
                    this.logger.log(`Promoted user ${promoted.userId} from waitlist for cohort ${registration.cohortId}`);
                }
            } catch (error) {
                this.logger.error(`Failed to promote from waitlist: ${error.message}`);
                // Don't fail the cancellation if waitlist promotion fails
            }
        }

        return {
            success: true,
            message: wasConfirmed
                ? 'تم إلغاء التسجيل. سيتم معالجة طلب الاسترداد قريباً.'
                : 'تم إلغاء التسجيل.',
        };
    }

    /**
     * Get user's registrations
     */
    async getUserRegistrations(userId: string): Promise<RegistrationResponseDto[]> {
        const registrations = await this.prisma.registration.findMany({
            where: { userId },
            include: {
                cohort: {
                    include: {
                        program: true,
                    },
                },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return registrations.map((reg) => ({
            id: reg.id,
            userId: reg.userId,
            cohortId: reg.cohortId,
            status: reg.status,
            registeredAt: reg.registeredAt,
            confirmedAt: reg.confirmedAt,
            cohort: {
                id: reg.cohort.id,
                nameAr: reg.cohort.nameAr,
                nameEn: reg.cohort.nameEn,
                startDate: reg.cohort.startDate,
                endDate: reg.cohort.endDate,
                capacity: reg.cohort.capacity,
                enrolledCount: reg.cohort.enrolledCount,
                program: {
                    id: reg.cohort.program.id,
                    titleAr: reg.cohort.program.titleAr,
                    titleEn: reg.cohort.program.titleEn,
                    slug: reg.cohort.program.slug,
                    price: Number(reg.cohort.program.price),
                },
            },
            payment: reg.payment ? {
                id: reg.payment.id,
                amount: Number(reg.payment.amount),
                status: reg.payment.status,
            } : undefined,
        }));
    }

    /**
     * Get registration by ID
     */
    async getRegistrationById(
        userId: string,
        registrationId: string,
    ): Promise<RegistrationResponseDto> {
        const registration = await this.prisma.registration.findUnique({
            where: { id: registrationId },
            include: {
                cohort: {
                    include: {
                        program: true,
                    },
                },
                payment: true,
            },
        });

        if (!registration) {
            throw new NotFoundException('التسجيل غير موجود');
        }

        if (registration.userId !== userId) {
            throw new BadRequestException('لا يمكنك عرض هذا التسجيل');
        }

        return {
            id: registration.id,
            userId: registration.userId,
            cohortId: registration.cohortId,
            status: registration.status,
            registeredAt: registration.registeredAt,
            confirmedAt: registration.confirmedAt,
            cohort: {
                id: registration.cohort.id,
                nameAr: registration.cohort.nameAr,
                nameEn: registration.cohort.nameEn,
                startDate: registration.cohort.startDate,
                endDate: registration.cohort.endDate,
                capacity: registration.cohort.capacity,
                enrolledCount: registration.cohort.enrolledCount,
                program: {
                    id: registration.cohort.program.id,
                    titleAr: registration.cohort.program.titleAr,
                    titleEn: registration.cohort.program.titleEn,
                    slug: registration.cohort.program.slug,
                    price: Number(registration.cohort.program.price),
                },
            },
            payment: registration.payment ? {
                id: registration.payment.id,
                amount: Number(registration.payment.amount),
                status: registration.payment.status,
            } : undefined,
        };
    }

    /**
     * Check seat availability for a cohort
     */
    async checkAvailability(cohortId: string): Promise<{
        available: number;
        total: number;
        status: string;
        isWaitlistOpen: boolean;
    }> {
        const cohort = await this.prisma.cohort.findUnique({
            where: { id: cohortId },
        });

        if (!cohort) {
            throw new NotFoundException('الموعد غير موجود');
        }

        const available = Math.max(0, cohort.capacity - cohort.enrolledCount);

        return {
            available,
            total: cohort.capacity,
            status: cohort.status,
            isWaitlistOpen: available === 0 && cohort.status === CohortStatus.FULL,
        };
    }

    /**
     * Helper: Format registration response
     */
    private formatRegistrationResponse(
        registration: any,
        cohort: any,
    ): RegistrationResponseDto {
        return {
            id: registration.id,
            userId: registration.userId,
            cohortId: registration.cohortId,
            status: registration.status,
            registeredAt: registration.registeredAt,
            confirmedAt: registration.confirmedAt,
            cohort: {
                id: cohort.id,
                nameAr: cohort.nameAr,
                nameEn: cohort.nameEn,
                startDate: cohort.startDate,
                endDate: cohort.endDate,
                capacity: cohort.capacity,
                enrolledCount: cohort.enrolledCount,
                program: {
                    id: cohort.program.id,
                    titleAr: cohort.program.titleAr,
                    titleEn: cohort.program.titleEn,
                    slug: cohort.program.slug,
                    price: Number(cohort.program.price),
                },
            },
        };
    }
}
