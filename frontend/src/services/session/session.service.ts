/**
 * SEU Short Courses — Session Service
 *
 * API service for training session operations.
 */

import { apiClient, API_ENDPOINTS } from '@/lib';
import {
  TrainingSession,
  SessionJoinUrlResponse,
  SessionStartUrlResponse,
  AttendanceRecord,
  AttendanceSummary,
  UserAttendanceStats,
  CreateSessionDto,
  UpdateSessionDto,
  OverrideAttendanceDto,
  BulkOverrideAttendanceDto,
  AttendanceExportData,
} from './types';

export const sessionService = {
  // ===========================================================================
  // LEARNER ENDPOINTS
  // ===========================================================================

  /**
   * Get upcoming sessions for the current learner.
   * Returns sessions across all enrolled cohorts.
   */
  async getMySessions(): Promise<TrainingSession[]> {
    return apiClient.get<TrainingSession[]>(API_ENDPOINTS.mySessions);
  },

  /**
   * Get a specific session with user's join URL.
   */
  async getSession(sessionId: string): Promise<TrainingSession> {
    return apiClient.get<TrainingSession>(API_ENDPOINTS.sessionById(sessionId));
  },

  /**
   * Get the Zoom join URL for a session.
   * Returns the user's unique join URL for attendance tracking.
   */
  async getJoinUrl(sessionId: string): Promise<string> {
    const response = await apiClient.get<SessionJoinUrlResponse>(
      API_ENDPOINTS.sessionJoinUrl(sessionId)
    );
    return response.joinUrl;
  },

  // ===========================================================================
  // INSTRUCTOR ENDPOINTS
  // ===========================================================================

  /**
   * Get upcoming sessions for the current instructor.
   */
  async getInstructorSessions(): Promise<TrainingSession[]> {
    return apiClient.get<TrainingSession[]>(API_ENDPOINTS.instructorSessions);
  },

  /**
   * Get the Zoom start URL for an instructor.
   * This URL lets the instructor start the meeting as host.
   */
  async getStartUrl(sessionId: string): Promise<string> {
    const response = await apiClient.get<SessionStartUrlResponse>(
      API_ENDPOINTS.sessionStartUrl(sessionId)
    );
    return response.startUrl;
  },

  // ===========================================================================
  // ADMIN ENDPOINTS
  // ===========================================================================

  /**
   * Get sessions for a cohort.
   */
  async getCohortSessions(cohortId: string): Promise<TrainingSession[]> {
    return apiClient.get<TrainingSession[]>(
      API_ENDPOINTS.cohortSessions(cohortId)
    );
  },

  /**
   * Create a new training session.
   */
  async createSession(data: CreateSessionDto): Promise<TrainingSession> {
    return apiClient.post<TrainingSession>(API_ENDPOINTS.sessions, data);
  },

  /**
   * Update a session.
   */
  async updateSession(
    sessionId: string,
    data: UpdateSessionDto
  ): Promise<TrainingSession> {
    return apiClient.put<TrainingSession>(
      API_ENDPOINTS.sessionById(sessionId),
      data
    );
  },

  /**
   * Cancel a session.
   */
  async cancelSession(sessionId: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.sessionById(sessionId));
  },

  // ===========================================================================
  // ATTENDANCE ENDPOINTS
  // ===========================================================================

  /**
   * Get attendance records for a session.
   */
  async getSessionAttendance(sessionId: string): Promise<AttendanceRecord[]> {
    return apiClient.get<AttendanceRecord[]>(
      API_ENDPOINTS.sessionAttendance(sessionId)
    );
  },

  /**
   * Get attendance summary for a session.
   */
  async getAttendanceSummary(sessionId: string): Promise<AttendanceSummary> {
    return apiClient.get<AttendanceSummary>(
      API_ENDPOINTS.sessionAttendanceSummary(sessionId)
    );
  },

  /**
   * Override attendance for a single user.
   */
  async overrideAttendance(
    sessionId: string,
    data: OverrideAttendanceDto
  ): Promise<{ success: boolean }> {
    return apiClient.put<{ success: boolean }>(
      API_ENDPOINTS.sessionAttendance(sessionId),
      data
    );
  },

  /**
   * Bulk update attendance for a session.
   */
  async bulkOverrideAttendance(
    sessionId: string,
    data: BulkOverrideAttendanceDto
  ): Promise<{ success: boolean }> {
    return apiClient.put<{ success: boolean }>(
      API_ENDPOINTS.sessionAttendanceBulk(sessionId),
      data
    );
  },

  /**
   * Export attendance data.
   */
  async exportAttendance(
    sessionId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<AttendanceExportData | Blob> {
    if (format === 'csv') {
      // For CSV, we need to handle the blob response
      const url = `${API_ENDPOINTS.sessionAttendanceExport(sessionId)}?format=csv`;
      const response = await fetch(url, {
        credentials: 'include',
      });
      return response.blob();
    }
    return apiClient.get<AttendanceExportData>(
      `${API_ENDPOINTS.sessionAttendanceExport(sessionId)}?format=json`
    );
  },

  /**
   * Get attendance statistics for a user in a cohort.
   */
  async getUserAttendanceStats(
    userId: string,
    cohortId: string
  ): Promise<UserAttendanceStats> {
    return apiClient.get<UserAttendanceStats>(
      API_ENDPOINTS.userCohortAttendance(userId, cohortId)
    );
  },
};

export default sessionService;
