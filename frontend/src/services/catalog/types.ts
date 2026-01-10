/**
 * SEU Short Courses — Catalog Types (Frontend)
 */

export type ProgramStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ProgramType = 'COURSE' | 'WORKSHOP' | 'BOOTCAMP' | 'CERTIFICATION';
export type DeliveryMode = 'ONLINE' | 'IN_PERSON' | 'HYBRID';
export type CohortStatus = 'UPCOMING' | 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Category {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    parentId?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    parent?: Category;
    children?: Category[];
    _count?: {
        programs: number;
    };
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
    email?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        programs: number;
    };
}

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
    price: string | number;
    currency: string;
    status: ProgramStatus;
    categoryId: string;
    instructorId?: string;
    imageUrl?: string;
    prerequisitesAr?: string;
    prerequisitesEn?: string;
    learningOutcomesAr: string[];
    learningOutcomesEn: string[];
    targetAudienceAr?: string;
    targetAudienceEn?: string;
    blackboardCourseId?: string;
    isFeatured: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    category?: Category;
    instructor?: Instructor;
    cohorts?: Cohort[];
    _count?: {
        cohorts: number;
    };
}

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

export interface ProgramQueryParams {
    page?: number;
    limit?: number;
    categoryId?: string;
    status?: ProgramStatus;
    type?: ProgramType;
    search?: string;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
