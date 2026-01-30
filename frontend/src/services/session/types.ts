/**
 * SEU Short Courses — Session Types
 *
 * TypeScript types for training sessions and attendance.
 */

export type TrainingSessionStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TrainingSession {
  id: string;
  cohortId: string;
  instructorId: string;
  title: string;
  description: string | null;
  startTime: string;
  duration: number; // minutes
  status: TrainingSessionStatus;
  zoomMeetingId: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  createdAt: string;
  updatedAt: string;
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
  userJoinUrl?: string; // User's unique join URL (for learners)
}

export interface SessionJoinUrlResponse {
  joinUrl: string;
}

export interface SessionStartUrlResponse {
  startUrl: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  joinTime: string | null;
  leaveTime: string | null;
  duration: number | null; // seconds
  isPresent: boolean;
  isOverride: boolean;
  overrideBy: string | null;
  overrideAt: string | null;
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
  sessionDate: string;
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
    date: string;
    attended: boolean;
    duration: number | null;
  }>;
}

export interface CreateSessionDto {
  cohortId: string;
  instructorId: string;
  title: string;
  description?: string;
  startTime: string;
  duration: number;
}

export interface UpdateSessionDto {
  title?: string;
  description?: string;
  startTime?: string;
  duration?: number;
}

export interface OverrideAttendanceDto {
  userId: string;
  present: boolean;
}

export interface BulkOverrideAttendanceDto {
  updates: Array<{
    userId: string;
    present: boolean;
  }>;
}

export interface AttendanceExportData {
  session: {
    id: string;
    title: string;
    date: string;
  };
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
}
