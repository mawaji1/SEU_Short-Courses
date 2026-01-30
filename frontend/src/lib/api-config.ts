/**
 * SEU Short Courses — API Configuration
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
    // Catalog
    programs: '/api/catalog/programs',
    programsFeatured: '/api/catalog/programs/featured',
    programBySlug: (slug: string) => `/api/catalog/programs/slug/${slug}`,
    programById: (id: string) => `/api/catalog/programs/${id}`,
    categories: '/api/catalog/categories',
    categoryBySlug: (slug: string) => `/api/catalog/categories/slug/${slug}`,
    instructors: '/api/catalog/instructors',

    // Auth (future)
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',

    // Registration (future)
    registrations: '/api/registrations',

    // Sessions
    sessions: '/api/sessions',
    sessionById: (id: string) => `/api/sessions/${id}`,
    sessionJoinUrl: (id: string) => `/api/sessions/${id}/join-url`,
    sessionStartUrl: (id: string) => `/api/sessions/${id}/start-url`,
    sessionAttendance: (id: string) => `/api/sessions/${id}/attendance`,
    sessionAttendanceSummary: (id: string) => `/api/sessions/${id}/attendance/summary`,
    sessionAttendanceExport: (id: string) => `/api/sessions/${id}/attendance/export`,
    sessionAttendanceBulk: (id: string) => `/api/sessions/${id}/attendance/bulk`,
    mySessions: '/api/my-sessions',
    instructorSessions: '/api/instructor/sessions',
    cohortSessions: (cohortId: string) => `/api/cohorts/${cohortId}/sessions`,
    userCohortAttendance: (userId: string, cohortId: string) => `/api/users/${userId}/cohorts/${cohortId}/attendance`,
} as const;
