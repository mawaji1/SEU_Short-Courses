import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ZoomMeetingService } from '../zoom/zoom-meeting.service';
import { ZoomUserService } from '../zoom/zoom-user.service';
import { TrainingSessionStatus } from '@prisma/client';

export interface CreateSessionDto {
  cohortId: string;
  instructorId: string;
  title: string;
  description?: string;
  startTime: Date;
  duration: number; // minutes
}

export interface SessionWithJoinUrl {
  id: string;
  cohortId: string;
  instructorId: string;
  title: string;
  description: string | null;
  startTime: Date;
  duration: number;
  status: TrainingSessionStatus;
  zoomMeetingId: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  cohort: {
    id: string;
    nameAr: string;
    nameEn: string;
    program: {
      id: string;
      titleAr: string;
      titleEn: string;
    };
  };
  userJoinUrl?: string; // Unique URL for the requesting user
}

/**
 * Manages training sessions and their Zoom meetings.
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly zoomMeetingService: ZoomMeetingService,
    private readonly zoomUserService: ZoomUserService,
  ) {}

  /**
   * Create a new training session with Zoom meeting.
   * Auto-registers all enrolled learners for the Zoom meeting.
   */
  async createSession(dto: CreateSessionDto): Promise<SessionWithJoinUrl> {
    this.logger.log(`Creating session "${dto.title}" for cohort ${dto.cohortId}`);

    // Verify cohort exists
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: dto.cohortId },
      include: {
        program: true,
        enrollments: {
          where: { status: { in: ['ENROLLED', 'IN_PROGRESS'] } },
          include: { user: true },
        },
      },
    });

    if (!cohort) {
      throw new NotFoundException(`Cohort ${dto.cohortId} not found`);
    }

    // Verify instructor exists and has INSTRUCTOR role
    const instructor = await this.prisma.user.findUnique({
      where: { id: dto.instructorId },
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor ${dto.instructorId} not found`);
    }

    if (instructor.role !== 'INSTRUCTOR' && instructor.role !== 'ADMIN') {
      throw new BadRequestException(
        `User ${dto.instructorId} is not an instructor`,
      );
    }

    // Ensure instructor has a Zoom account
    let zoomUserId = instructor.zoomUserId;
    if (!zoomUserId) {
      this.logger.log(`Creating Zoom account for instructor ${instructor.email}`);
      const zoomUser = await this.zoomUserService.createUser(
        instructor.email,
        instructor.firstName,
        instructor.lastName,
      );
      zoomUserId = zoomUser.id;

      // Store the Zoom user ID
      await this.prisma.user.update({
        where: { id: instructor.id },
        data: { zoomUserId },
      });
    }

    // Create the Zoom meeting
    const meeting = await this.zoomMeetingService.createMeeting({
      hostUserId: zoomUserId,
      topic: `${cohort.program.titleEn} - ${dto.title}`,
      startTime: dto.startTime,
      duration: dto.duration,
      agenda: dto.description,
    });

    // Create the session in our database
    const session = await this.prisma.trainingSession.create({
      data: {
        cohortId: dto.cohortId,
        instructorId: dto.instructorId,
        title: dto.title,
        description: dto.description,
        startTime: dto.startTime,
        duration: dto.duration,
        zoomMeetingId: String(meeting.id),
        zoomJoinUrl: meeting.join_url,
        zoomStartUrl: meeting.start_url,
        zoomPassword: meeting.password,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cohort: {
          include: {
            program: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
      },
    });

    // Auto-register all enrolled learners
    for (const enrollment of cohort.enrollments) {
      try {
        await this.registerLearnerForSession(session.id, enrollment.userId);
      } catch (error) {
        this.logger.error(
          `Failed to register user ${enrollment.userId} for session: ${error}`,
        );
      }
    }

    this.logger.log(`Created session ${session.id} with Zoom meeting ${meeting.id}`);

    return session;
  }

  /**
   * Register a learner for a session's Zoom meeting.
   * Stores the unique join URL for the learner.
   */
  async registerLearnerForSession(
    sessionId: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(`Registering user ${userId} for session ${sessionId}`);

    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (!session.zoomMeetingId) {
      throw new BadRequestException('Session does not have a Zoom meeting');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Check if already registered
    const existing = await this.prisma.sessionRegistration.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (existing) {
      this.logger.debug(`User ${userId} already registered for session ${sessionId}`);
      return;
    }

    // Register with Zoom
    const registrant = await this.zoomMeetingService.addRegistrant(
      session.zoomMeetingId,
      user.email,
      user.firstName,
      user.lastName,
    );

    // Store registration
    await this.prisma.sessionRegistration.create({
      data: {
        sessionId,
        userId,
        zoomRegistrantId: registrant.registrant_id,
        zoomJoinUrl: registrant.join_url,
      },
    });

    this.logger.log(`Registered user ${userId} with Zoom registrant ${registrant.registrant_id}`);
  }

  /**
   * Get the unique Zoom join URL for a user for a session.
   */
  async getSessionJoinUrl(sessionId: string, userId: string): Promise<string> {
    const registration = await this.prisma.sessionRegistration.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (!registration || !registration.zoomJoinUrl) {
      throw new NotFoundException(
        `User ${userId} is not registered for session ${sessionId}`,
      );
    }

    return registration.zoomJoinUrl;
  }

  /**
   * Get a session by ID with optional user-specific join URL.
   */
  async getSession(sessionId: string, userId?: string): Promise<SessionWithJoinUrl> {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cohort: {
          include: {
            program: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    let userJoinUrl: string | undefined;
    if (userId) {
      const registration = await this.prisma.sessionRegistration.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      });
      userJoinUrl = registration?.zoomJoinUrl || undefined;
    }

    return {
      ...session,
      userJoinUrl,
    };
  }

  /**
   * Get all sessions for a cohort.
   */
  async getSessionsForCohort(
    cohortId: string,
    userId?: string,
  ): Promise<SessionWithJoinUrl[]> {
    const sessions = await this.prisma.trainingSession.findMany({
      where: { cohortId },
      orderBy: { startTime: 'asc' },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cohort: {
          include: {
            program: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
      },
    });

    if (!userId) {
      return sessions;
    }

    // Get user's registrations for these sessions
    const registrations = await this.prisma.sessionRegistration.findMany({
      where: {
        sessionId: { in: sessions.map((s) => s.id) },
        userId,
      },
    });

    const regMap = new Map(registrations.map((r) => [r.sessionId, r]));

    return sessions.map((s) => ({
      ...s,
      userJoinUrl: regMap.get(s.id)?.zoomJoinUrl || undefined,
    }));
  }

  /**
   * Get upcoming sessions for an instructor.
   */
  async getInstructorSessions(instructorId: string): Promise<SessionWithJoinUrl[]> {
    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        instructorId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      orderBy: { startTime: 'asc' },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cohort: {
          include: {
            program: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
      },
    });

    return sessions;
  }

  /**
   * Get upcoming sessions for a learner across all their enrollments.
   */
  async getLearnerSessions(userId: string): Promise<SessionWithJoinUrl[]> {
    // Get all cohorts the user is enrolled in
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        status: { in: ['ENROLLED', 'IN_PROGRESS'] },
      },
      select: { cohortId: true },
    });

    const cohortIds = enrollments.map((e) => e.cohortId);

    if (cohortIds.length === 0) {
      return [];
    }

    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        cohortId: { in: cohortIds },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        startTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Include sessions from last 24h
      },
      orderBy: { startTime: 'asc' },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cohort: {
          include: {
            program: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
      },
    });

    // Get user's registrations
    const registrations = await this.prisma.sessionRegistration.findMany({
      where: {
        sessionId: { in: sessions.map((s) => s.id) },
        userId,
      },
    });

    const regMap = new Map(registrations.map((r) => [r.sessionId, r]));

    return sessions.map((s) => ({
      ...s,
      userJoinUrl: regMap.get(s.id)?.zoomJoinUrl || undefined,
    }));
  }

  /**
   * Cancel a session.
   */
  async cancelSession(sessionId: string): Promise<void> {
    this.logger.log(`Cancelling session ${sessionId}`);

    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Delete Zoom meeting if exists
    if (session.zoomMeetingId) {
      try {
        await this.zoomMeetingService.deleteMeeting(session.zoomMeetingId);
      } catch (error) {
        this.logger.error(`Failed to delete Zoom meeting: ${error}`);
        // Continue even if Zoom deletion fails
      }
    }

    // Update session status
    await this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Session ${sessionId} cancelled`);
  }

  /**
   * Update a session's details.
   */
  async updateSession(
    sessionId: string,
    updates: Partial<CreateSessionDto>,
  ): Promise<SessionWithJoinUrl> {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Update Zoom meeting if relevant fields changed
    if (session.zoomMeetingId && (updates.title || updates.startTime || updates.duration)) {
      await this.zoomMeetingService.updateMeeting(session.zoomMeetingId, {
        topic: updates.title,
        startTime: updates.startTime,
        duration: updates.duration,
      });
    }

    // Update in database
    const updated = await this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        title: updates.title,
        description: updates.description,
        startTime: updates.startTime,
        duration: updates.duration,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cohort: {
          include: {
            program: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }
}
