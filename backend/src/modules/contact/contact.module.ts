import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { PrismaService } from '../../common/prisma.service';
import { NotificationModule } from '../notification';

/**
 * Contact Module
 * Handles public contact form submissions
 */
@Module({
  imports: [NotificationModule], // For MailerService access
  controllers: [ContactController],
  providers: [ContactService, PrismaService],
  exports: [ContactService],
})
export class ContactModule {}
