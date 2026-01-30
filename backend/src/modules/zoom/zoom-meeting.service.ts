import { Injectable, Logger } from '@nestjs/common';
import { ZoomAuthService } from './zoom-auth.service';

export interface ZoomMeeting {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  created_at: string;
  join_url: string;
  start_url: string;
  password?: string;
  settings: {
    host_video: boolean;
    participant_video: boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    approval_type: number;
    registration_type: number;
    auto_recording: string;
  };
}

export interface ZoomRegistrant {
  id: string;
  registrant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  join_url: string;
  status: string;
  create_time: string;
}

export interface CreateMeetingOptions {
  hostUserId: string;
  topic: string;
  startTime: Date;
  duration: number; // minutes
  timezone?: string;
  agenda?: string;
}

interface MeetingSettings {
  host_video: boolean;
  participant_video: boolean;
  join_before_host: boolean;
  mute_upon_entry: boolean;
  waiting_room: boolean;
  approval_type: number;
  registration_type: number;
  auto_recording: string;
  alternative_hosts_email_notification: boolean;
}

/**
 * Manages Zoom meetings for training sessions.
 * Creates meetings with registration enabled for attendance tracking.
 */
@Injectable()
export class ZoomMeetingService {
  private readonly logger = new Logger(ZoomMeetingService.name);
  private readonly baseUrl = 'https://api.zoom.us/v2';

  constructor(private readonly authService: ZoomAuthService) {}

  /**
   * Create a Zoom meeting with registration required.
   * All meetings are created with registration so we can track attendance
   * via unique registrant IDs.
   */
  async createMeeting(options: CreateMeetingOptions): Promise<ZoomMeeting> {
    this.logger.log(
      `Creating Zoom meeting "${options.topic}" for host ${options.hostUserId}`,
    );

    const token = await this.authService.getAccessToken();

    const settings: MeetingSettings = {
      host_video: true,
      participant_video: true,
      join_before_host: false, // Learners wait for instructor
      mute_upon_entry: true,
      waiting_room: false, // Disabled since we use registration
      approval_type: 0, // Automatic approval for registrants
      registration_type: 2, // Register once, attend any occurrence
      auto_recording: 'cloud', // Record to cloud for QA
      alternative_hosts_email_notification: true,
    };

    const body = {
      topic: options.topic,
      type: 2, // Scheduled meeting
      start_time: options.startTime.toISOString(),
      duration: options.duration,
      timezone: options.timezone || 'Asia/Riyadh',
      agenda: options.agenda || '',
      settings,
    };

    const response = await fetch(
      `${this.baseUrl}/users/${options.hostUserId}/meetings`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      this.logger.error(`Failed to create meeting: ${JSON.stringify(error)}`);
      throw new Error(`Failed to create Zoom meeting: ${error.message}`);
    }

    const meeting = (await response.json()) as ZoomMeeting;
    this.logger.log(`Created Zoom meeting ${meeting.id}`);

    return meeting;
  }

