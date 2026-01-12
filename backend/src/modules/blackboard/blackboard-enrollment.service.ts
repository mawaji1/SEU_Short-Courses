import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlackboardApiClient } from './blackboard-api.client';
import { NotificationService } from '../notification/notification.service';
import { EnrollmentStatus } from '@prisma/client';

export interface EnrollmentResult {
  success: boolean;
  blackboardEnrollmentId?: string;
  error?: string;
  action: 'enrolled' | 'updated' | 'failed';
}

export interface BlackboardEnrollment {
  id?: string;
  userId: string;
  courseId: string;
  availability?: {
    available: 'Yes' | 'No';
  };
  courseRoleId?: string; // Student, Instructor, TeachingAssistant
}

@Injectable()
export class BlackboardEnrollmentService {
  private readonly logger = new Logger(BlackboardEnrollmentService.name);
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 2000;

  // Blackboard course role IDs
  private readonly ROLES = {
    STUDENT: 'Student',
    INSTRUCTOR: 'Instructor',
    TEACHING_ASSISTANT: 'TeachingAssistant',
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly blackboardClient: BlackboardApiClient,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Enroll user in Blackboard course with retry logic
   */
  async enrollUser(enrollmentId: string): Promise<EnrollmentResult> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        cohort: {
          include: {
            program: true,
          },
        },
        registration: true,
      },
    });

    if (!enrollment) {
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    // Check if user is provisioned to Blackboard
    if (!enrollment.user.blackboardUserId) {
      throw new Error(`User not provisioned to Blackboard: ${enrollment.user.email}`);
    }

    // Check if cohort has Blackboard course mapping
    if (!enrollment.cohort.blackboardCourseId) {
      throw new Error(`Cohort not mapped to Blackboard course: ${enrollment.cohort.nameAr}`);
    }

    // Check if already enrolled
    if (enrollment.blackboardEnrollmentId && enrollment.blackboardSyncStatus === 'SYNCED') {
      this.logger.log(`User already enrolled: ${enrollment.user.email}`);
      return {
        success: true,
        blackboardEnrollmentId: enrollment.blackboardEnrollmentId,
        action: 'enrolled',
      };
    }

    // Update sync status to PENDING
    await this.updateSyncStatus(enrollmentId, 'PENDING');

    // Attempt enrollment with retry
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.attemptEnrollment(enrollment);

        // Update enrollment record
        await this.prisma.enrollment.update({
          where: { id: enrollmentId },
          data: {
            blackboardEnrollmentId: result.blackboardEnrollmentId,
            blackboardCourseId: enrollment.cohort.blackboardCourseId,
            blackboardRole: this.ROLES.STUDENT,
            blackboardSyncStatus: 'SYNCED',
            blackboardSyncedAt: new Date(),
            status: EnrollmentStatus.ENROLLED,
          },
        });

        this.logger.log(
          `Successfully enrolled user: ${enrollment.user.email} in course: ${enrollment.cohort.nameAr} (attempt ${attempt})`,
        );

        return result;
      } catch (error) {
        this.logger.error(
          `Enrollment attempt ${attempt}/${this.maxRetries} failed for user: ${enrollment.user.email}`,
          error,
        );

        if (attempt === this.maxRetries) {
          // Final attempt failed
          await this.handleEnrollmentFailure(enrollment, error);
          return {
            success: false,
            error: error.message,
            action: 'failed',
          };
        }

        // Wait before retry with exponential backoff
        await this.sleep(this.retryDelayMs * Math.pow(2, attempt - 1));
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
      action: 'failed',
    };
  }

  /**
   * Attempt to enroll user in Blackboard course
   */
  private async attemptEnrollment(enrollment: any): Promise<EnrollmentResult> {
    const enrollmentData: BlackboardEnrollment = {
      userId: enrollment.user.blackboardUserId,
      courseId: enrollment.cohort.blackboardCourseId,
      availability: {
        available: 'Yes',
      },
      courseRoleId: this.ROLES.STUDENT,
    };

    const result = await this.blackboardClient.enrollUserInCourse(enrollmentData);

    this.logger.log(
      `Enrolled user ${enrollment.user.email} in Blackboard course ${enrollment.cohort.blackboardCourseId}`,
    );

    return {
      success: true,
      blackboardEnrollmentId: result.id,
      action: 'enrolled',
    };
  }

  /**
   * Withdraw user from Blackboard course
   */
  async withdrawUser(enrollmentId: string): Promise<EnrollmentResult> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        cohort: true,
      },
    });

    if (!enrollment) {
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    if (!enrollment.blackboardEnrollmentId) {
      throw new Error(`No Blackboard enrollment found for: ${enrollmentId}`);
    }

    try {
      await this.blackboardClient.deleteEnrollment(
        enrollment.cohort.blackboardCourseId!,
        enrollment.user.blackboardUserId!,
      );

      // Update enrollment status
      await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: EnrollmentStatus.WITHDRAWN,
          blackboardSyncStatus: 'SYNCED',
          blackboardSyncedAt: new Date(),
        },
      });

      this.logger.log(`Successfully withdrew user: ${enrollment.user.email}`);

      return {
        success: true,
        action: 'updated',
      };
    } catch (error) {
      this.logger.error(`Failed to withdraw user: ${enrollment.user.email}`, error);
      throw error;
    }
  }

  /**
   * Sync enrollment status from Blackboard
   */
  async syncEnrollmentStatus(enrollmentId: string): Promise<void> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        cohort: true,
      },
    });

    if (!enrollment || !enrollment.blackboardEnrollmentId) {
      return;
    }

    try {
      const bbEnrollment = await this.blackboardClient.getEnrollment(
        enrollment.cohort.blackboardCourseId!,
        enrollment.user.blackboardUserId!,
      );

      // Update local enrollment based on Blackboard status
      await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          blackboardSyncedAt: new Date(),
          blackboardSyncStatus: 'SYNCED',
        },
      });

      this.logger.log(`Synced enrollment status for: ${enrollment.user.email}`);
    } catch (error) {
      this.logger.error(`Failed to sync enrollment: ${enrollmentId}`, error);
      await this.updateSyncStatus(enrollmentId, 'FAILED', error.message);
    }
  }

  /**
   * Bulk enroll users
   */
  async bulkEnrollUsers(enrollmentIds: string[]): Promise<{
    successful: number;
    failed: number;
    results: EnrollmentResult[];
  }> {
    const results: EnrollmentResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const enrollmentId of enrollmentIds) {
      try {
        const result = await this.enrollUser(enrollmentId);
        results.push(result);

        if (result.success) {
          successful++;
        } else {
          failed++;
        }

        // Small delay between requests to avoid rate limiting
        await this.sleep(500);
      } catch (error) {
        failed++;
        results.push({
          success: false,
          error: error.message,
          action: 'failed',
        });
      }
    }

    this.logger.log(`Bulk enrollment complete: ${successful} successful, ${failed} failed`);

    return { successful, failed, results };
  }

  /**
   * Handle enrollment failure
   */
  private async handleEnrollmentFailure(enrollment: any, error: any): Promise<void> {
    // Update sync status to FAILED
    await this.updateSyncStatus(enrollment.id, 'FAILED', error.message);

    // Send alert to admin
    await this.notificationService.sendAdminAlert({
      subject: 'Blackboard Enrollment Failed',
      message: `Failed to enroll user in Blackboard course after ${this.maxRetries} attempts.\n\nUser: ${enrollment.user.email}\nCourse: ${enrollment.cohort.name}\nEnrollment ID: ${enrollment.id}\nError: ${error.message}`,
      priority: 'HIGH',
      metadata: {
        enrollmentId: enrollment.id,
        userId: enrollment.user.id,
        cohortId: enrollment.cohort.id,
        error: error.message,
      },
    });

    this.logger.error(`Enrollment failed for user: ${enrollment.user.email}`, error);
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(
    enrollmentId: string,
    status: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        blackboardSyncStatus: status,
        blackboardSyncError: errorMessage,
      },
    });
  }

  /**
   * Get enrollment sync status
   */
  async getEnrollmentStatus(enrollmentId: string): Promise<{
    status: string;
    blackboardEnrollmentId: string | null;
    syncedAt: Date | null;
    error: string | null;
  }> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        blackboardSyncStatus: true,
        blackboardEnrollmentId: true,
        blackboardSyncedAt: true,
        blackboardSyncError: true,
      },
    });

    if (!enrollment) {
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    return {
      status: enrollment.blackboardSyncStatus || 'NOT_SYNCED',
      blackboardEnrollmentId: enrollment.blackboardEnrollmentId,
      syncedAt: enrollment.blackboardSyncedAt,
      error: enrollment.blackboardSyncError,
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
