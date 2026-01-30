import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  joinTime: Date | null;
  leaveTime: Date | null;
  duration: number | null; // seconds
  isPresent: boolean;
  isOverride: boolean;
  overrideBy: string | null;
  overrideAt: Date | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AttendanceSummary {
  sessionId: string;
  sessionTitle: string;
  sessionDate: Date;
  totalRegistered: number;
  totalPresent: number;
  attendanceRate: number;
}

export interface UserAttendanceStats {
  userId: string;
  cohortId: string;
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
  sessions: Array<{
    sessionId: string;
    title: string;
    date: Date;
    attended: boolean;
    duration: number | null;
  }>;
}

/**
 * Manages attendance tracking for training sessions.
 */
@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get attendance records for a session.
   */
  async getAttendanceForSession(sessionId: string): Promise<AttendanceRecord[]> {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Build attendance map from actual attendance records
    const attendanceMap = new Map(
      session.attendances.map((a) => [a.userId, a]),
    );

    // Return all registered users with their attendance status
    return session.registrations.map((reg) => {
      const attendance = attendanceMap.get(reg.userId);
      return {
        id: attendance?.id || '',
        sessionId,
        userId: reg.userId,
        joinTime: attendance?.joinTime || null,
        leaveTime: attendance?.leaveTime || null,
        duration: attendance?.duration || null,
        isPresent: attendance?.isPresent || false,
        isOverride: attendance?.isOverride || false,
        overrideBy: attendance?.overrideBy || null,
        overrideAt: attendance?.overrideAt || null,
        user: reg.user,
      };
    });
  }

  /**
   * Get attendance summary for a session.
   */
  async getAttendanceSummary(sessionId: string): Promise<AttendanceSummary> {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        registrations: true,
        attendances: {
          where: { isPresent: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const totalRegistered = session.registrations.length;
    const totalPresent = session.attendances.length;
    const attendanceRate =
      totalRegistered > 0 ? (totalPresent / totalRegistered) * 100 : 0;

    return {
      sessionId,
      sessionTitle: session.title,
      sessionDate: session.startTime,
      totalRegistered,
      totalPresent,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  }

  /**
   * Get attendance statistics for a user in a cohort.
   */
  async getUserAttendanceStats(
    userId: string,
    cohortId: string,
  ): Promise<UserAttendanceStats> {
    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        cohortId,
        status: 'COMPLETED', // Only count completed sessions
      },
      include: {
        attendances: {
          where: { userId },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const totalSessions = sessions.length;
    const attendedSessions = sessions.filter(
      (s) => s.attendances.some((a) => a.isPresent),
    ).length;
    const attendancePercentage =
      totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    return {
      userId,
      cohortId,
      totalSessions,
      attendedSessions,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      sessions: sessions.map((s) => {
        const attendance = s.attendances[0];
        return {
          sessionId: s.id,
          title: s.title,
          date: s.startTime,
          attended: attendance?.isPresent || false,
          duration: attendance?.duration || null,
        };
      }),
    };
  }

  /**
   * Get attendance percentage for certificate eligibility.
   */
  async getAttendancePercentage(
    userId: string,
    cohortId: string,
  ): Promise<number> {
    const stats = await this.getUserAttendanceStats(userId, cohortId);
    return stats.attendancePercentage;
  }

  /**
   * Manually override attendance for a user.
   * Used by instructors or admins to mark attendance manually.
   */
  async overrideAttendance(
    sessionId: string,
    userId: string,
    present: boolean,
    overrideByUserId: string,
  ): Promise<void> {
    this.logger.log(
      `Override attendance: session=${sessionId}, user=${userId}, present=${present}`,
    );

    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Upsert attendance record
    await this.prisma.sessionAttendance.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      create: {
        sessionId,
        userId,
        isPresent: present,
        isOverride: true,
        overrideBy: overrideByUserId,
        overrideAt: new Date(),
      },
      update: {
        isPresent: present,
        isOverride: true,
        overrideBy: overrideByUserId,
        overrideAt: new Date(),
      },
    });

    this.logger.log(`Attendance overridden for user ${userId}`);
  }

  /**
   * Bulk update attendance for a session.
   */
  async bulkUpdateAttendance(
    sessionId: string,
    updates: Array<{ userId: string; present: boolean }>,
    overrideByUserId: string,
  ): Promise<void> {
    this.logger.log(
      `Bulk update attendance for session ${sessionId}: ${updates.length} updates`,
    );

    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Use transaction for bulk update
    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.sessionAttendance.upsert({
          where: {
            sessionId_userId: {
              sessionId,
              userId: update.userId,
            },
          },
          create: {
            sessionId,
            userId: update.userId,
            isPresent: update.present,
            isOverride: true,
            overrideBy: overrideByUserId,
            overrideAt: new Date(),
          },
          update: {
            isPresent: update.present,
            isOverride: true,
            overrideBy: overrideByUserId,
            overrideAt: new Date(),
          },
        }),
      ),
    );

    this.logger.log(`Bulk attendance update completed`);
  }

  /**
   * Export attendance data for a session as CSV-ready data.
   */
  async exportAttendance(sessionId: string): Promise<{
    session: { id: string; title: string; date: Date };
    records: Array<{
      email: string;
      firstName: string;
      lastName: string;
      joinTime: string;
      leaveTime: string;
      durationMinutes: number;
      present: string;
      override: string;
    }>;
  }> {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const attendance = await this.getAttendanceForSession(sessionId);

    return {
      session: {
        id: session.id,
        title: session.title,
        date: session.startTime,
      },
      records: attendance.map((a) => ({
        email: a.user.email,
        firstName: a.user.firstName,
        lastName: a.user.lastName,
        joinTime: a.joinTime?.toISOString() || '',
        leaveTime: a.leaveTime?.toISOString() || '',
        durationMinutes: a.duration ? Math.round(a.duration / 60) : 0,
        present: a.isPresent ? 'Yes' : 'No',
        override: a.isOverride ? 'Yes' : 'No',
      })),
    };
  }
}
