import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BlackboardApiClient } from './blackboard-api.client';
import { BlackboardProvisioningService } from './blackboard-provisioning.service';
import { BlackboardEnrollmentService } from './blackboard-enrollment.service';
import { BlackboardCompletionService } from './blackboard-completion.service';
import { BlackboardController } from './blackboard.controller';
import { PrismaService } from '../../common/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    NotificationModule,
  ],
  controllers: [BlackboardController],
  providers: [
    PrismaService,
    BlackboardApiClient,
    BlackboardProvisioningService,
    BlackboardEnrollmentService,
    BlackboardCompletionService,
  ],
  exports: [BlackboardProvisioningService, BlackboardEnrollmentService, BlackboardCompletionService],
})
export class BlackboardModule {}
