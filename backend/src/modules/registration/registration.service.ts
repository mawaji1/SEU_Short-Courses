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
  EnrollmentWithCourseDto,
  CourseDetailDto,
  ProgressOverviewDto,
  CourseMaterialDto,
  AttendanceSummaryDto,
  AttendanceRecordDto,
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
  ) {}

  /**
   * Initiate a new registration with seat hold
   */
  async initiateRegistration(
    userId: string,
    dto: InitiateRegistrationDto,
  ): Promise<RegistrationResponseDto> {
    this.logger.debug(`initiateRegistration called for user ${userId}, cohort ${dto.cohortId}`);

    if (!userId) {
      this.logger.error('initiateRegistration: userId is undefined or null');
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
    if (
      cohort.status !== CohortStatus.OPEN &&
      cohort.status !== CohortStatus.UPCOMING
    ) {
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
          in: [
            RegistrationStatus.PENDING_PAYMENT,
            RegistrationStatus.CONFIRMED,
          ],
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
      return this.formatRegistrationResponse(
        existingRegistration,
        existingRegistration.cohort,
      );
    }

    // Check if user already has a registration for this PROGRAM (any cohort)
    const existingProgramRegistration =
      await this.prisma.registration.findFirst({
        where: {
          userId,
          cohort: {
            programId: cohort.programId,
          },
          status: {
            in: [
              RegistrationStatus.CONFIRMED,
              RegistrationStatus.PENDING_PAYMENT,
            ],
          },
        },
        include: {
          cohort: true,
        },
      });

    if (existingProgramRegistration) {
      throw new ConflictException(
        `أنت مسجل بالفعل في هذا البرنامج (${existingProgramRegistration.cohort.nameAr})`,
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
          throw new ConflictException(
            'الموعد ممتلئ - يمكنك الانضمام لقائمة الانتظار',
          );
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
      this.logger.warn(
        'Failed to send registration confirmation email:',
        error,
      );
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

    return this.formatRegistrationResponse(
      updatedRegistration,
      updatedRegistration.cohort,
    );
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

        if (
          cohort &&
          cohort.status === CohortStatus.FULL &&
          cohort.enrolledCount < cohort.capacity
        ) {
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
        const promoted = await this.waitlistService.promoteNext(
          registration.cohortId,
        );
        if (promoted) {
          this.logger.log(
            `Promoted user ${promoted.userId} from waitlist for cohort ${registration.cohortId}`,
          );
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
  async getUserRegistrations(
    userId: string,
  ): Promise<RegistrationResponseDto[]> {
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
      payment: reg.payment
        ? {
            id: reg.payment.id,
            amount: Number(reg.payment.amount),
            status: reg.payment.status,
          }
        : undefined,
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
      payment: registration.payment
        ? {
            id: registration.payment.id,
            amount: Number(registration.payment.amount),
            status: registration.payment.status,
          }
        : undefined,
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

  // =========================================================================
  // LEARNER EXPERIENCE - ENROLLMENT ENDPOINTS
  // =========================================================================

  /**
   * Get learner's enrolled courses (confirmed enrollments only)
   * Used for "My Courses" dashboard
   */
  async getMyEnrollments(userId: string): Promise<EnrollmentWithCourseDto[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        cohort: {
          include: {
            program: true,
            instructor: true,
          },
        },
        certificate: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      progress: enrollment.progress,
      completionStatus: enrollment.completionStatus,
      completionPercentage: enrollment.completionPercentage,
      lastActivityAt: enrollment.lastActivityAt,
      certificateEligible: enrollment.certificateEligible,
      completedAt: enrollment.completedAt,
      createdAt: enrollment.createdAt,
      cohort: {
        id: enrollment.cohort.id,
        nameAr: enrollment.cohort.nameAr,
        nameEn: enrollment.cohort.nameEn,
        startDate: enrollment.cohort.startDate,
        endDate: enrollment.cohort.endDate,
        status: enrollment.cohort.status,
        program: {
          id: enrollment.cohort.program.id,
          titleAr: enrollment.cohort.program.titleAr,
          titleEn: enrollment.cohort.program.titleEn,
          descriptionAr: enrollment.cohort.program.descriptionAr,
          descriptionEn: enrollment.cohort.program.descriptionEn,
          slug: enrollment.cohort.program.slug,
          type: enrollment.cohort.program.type,
          deliveryMode: enrollment.cohort.program.deliveryMode,
          durationHours: enrollment.cohort.program.durationHours,
          certificateEnabled: enrollment.cohort.program.certificateEnabled,
          certificateAttendanceThreshold:
            enrollment.cohort.program.certificateAttendanceThreshold,
        },
        instructor: enrollment.cohort.instructor
          ? {
              id: enrollment.cohort.instructor.id,
              nameAr: enrollment.cohort.instructor.nameAr,
              nameEn: enrollment.cohort.instructor.nameEn,
              titleAr: enrollment.cohort.instructor.titleAr,
              titleEn: enrollment.cohort.instructor.titleEn,
              bioAr: enrollment.cohort.instructor.bioAr,
              bioEn: enrollment.cohort.instructor.bioEn,
              imageUrl: enrollment.cohort.instructor.imageUrl,
            }
          : null,
      },
      certificate: enrollment.certificate
        ? {
            id: enrollment.certificate.id,
            number: enrollment.certificate.number,
            issuedAt: enrollment.certificate.issuedAt,
            pdfUrl: enrollment.certificate.pdfUrl,
            verificationCode: enrollment.certificate.verificationCode,
            status: enrollment.certificate.status,
          }
        : null,
    }));
  }

  /**
   * Get course detail with full curriculum
   * Used for course detail page
   */
  async getCourseDetail(
    userId: string,
    enrollmentId: string,
  ): Promise<CourseDetailDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        cohort: {
          include: {
            program: {
              include: {
                modules: {
                  include: {
                    sessions: true,
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
            instructor: true,
          },
        },
        certificate: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('الالتحاق بالبرنامج غير موجود');
    }

    if (enrollment.userId !== userId) {
      throw new BadRequestException('لا يمكنك عرض هذا البرنامج');
    }

    return {
      id: enrollment.id,
      status: enrollment.status,
      progress: enrollment.progress,
      completionStatus: enrollment.completionStatus,
      completionPercentage: enrollment.completionPercentage,
      lastActivityAt: enrollment.lastActivityAt,
      certificateEligible: enrollment.certificateEligible,
      completedAt: enrollment.completedAt,
      createdAt: enrollment.createdAt,
      cohort: {
        id: enrollment.cohort.id,
        nameAr: enrollment.cohort.nameAr,
        nameEn: enrollment.cohort.nameEn,
        startDate: enrollment.cohort.startDate,
        endDate: enrollment.cohort.endDate,
        status: enrollment.cohort.status,
        program: {
          id: enrollment.cohort.program.id,
          titleAr: enrollment.cohort.program.titleAr,
          titleEn: enrollment.cohort.program.titleEn,
          descriptionAr: enrollment.cohort.program.descriptionAr,
          descriptionEn: enrollment.cohort.program.descriptionEn,
          slug: enrollment.cohort.program.slug,
          type: enrollment.cohort.program.type,
          deliveryMode: enrollment.cohort.program.deliveryMode,
          durationHours: enrollment.cohort.program.durationHours,
          certificateEnabled: enrollment.cohort.program.certificateEnabled,
          certificateAttendanceThreshold:
            enrollment.cohort.program.certificateAttendanceThreshold,
        },
        instructor: enrollment.cohort.instructor
          ? {
              id: enrollment.cohort.instructor.id,
              nameAr: enrollment.cohort.instructor.nameAr,
              nameEn: enrollment.cohort.instructor.nameEn,
              titleAr: enrollment.cohort.instructor.titleAr,
              titleEn: enrollment.cohort.instructor.titleEn,
              bioAr: enrollment.cohort.instructor.bioAr,
              bioEn: enrollment.cohort.instructor.bioEn,
              imageUrl: enrollment.cohort.instructor.imageUrl,
            }
          : null,
      },
      certificate: enrollment.certificate
        ? {
            id: enrollment.certificate.id,
            number: enrollment.certificate.number,
            issuedAt: enrollment.certificate.issuedAt,
            pdfUrl: enrollment.certificate.pdfUrl,
            verificationCode: enrollment.certificate.verificationCode,
            status: enrollment.certificate.status,
          }
        : null,
      curriculum: enrollment.cohort.program.modules.map((module) => ({
        id: module.id,
        titleAr: module.titleAr,
        titleEn: module.titleEn,
        descriptionAr: module.descriptionAr,
        descriptionEn: module.descriptionEn,
        durationHours: module.durationHours,
        sortOrder: module.sortOrder,
        sessions: module.sessions
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((session) => ({
            id: session.id,
            titleAr: session.titleAr,
            titleEn: session.titleEn,
            descriptionAr: session.descriptionAr,
            descriptionEn: session.descriptionEn,
            durationMinutes: session.durationMinutes,
            sortOrder: session.sortOrder,
          })),
      })),
    };
  }

  /**
   * Get progress overview for an enrollment
   * Includes attendance, sessions, and completion data
   */
  async getProgressOverview(
    userId: string,
    enrollmentId: string,
  ): Promise<ProgressOverviewDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        cohort: {
          include: {
            program: {
              include: {
                modules: {
                  include: {
                    sessions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('الالتحاق بالبرنامج غير موجود');
    }

    if (enrollment.userId !== userId) {
      throw new BadRequestException('لا يمكنك عرض تقدم هذا البرنامج');
    }

    // Calculate total sessions
    const totalSessions = enrollment.cohort.program.modules.reduce(
      (sum, module) => sum + module.sessions.length,
      0,
    );

    // For now, use progress percentage to estimate completed sessions
    // In a real implementation, this would come from attendance records
    const completedSessions = Math.floor(
      (enrollment.progress / 100) * totalSessions,
    );
    const upcomingSessions = totalSessions - completedSessions;

    // Attendance percentage (will be tracked via Zoom attendance webhooks)
    const attendancePercentage =
      enrollment.completionPercentage || enrollment.progress;

    return {
      enrollmentId: enrollment.id,
      status: enrollment.status,
      overallProgress: enrollment.progress,
      completionPercentage: enrollment.completionPercentage,
      lastActivityAt: enrollment.lastActivityAt,
      totalSessions,
      completedSessions,
      upcomingSessions,
      attendancePercentage,
      certificateEligible: enrollment.certificateEligible,
      requiredAttendance:
        enrollment.cohort.program.certificateAttendanceThreshold,
      startedAt: enrollment.createdAt,
      expectedCompletionDate: enrollment.cohort.endDate,
      actualCompletionDate: enrollment.completedAt,
    };
  }

  /**
   * Get course materials for an enrollment
   * Returns all materials associated with the program
   */
  async getCourseMaterials(
    userId: string,
    enrollmentId: string,
  ): Promise<CourseMaterialDto[]> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        cohort: {
          include: {
            program: {
              include: {
                materials: {
                  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('الالتحاق بالبرنامج غير موجود');
    }

    if (enrollment.userId !== userId) {
      throw new BadRequestException('لا يمكنك عرض مواد هذا البرنامج');
    }

    return enrollment.cohort.program.materials.map((material) => ({
      id: material.id,
      titleAr: material.titleAr,
      titleEn: material.titleEn,
      descriptionAr: material.descriptionAr,
      descriptionEn: material.descriptionEn,
      type: material.type as
        | 'PDF'
        | 'VIDEO'
        | 'LINK'
        | 'DOCUMENT'
        | 'PRESENTATION'
        | 'OTHER',
      fileUrl: material.fileUrl,
      externalLink: material.externalLink,
      fileSize: material.fileSize,
      uploadedAt: material.createdAt,
      moduleId: material.moduleId || undefined,
      sessionId: material.sessionId || undefined,
    }));
  }

  /**
   * Get attendance summary for an enrollment
   * Returns calculated attendance based on progress and sessions
   * Note: This is calculated data - will be replaced with actual attendance from Zoom webhooks
   */
  async getAttendanceSummary(
    userId: string,
    enrollmentId: string,
  ): Promise<AttendanceSummaryDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        cohort: {
          include: {
            program: {
              include: {
                modules: {
                  include: {
                    sessions: true,
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('الالتحاق بالبرنامج غير موجود');
    }

    if (enrollment.userId !== userId) {
      throw new BadRequestException('لا يمكنك عرض سجل الحضور لهذا البرنامج');
    }

    // Calculate total sessions
    const allSessions = enrollment.cohort.program.modules.flatMap((module) =>
      module.sessions.map((session) => ({ module, session })),
    );

    const totalSessions = allSessions.length;
    const attendancePercentage =
      enrollment.completionPercentage || enrollment.progress;

    // Calculate attended sessions based on progress percentage
    const attendedSessions = Math.floor(
      (attendancePercentage / 100) * totalSessions,
    );
    const absentSessions = totalSessions - attendedSessions;

    // Generate attendance records (calculated/simulated)
    const now = new Date();
    const cohortStart = new Date(enrollment.cohort.startDate);
    const cohortEnd = new Date(enrollment.cohort.endDate);
    const cohortDuration = cohortEnd.getTime() - cohortStart.getTime();

    const records: AttendanceRecordDto[] = allSessions.map((item, index) => {
      // Calculate estimated session date
      const sessionProgress = (index + 1) / totalSessions;
      const sessionDate = new Date(
        cohortStart.getTime() + cohortDuration * sessionProgress,
      );

      // Determine if attended (first X sessions based on progress)
      const isAttended = index < attendedSessions;
      const sessionDuration = item.session.durationMinutes || 60;

      return {
        sessionId: item.session.id,
        sessionTitleAr: item.session.titleAr,
        sessionTitleEn: item.session.titleEn,
        moduleTitleAr: item.module.titleAr,
        moduleTitleEn: item.module.titleEn,
        sessionDate: sessionDate,
        status: isAttended ? 'ATTENDED' : 'ABSENT',
        durationMinutes: sessionDuration,
        attendedMinutes: isAttended ? sessionDuration : 0,
        attendancePercentage: isAttended ? 100 : 0,
      };
    });

    return {
      totalSessions,
      attendedSessions,
      absentSessions,
      overallPercentage: attendancePercentage,
      certificateEligible: enrollment.certificateEligible,
      requiredPercentage:
        enrollment.cohort.program.certificateAttendanceThreshold,
      records,
    };
  }
}
