import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { PromoCodeService } from './promo-code.service';
import { WaitlistService } from './waitlist.service';
import { CohortService } from './cohort.service';
import { MessageService } from './messages.service';
import { PrismaService } from '../../common/prisma.service';
import { RegistrationCleanupService } from './registration-cleanup.service';
import { NotificationModule } from '../notification';

@Module({
  imports: [NotificationModule],
  controllers: [RegistrationController],
  providers: [
    RegistrationService,
    PromoCodeService,
    WaitlistService,
    CohortService,
    MessageService,
    PrismaService,
    RegistrationCleanupService,
  ],
  exports: [
    RegistrationService,
    PromoCodeService,
    WaitlistService,
    CohortService,
    MessageService,
  ],
})
export class RegistrationModule {}
