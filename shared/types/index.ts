/**
 * SEU Short Courses Platform — Shared Types
 * 
 * Common TypeScript types shared between frontend and backend.
 * These types define the contract between client and server.
 */

// =============================================================================
// USER & AUTH TYPES
// =============================================================================

export type UserRole = 'learner' | 'coordinator' | 'operations' | 'finance' | 'admin';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: UserRole;
    organizationId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

// =============================================================================
// CATALOG TYPES
// =============================================================================

export type ProgramStatus = 'draft' | 'published' | 'archived';
export type ProgramType = 'course' | 'workshop' | 'bootcamp' | 'certification';
export type DeliveryMode = 'online' | 'in-person' | 'hybrid';

export interface Program {
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    shortDescriptionAr: string;
    shortDescriptionEn: string;
    slug: string;
    type: ProgramType;
    deliveryMode: DeliveryMode;
    durationHours: number;
    price: number;
    currency: 'SAR';
    status: ProgramStatus;
    categoryId: string;
    imageUrl?: string;
    prerequisitesAr?: string;
    prerequisitesEn?: string;
    learningOutcomesAr: string[];
    learningOutcomesEn: string[];
    targetAudienceAr?: string;
    targetAudienceEn?: string;
    instructorId?: string;
    blackboardCourseId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    parentId?: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface Instructor {
    id: string;
    nameAr: string;
    nameEn: string;
    titleAr: string;
    titleEn: string;
    bioAr?: string;
    bioEn?: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// =============================================================================
// COHORT TYPES
// =============================================================================

export type CohortStatus = 'upcoming' | 'open' | 'full' | 'in-progress' | 'completed' | 'cancelled';

export interface Cohort {
    id: string;
    programId: string;
    nameAr: string;
    nameEn: string;
    startDate: string;
    endDate: string;
    registrationStartDate: string;
    registrationEndDate: string;
    capacity: number;
    enrolledCount: number;
    status: CohortStatus;
    blackboardCourseId?: string;
    createdAt: string;
    updatedAt: string;
}

// =============================================================================
// REGISTRATION & ENROLLMENT TYPES
// =============================================================================

export type RegistrationStatus =
    | 'pending_payment'
    | 'payment_failed'
    | 'confirmed'
    | 'cancelled'
    | 'refunded';

export type EnrollmentStatus =
    | 'pending'
    | 'enrolled'
    | 'in_progress'
    | 'completed'
    | 'failed'
    | 'withdrawn';

export interface Registration {
    id: string;
    userId: string;
    cohortId: string;
    status: RegistrationStatus;
    paymentId?: string;
    enrollmentId?: string;
    registeredAt: string;
    confirmedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Enrollment {
    id: string;
    registrationId: string;
    userId: string;
    cohortId: string;
    status: EnrollmentStatus;
    blackboardEnrollmentId?: string;
    progress: number;
    completedAt?: string;
    certificateId?: string;
    createdAt: string;
    updatedAt: string;
}

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export type PaymentMethod = 'card' | 'tabby' | 'tamara';
export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';

export interface Payment {
    id: string;
    registrationId: string;
    userId: string;
    amount: number;
    currency: 'SAR';
    method: PaymentMethod;
    status: PaymentStatus;
    providerPaymentId?: string;
    providerTransactionId?: string;
    paidAt?: string;
    refundedAt?: string;
    refundAmount?: number;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface Invoice {
    id: string;
    paymentId: string;
    number: string;
    amount: number;
    currency: 'SAR';
    vatAmount: number;
    totalAmount: number;
    issuedAt: string;
    pdfUrl?: string;
    createdAt: string;
}

// =============================================================================
// CERTIFICATE TYPES
// =============================================================================

export type CertificateStatus = 'pending' | 'issued' | 'revoked';

export interface Certificate {
    id: string;
    enrollmentId: string;
    userId: string;
    programId: string;
    cohortId: string;
    number: string;
    issueDate: string;
    expiryDate?: string;
    status: CertificateStatus;
    verificationUrl: string;
    pdfUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// =============================================================================
// ORGANIZATION (B2B) TYPES
// =============================================================================

export interface Organization {
    id: string;
    nameAr: string;
    nameEn: string;
    crNumber?: string;
    vatNumber?: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
    data: T;
    message?: string;
    timestamp: string;
}

export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface ListQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}
