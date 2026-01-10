import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for initiating a new registration
 */
export class InitiateRegistrationDto {
    @IsUUID()
    @IsNotEmpty()
    cohortId: string;

    @IsOptional()
    @IsString()
    promoCode?: string;
}

/**
 * DTO for confirming a registration (after payment)
 */
export class ConfirmRegistrationDto {
    @IsUUID()
    @IsNotEmpty()
    registrationId: string;

    @IsUUID()
    @IsNotEmpty()
    paymentId: string;
}

/**
 * DTO for cancelling a registration
 */
export class CancelRegistrationDto {
    @IsUUID()
    @IsNotEmpty()
    registrationId: string;

    @IsOptional()
    @IsString()
    reason?: string;
}

/**
 * DTO for applying a promo code
 */
export class ApplyPromoCodeDto {
    @IsUUID()
    @IsNotEmpty()
    registrationId: string;

    @IsString()
    @IsNotEmpty()
    promoCode: string;
}

/**
 * Registration response DTO
 */
export interface RegistrationResponseDto {
    id: string;
    userId: string;
    cohortId: string;
    status: string;
    registeredAt: Date;
    confirmedAt: Date | null;
    cohort: {
        id: string;
        nameAr: string;
        nameEn: string;
        startDate: Date;
        endDate: Date;
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
    expiresAt?: Date; // For pending registrations with seat hold
}

/**
 * Waitlist position response
 */
export interface WaitlistPositionDto {
    registrationId: string;
    cohortId: string;
    position: number;
    estimatedAvailability: string;
}
