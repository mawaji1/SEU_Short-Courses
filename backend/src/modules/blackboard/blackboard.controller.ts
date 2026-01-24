import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { BlackboardProvisioningService } from './blackboard-provisioning.service';
import { BlackboardEnrollmentService } from './blackboard-enrollment.service';
import { BlackboardCompletionService } from './blackboard-completion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { MapCourseDto } from './dto/map-course.dto';

@Controller('blackboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlackboardController {
  constructor(
    private readonly provisioningService: BlackboardProvisioningService,
    private readonly enrollmentService: BlackboardEnrollmentService,
    private readonly completionService: BlackboardCompletionService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Provision a single user to Blackboard
   * Admin/Operations only
   */
  @Post('provision/:userId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  async provisionUser(@Param('userId') userId: string) {
    const result = await this.provisioningService.provisionUser(userId);
    return {
      success: result.success,
      blackboardUserId: result.blackboardUserId,
      action: result.action,
      error: result.error,
    };
  }

  /**
   * Bulk provision multiple users
   * Admin only
   */
  @Post('provision/bulk')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async bulkProvisionUsers(@Body() body: { userIds: string[] }) {
    const result = await this.provisioningService.bulkProvisionUsers(
      body.userIds,
    );
    return {
      successful: result.successful,
      failed: result.failed,
      total: body.userIds.length,
      results: result.results,
    };
  }

  /**
   * Get provisioning status for a user
   * Admin/Operations only
   */
  @Get('provision/status/:userId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  async getProvisioningStatus(@Param('userId') userId: string) {
    return this.provisioningService.getProvisioningStatus(userId);
  }

  /**
   * Retry failed provisioning
   * Admin/Operations only
   */
  @Post('provision/retry/:userId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  async retryFailedProvisioning(@Param('userId') userId: string) {
    const result =
      await this.provisioningService.retryFailedProvisioning(userId);
    return {
      success: result.success,
      blackboardUserId: result.blackboardUserId,
      action: result.action,
      error: result.error,
    };
  }

  /**
   * Enroll user in Blackboard course
   * Admin/Operations only
   */
  @Post('enroll/:enrollmentId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  async enrollUser(@Param('enrollmentId') enrollmentId: string) {
    const result = await this.enrollmentService.enrollUser(enrollmentId);
    return {
      success: result.success,
      blackboardEnrollmentId: result.blackboardEnrollmentId,
      action: result.action,
      error: result.error,
    };
  }

  /**
   * Bulk enroll users
   * Admin only
   */
  @Post('enroll/bulk')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async bulkEnrollUsers(@Body() body: { enrollmentIds: string[] }) {
    const result = await this.enrollmentService.bulkEnrollUsers(
      body.enrollmentIds,
    );
    return {
      successful: result.successful,
      failed: result.failed,
      total: body.enrollmentIds.length,
      results: result.results,
    };
  }

  /**
   * Get enrollment sync status
   * Admin/Operations only
   */
  @Get('enroll/status/:enrollmentId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  async getEnrollmentStatus(@Param('enrollmentId') enrollmentId: string) {
    return this.enrollmentService.getEnrollmentStatus(enrollmentId);
  }

  /**
   * Withdraw user from course
   * Admin/Operations only
   */
  @Post('enroll/withdraw/:enrollmentId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  async withdrawUser(@Param('enrollmentId') enrollmentId: string) {
    const result = await this.enrollmentService.withdrawUser(enrollmentId);
    return {
      success: result.success,
      action: result.action,
      error: result.error,
    };
  }

  /**
   * Sync enrollment status from Blackboard
   * Admin/Operations only
   */
  @Post('enroll/sync/:enrollmentId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  async syncEnrollmentStatus(@Param('enrollmentId') enrollmentId: string) {
    await this.enrollmentService.syncEnrollmentStatus(enrollmentId);
    return {
      success: true,
      message: 'Enrollment status synced',
    };
  }

  /**
   * Map cohort to Blackboard course
   * Admin/Operations only
   */
  @Post('courses/map')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  async mapCohortToCourse(@Body() dto: MapCourseDto) {
    const cohort = await this.prisma.cohort.update({
      where: { id: dto.cohortId },
      data: {
        blackboardCourseId: dto.blackboardCourseId,
      },
      include: {
        program: true,
      },
    });

    return {
      success: true,
      message: 'Cohort mapped to Blackboard course',
      cohort: {
        id: cohort.id,
        name: cohort.nameAr,
        programName: cohort.program.titleAr,
        blackboardCourseId: cohort.blackboardCourseId,
      },
    };
  }

  /**
   * Get all cohorts with their Blackboard course mappings
   * Admin/Operations only
   */
  @Get('courses/mappings')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  async getCourseMappings() {
    const cohorts = await this.prisma.cohort.findMany({
      include: {
        program: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return cohorts.map((cohort: any) => ({
      cohortId: cohort.id,
      cohortName: cohort.nameAr,
      programName: cohort.program.titleAr,
      blackboardCourseId: cohort.blackboardCourseId,
      isMapped: !!cohort.blackboardCourseId,
      startDate: cohort.startDate,
      status: cohort.status,
    }));
  }

  /**
   * Remove course mapping
   * Admin only
   */
  @Post('courses/unmap/:cohortId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async unmapCourse(@Param('cohortId') cohortId: string) {
    const cohort = await this.prisma.cohort.update({
      where: { id: cohortId },
      data: {
        blackboardCourseId: null,
      },
    });

    return {
      success: true,
      message: 'Course mapping removed',
      cohortId: cohort.id,
    };
  }

  /**
   * Sync completion status for an enrollment
   * Admin/Operations only
   */
  @Post('completion/sync/:enrollmentId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.OK)
  async syncCompletion(@Param('enrollmentId') enrollmentId: string) {
    await this.completionService.syncEnrollmentCompletion(enrollmentId);
    return {
      success: true,
      message: 'Completion status synced',
    };
  }

  /**
   * Bulk sync completion for multiple enrollments
   * Admin only
   */
  @Post('completion/sync/bulk')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async bulkSyncCompletion(@Body() body: { enrollmentIds: string[] }) {
    const result = await this.completionService.bulkSyncCompletion(
      body.enrollmentIds,
    );
    return {
      successful: result.successful,
      failed: result.failed,
      total: body.enrollmentIds.length,
      errors: result.errors,
    };
  }

  /**
   * Get completion statistics for a cohort
   * Admin/Operations only
   */
  @Get('completion/stats/cohort/:cohortId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  async getCohortCompletionStats(@Param('cohortId') cohortId: string) {
    return this.completionService.getCohortCompletionStats(cohortId);
  }

  /**
   * Get completion statistics for a program
   * Admin/Operations only
   */
  @Get('completion/stats/program/:programId')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  async getProgramCompletionStats(@Param('programId') programId: string) {
    return this.completionService.getProgramCompletionStats(programId);
  }

  /**
   * Webhook endpoint for Blackboard completion events
   * Public endpoint (secured by Blackboard webhook signature)
   */
  @Post('webhooks/completion')
  @HttpCode(HttpStatus.OK)
  async handleCompletionWebhook(@Body() webhookData: any) {
    await this.completionService.handleCompletionWebhook(webhookData);
    return {
      success: true,
      message: 'Webhook processed',
    };
  }
}
