/**
 * Registration Service
 * 
 * Frontend API client for registration operations
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CohortResponse {
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
    availableSeats: number;
    status: string;
    program?: {
        id: string;
        titleAr: string;
        titleEn: string;
        slug: string;
    };
}

export interface RegistrationResponse {
    id: string;
    userId: string;
    cohortId: string;
    status: string;
    registeredAt: string;
    confirmedAt: string | null;
    expiresAt?: string;
    cohort: {
        id: string;
        nameAr: string;
        nameEn: string;
        startDate: string;
        endDate: string;
        capacity: number;
        enrolledCount: number;
        program: {
            id: string;
            titleAr: string;
            titleEn: string;
            slug: string;
            price: number;
        };
    };
    payment?: {
        id: string;
        amount: number;
        status: string;
    };
}

export interface PromoCodeValidation {
    isValid: boolean;
    promoCode?: {
        id: string;
        code: string;
        type: 'PERCENTAGE' | 'FIXED_AMOUNT';
        value: number;
        maxDiscount: number | null;
    };
    discountAmount: number;
    finalPrice: number;
    error?: string;
}

export interface AvailabilityResponse {
    available: number;
    total: number;
    status: string;
    isWaitlistOpen: boolean;
}

/**
 * Get cohorts for a program
 */
export async function getProgramCohorts(programId: string): Promise<CohortResponse[]> {
    const response = await fetch(`${API_BASE}/api/programs/${programId}/cohorts`);
    if (!response.ok) {
        throw new Error('Failed to fetch cohorts');
    }
    return response.json();
}

/**
 * Check availability for a cohort
 */
export async function checkCohortAvailability(cohortId: string): Promise<AvailabilityResponse> {
    const response = await fetch(`${API_BASE}/api/cohorts/${cohortId}/availability`);
    if (!response.ok) {
        throw new Error('Failed to check availability');
    }
    return response.json();
}

/**
 * Initiate registration for a cohort
 */
export async function initiateRegistration(
    cohortId: string,
    token: string,
): Promise<RegistrationResponse> {
    const response = await fetch(`${API_BASE}/api/registrations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cohortId }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate registration');
    }
    return response.json();
}

/**
 * Get user's registrations
 */
export async function getUserRegistrations(token: string): Promise<RegistrationResponse[]> {
    const response = await fetch(`${API_BASE}/api/registrations`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch registrations');
    }
    return response.json();
}

/**
 * Validate a promo code
 */
export async function validatePromoCode(
    code: string,
    originalPrice: number,
    programId?: string,
): Promise<PromoCodeValidation> {
    const response = await fetch(`${API_BASE}/api/promo-codes/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, originalPrice, programId }),
    });

    if (!response.ok) {
        throw new Error('Failed to validate promo code');
    }
    return response.json();
}

/**
 * Cancel a registration
 */
export async function cancelRegistration(
    registrationId: string,
    token: string,
    reason?: string,
): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/registrations/${registrationId}/cancel`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel registration');
    }
    return response.json();
}
