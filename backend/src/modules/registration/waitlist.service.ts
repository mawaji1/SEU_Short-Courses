import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { WaitlistStatus, CohortStatus } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

export interface WaitlistEntryResponse {
  id: string;
  userId: string;
  cohortId: string;
  position: number;
  status: WaitlistStatus;
  notifiedAt: Date | null;
  expiresAt: Date | null;
  cohort?: {
    nameAr: string;
    nameEn: string;
    capacity: number;
    enrolledCount: number;
  };
}

/**
 * Waitlist Service
 *
 * Handles waitlist management:
 * - Join waitlist when cohort is full
 * - Get waitlist position
 * - Auto-promote when seat available
 * - Cleanup expired entries
 */
@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);
  // Hours to wait after notification before expiring
  private readonly NOTIFICATION_EXPIRY_HOURS = 24;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Add user to waitlist for a full cohort
   */
  async joinWaitlist(
    userId: string,
    cohortId: string,
  ): Promise<WaitlistEntryResponse> {
    // Check if cohort exists and is full
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    if (!cohort) {
      throw new NotFoundException('الموعد غير موجود');
    }

    if (cohort.status !== CohortStatus.FULL) {
      throw new BadRequestException('الموعد غير ممتلئ - يمكنك التسجيل مباشرة');
    }

    // Check if already on waitlist
    const existing = await this.prisma.waitlistEntry.findUnique({
      where: {
        userId_cohortId: { userId, cohortId },
      },
    });

    if (existing) {
      throw new ConflictException('أنت بالفعل في قائمة الانتظار');
    }

    // Check if already registered
    const existingRegistration = await this.prisma.registration.findFirst({
      where: {
        userId,
        cohortId,
      },
    });

    if (existingRegistration) {
      throw new ConflictException('أنت مسجل بالفعل في هذا الموعد');
    }

    // Get next position
    const lastEntry = await this.prisma.waitlistEntry.findFirst({
      where: { cohortId },
      orderBy: { position: 'desc' },
    });

    const nextPosition = (lastEntry?.position ?? 0) + 1;

    // Create waitlist entry
    const entry = await this.prisma.waitlistEntry.create({
      data: {
        userId,
        cohortId,
        position: nextPosition,
        status: WaitlistStatus.WAITING,
      },
    });

    return {
      id: entry.id,
      userId: entry.userId,
      cohortId: entry.cohortId,
      position: entry.position,
      status: entry.status,
      notifiedAt: entry.notifiedAt,
      expiresAt: entry.expiresAt,
      cohort: {
        nameAr: cohort.nameAr,
        nameEn: cohort.nameEn,
        capacity: cohort.capacity,
        enrolledCount: cohort.enrolledCount,
      },
    };
  }

  /**
   * Get user's waitlist position
   */
  async getWaitlistPosition(
    userId: string,
    cohortId: string,
  ): Promise<WaitlistEntryResponse | null> {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: {
        userId_cohortId: { userId, cohortId },
      },
    });

    if (!entry) {
      return null;
    }

    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    return {
      id: entry.id,
      userId: entry.userId,
      cohortId: entry.cohortId,
      position: entry.position,
      status: entry.status,
      notifiedAt: entry.notifiedAt,
      expiresAt: entry.expiresAt,
      cohort: cohort
        ? {
            nameAr: cohort.nameAr,
            nameEn: cohort.nameEn,
            capacity: cohort.capacity,
            enrolledCount: cohort.enrolledCount,
          }
        : undefined,
    };
  }

  /**
   * Get all waitlist entries for a user
   */
  async getUserWaitlistEntries(
    userId: string,
  ): Promise<WaitlistEntryResponse[]> {
    const entries = await this.prisma.waitlistEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const cohortIds = entries.map((e) => e.cohortId);
    const cohorts = await this.prisma.cohort.findMany({
      where: { id: { in: cohortIds } },
    });

    const cohortMap = new Map(cohorts.map((c) => [c.id, c]));

    return entries.map((entry) => {
      const cohort = cohortMap.get(entry.cohortId);
      return {
        id: entry.id,
        userId: entry.userId,
        cohortId: entry.cohortId,
        position: entry.position,
        status: entry.status,
        notifiedAt: entry.notifiedAt,
        expiresAt: entry.expiresAt,
        cohort: cohort
          ? {
              nameAr: cohort.nameAr,
              nameEn: cohort.nameEn,
              capacity: cohort.capacity,
              enrolledCount: cohort.enrolledCount,
            }
          : undefined,
      };
    });
  }

  /**
   * Leave waitlist
   */
  async leaveWaitlist(
    userId: string,
    cohortId: string,
  ): Promise<{ success: boolean }> {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: {
        userId_cohortId: { userId, cohortId },
      },
    });

    if (!entry) {
      throw new NotFoundException('لست في قائمة الانتظار لهذا الموعد');
    }

    await this.prisma.$transaction(async (tx) => {
      // Delete the entry
      await tx.waitlistEntry.delete({
        where: { id: entry.id },
      });

      // Reorder positions for remaining entries
      await tx.waitlistEntry.updateMany({
        where: {
          cohortId,
          position: { gt: entry.position },
        },
        data: {
          position: { decrement: 1 },
        },
      });
    });

    return { success: true };
  }

  /**
   * Promote next person in waitlist (called when seat becomes available)
   */
  async promoteNext(cohortId: string): Promise<WaitlistEntryResponse | null> {
    // Get first waiting entry
    const nextEntry = await this.prisma.waitlistEntry.findFirst({
      where: {
        cohortId,
        status: WaitlistStatus.WAITING,
      },
      orderBy: { position: 'asc' },
    });

    if (!nextEntry) {
      return null;
    }

    // Set expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.NOTIFICATION_EXPIRY_HOURS);

    // Update entry to notified
    const updated = await this.prisma.waitlistEntry.update({
      where: { id: nextEntry.id },
      data: {
        status: WaitlistStatus.NOTIFIED,
        notifiedAt: new Date(),
        expiresAt,
      },
    });

    // Fetch cohort and program data for notification
    const cohortData = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { program: true },
    });

    // Send notification email
    if (cohortData) {
      try {
        // Get user email
        const user = await this.prisma.user.findUnique({
          where: { id: updated.userId },
          select: { email: true, firstName: true, lastName: true },
        });

        if (user) {
          await this.notificationService.sendNotification({
            userId: updated.userId,
            type: 'WAITLIST_AVAILABLE',
            channel: 'EMAIL',
            recipient: user.email,
            subject: 'مقعد متاح الآن! - Seat Now Available!',
            templateId: 'waitlist-seat-available',
            templateData: {
              userName: `${user.firstName} ${user.lastName}`,
              programName: cohortData.program.titleAr,
              cohortName: cohortData.nameAr,
              expiresAt: expiresAt.toISOString(),
            },
            locale: 'ar',
            priority: 'HIGH',
            metadata: {
              cohortId: updated.cohortId,
              programId: cohortData.programId,
              expiresAt: expiresAt.toISOString(),
            },
          });
          this.logger.log(
            `Sent waitlist promotion notification to user ${updated.userId}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to send waitlist notification: ${error.message}`,
        );
        // Don't fail the promotion if notification fails
      }
    }

    return {
      id: updated.id,
      userId: updated.userId,
      cohortId: updated.cohortId,
      position: updated.position,
      status: updated.status,
      notifiedAt: updated.notifiedAt,
      expiresAt: updated.expiresAt,
    };
  }

  /**
   * Mark waitlist entry as converted (user registered)
   */
  async markConverted(userId: string, cohortId: string): Promise<void> {
    await this.prisma.waitlistEntry.updateMany({
      where: {
        userId,
        cohortId,
        status: { in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] },
      },
      data: {
        status: WaitlistStatus.CONVERTED,
      },
    });
  }

  /**
   * Get waitlist count for a cohort
   */
  async getWaitlistCount(cohortId: string): Promise<number> {
    return this.prisma.waitlistEntry.count({
      where: {
        cohortId,
        status: WaitlistStatus.WAITING,
      },
    });
  }
}
