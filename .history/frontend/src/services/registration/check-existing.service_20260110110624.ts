/**
 * Check if user has existing registration for a program
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ExistingRegistrationCheck {
    hasRegistration: boolean;
    registration?: {
        id: string;
        status: string;
        cohort: {
            nameAr: string;
            nameEn: string;
        };
    };
}

/**
 * Check if user already has a registration for this program
 */
export async function checkExistingProgramRegistration(
    programId: string,
    token: string,
): Promise<ExistingRegistrationCheck> {
    try {
        const response = await fetch(`${API_BASE}/api/registrations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return { hasRegistration: false };
        }

        const registrations = await response.json();
        
        // Find any active registration for this program
        const existingReg = registrations.find((reg: any) => 
            reg.cohort?.program?.id === programId &&
            (reg.status === 'CONFIRMED' || reg.status === 'PENDING_PAYMENT')
        );

        if (existingReg) {
            return {
                hasRegistration: true,
                registration: {
                    id: existingReg.id,
                    status: existingReg.status,
                    cohort: {
                        nameAr: existingReg.cohort.nameAr,
                        nameEn: existingReg.cohort.nameEn,
                    },
                },
            };
        }

        return { hasRegistration: false };
    } catch (error) {
        console.error('Error checking existing registration:', error);
        return { hasRegistration: false };
    }
}
