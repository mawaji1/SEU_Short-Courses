import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BNPLService } from './bnpl.service';
import { TabbyService } from './providers/tabby/tabby.service';
import { TamaraService } from './providers/tamara/tamara.service';
import { PrismaService } from '../../common/prisma.service';
import { NotificationModule } from '../notification';
import { WebhookModule } from './webhooks/webhook.module';

@Module({
  imports: [NotificationModule, WebhookModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    BNPLService,
    TabbyService,
    TamaraService,
    PrismaService,
  ],
  exports: [PaymentService, BNPLService],
})
export class PaymentModule {}
