import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRegistrationDto {
    @IsUUID()
    @IsNotEmpty()
    cohortId: string;

    @IsString()
    @IsOptional()
    promoCode?: string;
}
