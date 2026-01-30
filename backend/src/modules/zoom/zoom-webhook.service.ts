import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface ZoomWebhookPayload {
  event: string;
  event_ts: number;
  payload: {
    account_id: string;
    object: {
      uuid?: string;
      id?: string | number;
      host_id?: string;
      topic?: string;
      start_time?: string;
      duration?: number;
      participant?: {
        user_id?: string;
        user_name?: string;
        id?: string;
        participant_uuid?: string;
        registrant_id?: string;
        email?: string;
        join_time?: string;
        leave_time?: string;
      };
      registrant?: {
        id?: string;
        registrant_id?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        join_url?: string;
      };
    };
  };
}

/**
 * Handles Zoom webhook events for meeting and attendance tracking.
 */
@Injectable()
export class ZoomWebhookService {
  private readonly logger = new Logger(ZoomWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process incoming Zoom webhook events.
   */
  async handleEvent(payload: ZoomWebhookPayload): Promise<void> {
    const { event } = payload;
    this.logger.log(`Processing Zoom webhook event: ${event}`);

    switch (event) {
      case 'meeting.started':
        await this.handleMeetingStarted(payload);
        break;
      case 'meeting.ended':
        await this.handleMeetingEnded(payload);
        break;
      case 'meeting.participant_joined':
        await this.handleParticipantJoined(payload);
        break;
      case 'meeting.participant_left':
        await this.handleParticipantLeft(payload);
        break;
      case 'meeting.registration_created':
        await this.handleRegistrationCreated(payload);
        break;
      default:
        this.logger.debug(`Unhandled event type: ${event}`);
    }
  }

  /**
   * Handle meeting.started event.
   * Updates session status to IN_PROGRESS.
   */
  private async handleMeetingStarted(payload: ZoomWebhookPayload): Promise<void> {
    const meetingId = String(payload.payload.object.id);
    this.logger.log(`Meeting started: ${meetingId}`);

    const session = await this.prisma.trainingSession.findUnique({
      where: { zoomMeetingId: meetingId },
    });

    if (!session) {
      this.logger.warn(`No session found for meeting ${meetingId}`);
      return;
    }

    await this.prisma.trainingSession.update({
      where: { id: session.id },
      data: { status: 'IN_PROGRESS' },
    });

    this.logger.log(`Session ${session.id} marked as IN_PROGRESS`);
  }

  /**
   * Handle meeting.ended event.
   * Updates session status to COMPLETED and finalizes attendance.
   */
  private async handleMeetingEnded(payload: ZoomWebhookPayload): Promise<void> {
    const meetingId = String(payload.payload.object.id);
    this.logger.log(`Meeting ended: ${meetingId}`);

    const session = await this.prisma.trainingSession.findUnique({
      where: { zoomMeetingId: meetingId },
      include: { attendances: true },
    });

    if (!session) {
      this.logger.warn(`No session found for meeting ${meetingId}`);
      return;
    }

    // Mark session as completed
    await this.prisma.trainingSession.update({
      where: { id: session.id },
      data: { status: 'COMPLETED' },
    });

    // Finalize attendance: mark anyone who joined as present
    await this.prisma.sessionAttendance.updateMany({
      where: {
        sessionId: session.id,
        joinTime: { not: null },
      },
      data: { isPresent: true },
    });

    this.logger.log(`Session ${session.id} marked as COMPLETED`);
  }

  /**
   * Handle meeting.participant_joined event.
   * Records join time for attendance tracking.
   */
  private async handleParticipantJoined(payload: ZoomWebhookPayload): Promise<void> {
    const meetingId = String(payload.payload.object.id);
    const participant = payload.payload.object.participant;

    if (!participant) {
      this.logger.warn('No participant data in joined event');
      return;
    }

    const registrantId = participant.registrant_id;
    const joinTime = participant.join_time
      ? new Date(participant.join_time)
      : new Date();

    this.logger.log(
      `Participant joined meeting ${meetingId}: registrant=${registrantId}`,
    );

    // Find the session
    const session = await this.prisma.trainingSession.findUnique({
      where: { zoomMeetingId: meetingId },
    });

    if (!session) {
      this.logger.warn(`No session found for meeting ${meetingId}`);
      return;
    }

    // Find the registration by Zoom registrant ID
    if (!registrantId) {
      this.logger.warn('No registrant ID in participant data');
      return;
    }

    const registration = await this.prisma.sessionRegistration.findUnique({
      where: { zoomRegistrantId: registrantId },
    });

    if (!registration) {
      this.logger.warn(`No registration found for registrant ${registrantId}`);
      return;
    }

    // Create or update attendance record
    await this.prisma.sessionAttendance.upsert({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId: registration.userId,
        },
      },
      create: {
        sessionId: session.id,
        userId: registration.userId,
        joinTime,
        isPresent: false, // Will be marked true when meeting ends
      },
      update: {
        joinTime,
      },
    });

    this.logger.log(
      `Recorded join time for user ${registration.userId} in session ${session.id}`,
    );
  }

  /**
   * Handle meeting.participant_left event.
   * Records leave time and updates duration.
   */
  private async handleParticipantLeft(payload: ZoomWebhookPayload): Promise<void> {
    const meetingId = String(payload.payload.object.id);
    const participant = payload.payload.object.participant;

    if (!participant) {
      this.logger.warn('No participant data in left event');
      return;
    }

    const registrantId = participant.registrant_id;
    const leaveTime = participant.leave_time
      ? new Date(participant.leave_time)
      : new Date();

    this.logger.log(
      `Participant left meeting ${meetingId}: registrant=${registrantId}`,
    );

    // Find the session
    const session = await this.prisma.trainingSession.findUnique({
      where: { zoomMeetingId: meetingId },
    });

    if (!session) {
      this.logger.warn(`No session found for meeting ${meetingId}`);
      return;
    }

    if (!registrantId) {
      this.logger.warn('No registrant ID in participant data');
      return;
    }

    const registration = await this.prisma.sessionRegistration.findUnique({
      where: { zoomRegistrantId: registrantId },
    });

    if (!registration) {
      this.logger.warn(`No registration found for registrant ${registrantId}`);
      return;
    }

    // Get existing attendance record
    const attendance = await this.prisma.sessionAttendance.findUnique({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId: registration.userId,
        },
      },
    });

    if (!attendance) {
      this.logger.warn(
        `No attendance record for user ${registration.userId} in session ${session.id}`,
      );
      return;
    }

    // Calculate duration since join
    let additionalDuration = 0;
    if (attendance.joinTime) {
      additionalDuration = Math.floor(
        (leaveTime.getTime() - attendance.joinTime.getTime()) / 1000,
      );
    }

    // Update with accumulated duration
    await this.prisma.sessionAttendance.update({
      where: { id: attendance.id },
      data: {
        leaveTime,
        duration: (attendance.duration || 0) + additionalDuration,
      },
    });

    this.logger.log(
      `Recorded leave time for user ${registration.userId}, duration: ${additionalDuration}s`,
    );
  }

  /**
   * Handle meeting.registration_created event.
   * This is a fallback - normally we create registrations ourselves.
   */
  private async handleRegistrationCreated(payload: ZoomWebhookPayload): Promise<void> {
    const meetingId = String(payload.payload.object.id);
    const registrant = payload.payload.object.registrant;

    this.logger.log(`Registration created for meeting ${meetingId}`);

    if (!registrant) {
      return;
    }

    // Log for debugging, but we typically create registrations ourselves
    this.logger.debug(
      `Registrant: ${registrant.email} (${registrant.registrant_id})`,
    );
  }
}
