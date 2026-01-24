const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface WaitlistEntry {
    id: string;
    userId: string;
    cohortId: string;
    position: number;
    status: 'WAITING' | 'NOTIFIED' | 'EXPIRED' | 'CONVERTED';
    notifiedAt: Date | null;
    expiresAt: Date | null;
    cohort?: {
        nameAr: string;
        nameEn: string;
        capacity: number;
        enrolledCount: number;
    };
}

/**
 * Join waitlist for a full cohort
 */
export async function joinWaitlist(cohortId: string): Promise<WaitlistEntry> {
    const response = await fetch(`${API_BASE}/api/waitlist`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cohortId }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في الانضمام لقائمة الانتظار');
    }

    return response.json();
}

/**
 * Get user's waitlist entries
 */
export async function getUserWaitlistEntries(): Promise<WaitlistEntry[]> {
    const response = await fetch(`${API_BASE}/api/waitlist`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('فشل في جلب قائمة الانتظار');
    }

    return response.json();
}

/**
 * Get waitlist position for a specific cohort
 */
export async function getWaitlistPosition(cohortId: string): Promise<WaitlistEntry | null> {
    const response = await fetch(`${API_BASE}/api/waitlist/cohort/${cohortId}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error('فشل في جلب موقعك في قائمة الانتظار');
    }

    return response.json();
}

/**
 * Leave waitlist for a cohort
 */
export async function leaveWaitlist(cohortId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/waitlist/cohort/${cohortId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('فشل في مغادرة قائمة الانتظار');
    }
}

/**
 * Get waitlist count for a cohort (public)
 */
export async function getWaitlistCount(cohortId: string): Promise<number> {
    const response = await fetch(`${API_BASE}/api/waitlist/cohort/${cohortId}/count`);

    if (!response.ok) {
        throw new Error('فشل في جلب عدد المنتظرين');
    }

    const data = await response.json();
    return data.count;
}
