/**
 * SEU Short Courses — Catalog Service
 * 
 * API service for catalog-related operations.
 */

import { apiClient, PaginatedResponse, API_ENDPOINTS } from '@/lib';
import { Program, Category, Instructor, ProgramQueryParams } from './types';

export const catalogService = {
    // ===========================================================================
    // PROGRAMS
    // ===========================================================================

    /**
     * Get paginated list of programs
     */
    async getPrograms(params?: ProgramQueryParams): Promise<PaginatedResponse<Program>> {
        return apiClient.get<PaginatedResponse<Program>>(
            API_ENDPOINTS.programs,
            params as Record<string, string | number | boolean | undefined>
        );
    },

    /**
     * Get featured programs
     */
    async getFeaturedPrograms(limit = 6): Promise<Program[]> {
        return apiClient.get<Program[]>(API_ENDPOINTS.programsFeatured, { limit });
    },

    /**
     * Get program by ID
     */
    async getProgramById(id: string): Promise<Program> {
        return apiClient.get<Program>(API_ENDPOINTS.programById(id));
    },

    /**
     * Get program by slug
     */
    async getProgramBySlug(slug: string): Promise<Program> {
        return apiClient.get<Program>(API_ENDPOINTS.programBySlug(slug));
    },

    // ===========================================================================
    // CATEGORIES
    // ===========================================================================

    /**
     * Get all categories
     */
    async getCategories(includeInactive = false): Promise<Category[]> {
        return apiClient.get<Category[]>(API_ENDPOINTS.categories, { includeInactive });
    },

    /**
     * Get category by slug
     */
    async getCategoryBySlug(slug: string): Promise<Category> {
        return apiClient.get<Category>(API_ENDPOINTS.categoryBySlug(slug));
    },

    // ===========================================================================
    // INSTRUCTORS
    // ===========================================================================

    /**
     * Get all instructors
     */
    async getInstructors(includeInactive = false): Promise<Instructor[]> {
        return apiClient.get<Instructor[]>(API_ENDPOINTS.instructors, { includeInactive });
    },
};

export default catalogService;
