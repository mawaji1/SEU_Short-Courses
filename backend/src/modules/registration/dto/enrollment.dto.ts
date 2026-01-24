/**
 * Enrollment DTOs for Learner Experience
 *
 * These DTOs provide structured responses for learner-facing enrollment endpoints
 */

/**
 * Enrollment with Course Details Response
 * Used for "My Courses" dashboard
 */
export interface EnrollmentWithCourseDto {
  id: string;
  status: string;
  progress: number;
  completionStatus: string | null;
  completionPercentage: number | null;
  lastActivityAt: Date | null;
  certificateEligible: boolean;
  completedAt: Date | null;
  createdAt: Date;

  // Cohort information
  cohort: {
    id: string;
    nameAr: string;
    nameEn: string;
    startDate: Date;
    endDate: Date;
    status: string;

    // Program information
    program: {
      id: string;
      titleAr: string;
      titleEn: string;
      descriptionAr: string;
      descriptionEn: string;
      slug: string;
      type: string;
      deliveryMode: string;
      durationHours: number | null;
      certificateEnabled: boolean;
      certificateAttendanceThreshold: number;
    };

    // Instructor information
    instructor: {
      id: string;
      nameAr: string;
      nameEn: string;
      titleAr: string | null;
      titleEn: string | null;
      bioAr: string | null;
      bioEn: string | null;
      imageUrl: string | null;
    } | null;
  };

  // Certificate information (if eligible)
  certificate?: {
    id: string;
    number: string;
    issuedAt: Date;
    pdfUrl: string | null;
    verificationCode: string;
    status: string;
  } | null;
}

/**
 * Course Detail with Full Curriculum
 * Used for course detail page
 */
export interface CourseDetailDto extends EnrollmentWithCourseDto {
  // Add curriculum (modules and sessions)
  curriculum: {
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    durationHours: number | null;
    sortOrder: number;

    // Sessions within this module
    sessions: {
      id: string;
      titleAr: string;
      titleEn: string;
      descriptionAr: string | null;
      descriptionEn: string | null;
      durationMinutes: number | null;
      sortOrder: number;
    }[];
  }[];
}

/**
 * Session with Zoom Link
 * Used for upcoming sessions list
 */
export interface SessionWithZoomDto {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  durationMinutes: number;
  sortOrder: number;

  // Module information
  module: {
    id: string;
    titleAr: string;
    titleEn: string;
    sortOrder: number;
  };

  // Zoom meeting info (if available)
  zoomMeetingId?: string;
  zoomMeetingUrl?: string;
  zoomPassword?: string;

  // Session timing (derived from cohort schedule)
  scheduledDate?: Date;
  status?: 'UPCOMING' | 'IN_PROGRESS' | 'ENDED';
}

/**
 * Course Material
 * Used for materials download section
 */
export interface CourseMaterialDto {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENT' | 'PRESENTATION' | 'OTHER';
  fileUrl: string | null;
  externalLink: string | null;
  fileSize: number | null; // in bytes
  uploadedAt: Date;

  // Associated module/session (if any)
  moduleId?: string;
  sessionId?: string;
}

/**
 * Attendance Record
 * Used for attendance history page
 */
export interface AttendanceRecordDto {
  sessionId: string;
  sessionTitleAr: string;
  sessionTitleEn: string;
  moduleTitleAr: string;
  moduleTitleEn: string;
  sessionDate: Date;
  status: 'ATTENDED' | 'ABSENT' | 'EXCUSED' | 'LATE';
  durationMinutes: number;
  attendedMinutes: number | null;
  attendancePercentage: number | null;
}

/**
 * Attendance Summary
 * Overall attendance statistics
 */
export interface AttendanceSummaryDto {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  overallPercentage: number;
  certificateEligible: boolean;
  requiredPercentage: number;
  records: AttendanceRecordDto[];
}

/**
 * Progress Overview
 * Detailed progress information
 */
export interface ProgressOverviewDto {
  enrollmentId: string;
  status: string;
  overallProgress: number; // 0-100
  completionPercentage: number | null;
  lastActivityAt: Date | null;

  // Session statistics
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;

  // Attendance
  attendancePercentage: number;
  certificateEligible: boolean;
  requiredAttendance: number;

  // Milestones
  startedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate: Date | null;
}

/**
 * Instructor Message
 * Messages from instructor to learners
 */
export interface InstructorMessageDto {
  id: string;
  subject: string;
  message: string;
  sentAt: Date;
  readAt: Date | null;

  // Instructor information
  instructor: {
    id: string;
    nameAr: string;
    nameEn: string;
    imageUrl: string | null;
  };
}
