import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRegistrationDto {
    @IsString()
    @IsNotEmpty()
    cohortId: string;

    @IsString()
    @IsOptional()
    promoCode?: string;
}
