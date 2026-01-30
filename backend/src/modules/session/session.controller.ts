import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { SessionService } from './session.service';
import { AttendanceService } from './attendance.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  OverrideAttendanceDto,
  BulkOverrideAttendanceDto,
} from './dto';
import { BetterAuthGuard } from '../better-auth/better-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Session Controller
 *
 * REST API endpoints for training session management:
 * - Session CRUD (admin/operations)
 * - Session listings (learners, instructors)
 * - Join URLs
 * - Attendance tracking
 */
@Controller()
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly attendanceService: AttendanceService,
  ) {}

  // =========================================================================
  // SESSIONS (Admin/Operations)
  // =========================================================================

  /**
   * Create a new training session with Zoom meeting.
   * Automatically registers enrolled learners for the Zoom meeting.
   */
  @Post('sessions')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  @HttpCode(HttpStatus.CREATED)
  async createSession(@Body() dto: CreateSessionDto) {
    return this.sessionService.createSession({
      ...dto,
      startTime: new Date(dto.startTime),
    });
  }

  /**
   * Update a session's details.
   */
  @Put('sessions/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  async updateSession(
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionService.updateSession(id, {
      ...dto,
      startTime: dto.startTime ? new Date(dto.startTime) : undefined,
    });
  }

  /**
   * Cancel a session and delete its Zoom meeting.
   */
  @Delete('sessions/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelSession(@Param('id') id: string) {
    await this.sessionService.cancelSession(id);
  }

  /**
   * Get sessions for a cohort (admin view).
   */
  @Get('cohorts/:cohortId/sessions')
  @UseGuards(BetterAuthGuard)
  async getCohortSessions(
    @Request() req: any,
    @Param('cohortId') cohortId: string,
  ) {
    return this.sessionService.getSessionsForCohort(cohortId, req.user.id);
  }

  // =========================================================================
  // SESSIONS (Learners)
  // =========================================================================

  /**
   * Get upcoming sessions for the current learner.
   * Returns sessions across all enrolled cohorts.
   */
  @Get('my-sessions')
  @UseGuards(BetterAuthGuard)
  async getMySessions(@Request() req: any) {
    return this.sessionService.getLearnerSessions(req.user.id);
  }

  /**
   * Get a specific session with the user's join URL.
   */
  @Get('sessions/:id')
  @UseGuards(BetterAuthGuard)
  async getSession(@Request() req: any, @Param('id') id: string) {
    return this.sessionService.getSession(id, req.user.id);
  }

  /**
   * Get the Zoom join URL for a session.
   * Returns the user's unique join URL for attendance tracking.
   */
  @Get('sessions/:id/join-url')
  @UseGuards(BetterAuthGuard)
  async getJoinUrl(@Request() req: any, @Param('id') id: string) {
    const joinUrl = await this.sessionService.getSessionJoinUrl(id, req.user.id);
    return { joinUrl };
  }

  // =========================================================================
  // SESSIONS (Instructors)
  // =========================================================================

  /**
   * Get upcoming sessions for the current instructor.
   */
  @Get('instructor/sessions')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  async getInstructorSessions(@Request() req: any) {
    return this.sessionService.getInstructorSessions(req.user.id);
  }

  /**
   * Get the Zoom start URL for an instructor.
   * This URL lets the instructor start the meeting as host.
   */
  @Get('sessions/:id/start-url')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  async getStartUrl(@Request() req: any, @Param('id') id: string) {
    const session = await this.sessionService.getSession(id);
    if (session.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return { error: 'Not authorized to start this session' };
    }
    return { startUrl: session.zoomStartUrl };
  }

  // =========================================================================
  // ATTENDANCE
  // =========================================================================

  /**
   * Get attendance records for a session.
   */
  @Get('sessions/:id/attendance')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN', 'OPERATIONS')
  async getSessionAttendance(@Param('id') id: string) {
    return this.attendanceService.getAttendanceForSession(id);
  }

  /**
   * Get attendance summary for a session.
   */
  @Get('sessions/:id/attendance/summary')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN', 'OPERATIONS')
  async getAttendanceSummary(@Param('id') id: string) {
    return this.attendanceService.getAttendanceSummary(id);
  }

  /**
   * Override attendance for a single user.
   */
  @Put('sessions/:id/attendance')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN', 'OPERATIONS')
  async overrideAttendance(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: OverrideAttendanceDto,
  ) {
    await this.attendanceService.overrideAttendance(
      id,
      dto.userId,
      dto.present,
      req.user.id,
    );
    return { success: true };
  }

  /**
   * Bulk update attendance for a session.
   */
  @Put('sessions/:id/attendance/bulk')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN', 'OPERATIONS')
  async bulkOverrideAttendance(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: BulkOverrideAttendanceDto,
  ) {
    await this.attendanceService.bulkUpdateAttendance(
      id,
      dto.updates,
      req.user.id,
    );
    return { success: true };
  }

  /**
   * Export attendance as CSV.
   */
  @Get('sessions/:id/attendance/export')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN', 'OPERATIONS')
  async exportAttendance(
    @Param('id') id: string,
    @Query('format') format: string = 'json',
    @Res() res: Response,
  ) {
    const data = await this.attendanceService.exportAttendance(id);

    if (format === 'csv') {
      const csv = this.generateCsv(data.records);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="attendance-${id}.csv"`,
      );
      return res.send(csv);
    }

    return res.json(data);
  }

  /**
   * Get attendance statistics for a user in a cohort.
   */
  @Get('users/:userId/cohorts/:cohortId/attendance')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN', 'OPERATIONS')
  async getUserAttendance(
    @Param('userId') userId: string,
    @Param('cohortId') cohortId: string,
  ) {
    return this.attendanceService.getUserAttendanceStats(userId, cohortId);
  }

  private generateCsv(
    records: Array<{
      email: string;
      firstName: string;
      lastName: string;
      joinTime: string;
      leaveTime: string;
      durationMinutes: number;
      present: string;
      override: string;
    }>,
  ): string {
    const headers = [
      'Email',
      'First Name',
      'Last Name',
      'Join Time',
      'Leave Time',
      'Duration (min)',
      'Present',
      'Override',
    ];
    const rows = records.map((r) => [
      r.email,
      r.firstName,
      r.lastName,
      r.joinTime,
      r.leaveTime,
      String(r.durationMinutes),
      r.present,
      r.override,
    ]);

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ];

    return lines.join('\n');
  }
}
