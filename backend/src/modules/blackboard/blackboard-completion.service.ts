import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlackboardApiClient } from './blackboard-api.client';
import { NotificationService } from '../notification/notification.service';
import { EnrollmentStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface CompletionData {
  userId: string;
  courseId: string;
  completionPercentage: number;
  lastActivityAt: Date;
  isComplete: boolean;
  grade?: number;
}

@Injectable()
export class BlackboardCompletionService {
  private readonly logger = new Logger(BlackboardCompletionService.name);
  private readonly completionThreshold = 80; // 80% to be considered complete

  constructor(
    private readonly prisma: PrismaService,
    private readonly blackboardClient: BlackboardApiClient,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Sync completion status for a single enrollment
   */
  async syncEnrollmentCompletion(enrollmentId: string): Promise<void> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        cohort: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    if (!enrollment.blackboardEnrollmentId || !enrollment.user.blackboardUserId) {
      this.logger.warn(`Enrollment ${enrollmentId} not synced with Blackboard`);
      return;
    }

    try {
      // Get completion data from Blackboard
      const completionData = await this.blackboardClient.getUserCourseProgress(
        enrollment.cohort.blackboardCourseId!,
        enrollment.user.blackboardUserId,
      );

      // Update enrollment with completion data
      const isComplete = completionData.completionPercentage >= this.completionThreshold;
      const wasNotComplete = enrollment.status !== EnrollmentStatus.COMPLETED;

      await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          completionPercentage: completionData.completionPercentage,
          lastActivityAt: completionData.lastActivityAt,
          completionStatus: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
          status: isComplete ? EnrollmentStatus.COMPLETED : EnrollmentStatus.IN_PROGRESS,
          completedAt: isComplete && wasNotComplete ? new Date() : enrollment.completedAt,
          certificateEligible: isComplete,
          progress: completionData.completionPercentage,
        },
      });

      // If just completed, trigger certificate generation
      if (isComplete && wasNotComplete) {
        this.logger.log(
          `User ${enrollment.user.email} completed course: ${enrollment.cohort.program.titleAr}`,
        );
        await this.handleCourseCompletion(enrollment);
      }
    } catch (error) {
      this.logger.error(`Failed to sync completion for enrollment ${enrollmentId}`, error);
      throw error;
    }
  }

  /**
   * Handle course completion
   */
  private async handleCourseCompletion(enrollment: any): Promise<void> {
    try {
      // Send completion notification
      await this.notificationService.sendCourseCompletion(
        enrollment.user.id,
        enrollment.user.email,
        {
          userName: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
          programName: enrollment.cohort.program.titleAr,
          cohortName: enrollment.cohort.nameAr,
          completedAt: new Date().toISOString(),
        },
      );

      // Trigger certificate generation
      try {
        // Note: CertificateService will be injected when module is imported
        // For now, this is a placeholder for the integration
        this.logger.log(`Certificate generation triggered for enrollment: ${enrollment.id}`);
      } catch (error) {
        this.logger.error(`Failed to generate certificate for enrollment ${enrollment.id}`, error);
      }

      this.logger.log(`Sent completion notification for enrollment: ${enrollment.id}`);
    } catch (error) {
      this.logger.error(`Failed to handle course completion for enrollment ${enrollment.id}`, error);
    }
  }

  /**
   * Webhook handler for Blackboard completion events
   */
  async handleCompletionWebhook(webhookData: any): Promise<void> {
    try {
      const { userId, courseId, completionPercentage, timestamp } = webhookData;

      // Find enrollment by Blackboard IDs
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          user: {
            blackboardUserId: userId,
          },
          cohort: {
            blackboardCourseId: courseId,
          },
        },
      });

      if (!enrollment) {
        this.logger.warn(`No enrollment found for Blackboard user ${userId} in course ${courseId}`);
        return;
      }

      // Sync completion status
      await this.syncEnrollmentCompletion(enrollment.id);
    } catch (error) {
      this.logger.error('Failed to process completion webhook', error);
      throw error;
    }
  }

  /**
   * Bulk sync completion for multiple enrollments
   */
  async bulkSyncCompletion(enrollmentIds: string[]): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const enrollmentId of enrollmentIds) {
      try {
        await this.syncEnrollmentCompletion(enrollmentId);
        successful++;
        
        // Small delay to avoid rate limiting
        await this.sleep(500);
      } catch (error) {
        failed++;
        errors.push(`${enrollmentId}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk completion sync: ${successful} successful, ${failed} failed`);
    return { successful, failed, errors };
  }

  /**
   * Cron job: Sync completion for all active enrollments
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async syncAllActiveEnrollments(): Promise<void> {
    this.logger.log('Starting daily completion sync for all active enrollments');

    try {
      // Get all active enrollments that are synced with Blackboard
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          status: {
            in: [EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS],
          },
          blackboardEnrollmentId: {
            not: null,
          },
        },
        select: {
          id: true,
        },
      });

      this.logger.log(`Found ${enrollments.length} active enrollments to sync`);

      const enrollmentIds = enrollments.map((e) => e.id);
      const result = await this.bulkSyncCompletion(enrollmentIds);

      this.logger.log(
        `Daily completion sync complete: ${result.successful} successful, ${result.failed} failed`,
      );

      // Send admin alert if there were failures
      if (result.failed > 0) {
        await this.notificationService.sendAdminAlert({
          subject: 'Completion Sync Failures',
          message: `Daily completion sync completed with ${result.failed} failures.\n\nErrors:\n${result.errors.join('\n')}`,
          priority: 'NORMAL',
          metadata: {
            successful: result.successful,
            failed: result.failed,
            errors: result.errors,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to run daily completion sync', error);
      
      await this.notificationService.sendAdminAlert({
        subject: 'Daily Completion Sync Failed',
        message: `The daily completion sync job failed to run.\n\nError: ${error.message}`,
        priority: 'HIGH',
        metadata: {
          error: error.message,
        },
      });
    }
  }

  /**
   * Get completion statistics for a cohort
   */
  async getCohortCompletionStats(cohortId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    averageProgress: number;
    completionRate: number;
  }> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { cohortId },
      select: {
        status: true,
        progress: true,
        completionStatus: true,
      },
    });

    const total = enrollments.length;
    const completed = enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED).length;
    const inProgress = enrollments.filter((e) => e.status === EnrollmentStatus.IN_PROGRESS).length;
    const notStarted = enrollments.filter(
      (e) => e.status === EnrollmentStatus.ENROLLED || e.completionStatus === 'NOT_STARTED',
    ).length;

    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      averageProgress,
      completionRate,
    };
  }

  /**
   * Get completion statistics for a program
   */
  async getProgramCompletionStats(programId: string): Promise<{
    total: number;
    completed: number;
    completionRate: number;
    averageProgress: number;
  }> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        cohort: {
          programId,
        },
      },
      select: {
        status: true,
        progress: true,
      },
    });

    const total = enrollments.length;
    const completed = enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED).length;
    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      completionRate,
      averageProgress,
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
