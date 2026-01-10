import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { PromoCodeService } from './promo-code.service';
import { WaitlistService } from './waitlist.service';
import { CohortService } from './cohort.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
    controllers: [RegistrationController],
    providers: [
        RegistrationService,
        PromoCodeService,
        WaitlistService,
        CohortService,
        PrismaService,
    ],
    exports: [
        RegistrationService,
        PromoCodeService,
        WaitlistService,
        CohortService,
    ],
})
export class RegistrationModule { }