  /**
   * Get meeting details by ID.
   */
  async getMeeting(meetingId: string | number): Promise<ZoomMeeting | null> {
    const token = await this.authService.getAccessToken();

    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get Zoom meeting: ${error.message}`);
    }

    return (await response.json()) as ZoomMeeting;
  }

  /**
   * Update a meeting.
   */
  async updateMeeting(
    meetingId: string | number,
    updates: Partial<CreateMeetingOptions>,
  ): Promise<void> {
    this.logger.log(`Updating Zoom meeting ${meetingId}`);

    const token = await this.authService.getAccessToken();

    const body: Record<string, unknown> = {};
    if (updates.topic) body.topic = updates.topic;
    if (updates.startTime) body.start_time = updates.startTime.toISOString();
    if (updates.duration) body.duration = updates.duration;
    if (updates.timezone) body.timezone = updates.timezone;
    if (updates.agenda) body.agenda = updates.agenda;

    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(`Failed to update Zoom meeting: ${error.message}`);
    }

    this.logger.log(`Updated Zoom meeting ${meetingId}`);
  }

  /**
   * Delete a meeting.
   */
  async deleteMeeting(meetingId: string | number): Promise<void> {
    this.logger.log(`Deleting Zoom meeting ${meetingId}`);

    const token = await this.authService.getAccessToken();

    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(`Failed to delete Zoom meeting: ${error.message}`);
    }

    this.logger.log(`Deleted Zoom meeting ${meetingId}`);
  }

  /**
   * Add a registrant to a meeting.
   * Returns the unique join URL for this registrant.
   * Uses batch endpoint which requires meeting:write:batch_registrants:admin scope.
   */
  async addRegistrant(
    meetingId: string | number,
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<ZoomRegistrant> {
    this.logger.log(`Adding registrant ${email} to meeting ${meetingId}`);

    const token = await this.authService.getAccessToken();

    // Use batch registrants endpoint (requires meeting:write:batch_registrants:admin)
    const body = {
      registrants: [
        {
          email,
          first_name: firstName,
          last_name: lastName,
        },
      ],
    };

    const response = await fetch(
      `${this.baseUrl}/meetings/${meetingId}/batch_registrants`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      this.logger.error(
        `Failed to add registrant: ${JSON.stringify(error)}`,
      );

      // Handle specific errors
      if (error.code === 3000) {
        throw new Error('Registrant already exists for this meeting');
      }

      throw new Error(`Failed to add registrant: ${error.message}`);
    }

    const result = await response.json();
    const registrantData = result.registrants?.[0];

    if (!registrantData) {
      throw new Error('No registrant data returned from Zoom');
    }

    const registrant: ZoomRegistrant = {
      id: registrantData.registrant_id,
      registrant_id: registrantData.registrant_id,
      email: registrantData.email,
      first_name: firstName,
      last_name: lastName,
      join_url: registrantData.join_url,
      status: 'approved',
      create_time: new Date().toISOString(),
    };

    this.logger.log(
      `Added registrant ${registrant.registrant_id} for ${email}`,
    );

    return registrant;
  }

  /**
   * Get a specific registrant by ID.
   */
  async getRegistrant(
    meetingId: string | number,
    registrantId: string,
  ): Promise<ZoomRegistrant | null> {
    const token = await this.authService.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/meetings/${meetingId}/registrants/${registrantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get registrant: ${error.message}`);
    }

    return (await response.json()) as ZoomRegistrant;
  }

  /**
   * List all registrants for a meeting.
   */
  async listRegistrants(
    meetingId: string | number,
    status: 'pending' | 'approved' | 'denied' = 'approved',
  ): Promise<ZoomRegistrant[]> {
    const token = await this.authService.getAccessToken();

    const registrants: ZoomRegistrant[] = [];
    let nextPageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        status,
        page_size: '300',
      });
      if (nextPageToken) {
        params.append('next_page_token', nextPageToken);
      }

      const response = await fetch(
        `${this.baseUrl}/meetings/${meetingId}/registrants?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to list registrants: ${error.message}`);
      }

      const data = await response.json();
      registrants.push(...(data.registrants || []));
      nextPageToken = data.next_page_token;
    } while (nextPageToken);

    return registrants;
  }

  /**
   * Remove a registrant from a meeting.
   */
  async removeRegistrant(
    meetingId: string | number,
    registrantId: string,
  ): Promise<void> {
    this.logger.log(
      `Removing registrant ${registrantId} from meeting ${meetingId}`,
    );

    const token = await this.authService.getAccessToken();

    // Zoom uses PUT with action 'cancel' to remove registrants
    const response = await fetch(
      `${this.baseUrl}/meetings/${meetingId}/registrants/status`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          registrants: [{ id: registrantId }],
        }),
      },
    );

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(`Failed to remove registrant: ${error.message}`);
    }

    this.logger.log(`Removed registrant ${registrantId}`);
  }

  /**
   * Get meeting participants (for after meeting ends).
   */
  async getMeetingParticipants(
    meetingUuid: string,
  ): Promise<{ participants: Array<{ id: string; name: string; user_email: string; join_time: string; leave_time: string; duration: number }> }> {
    const token = await this.authService.getAccessToken();

    // Double-encode the UUID if it contains special characters
    const encodedUuid = meetingUuid.includes('/')
      ? encodeURIComponent(encodeURIComponent(meetingUuid))
      : meetingUuid;

    const response = await fetch(
      `${this.baseUrl}/past_meetings/${encodedUuid}/participants?page_size=300`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get participants: ${error.message}`);
    }

    return await response.json();
  }
}
