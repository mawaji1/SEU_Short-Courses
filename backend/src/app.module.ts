import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common';
import { CatalogModule } from './modules/catalog';
import { AuthModule } from './modules/auth';
import { RegistrationModule } from './modules/registration';
import { PaymentModule } from './modules/payment';
import { NotificationModule } from './modules/notification';
import { BlackboardModule } from './modules/blackboard';
import { CertificateModule } from './modules/certificate';
import { AuditModule } from './modules/audit';

/**
 * SEU Short Courses Platform — App Module
 *
 * Root application module.
 * Imports CommonModule (global - provides PrismaService)
 * and feature modules.
 */
@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    CatalogModule,
    AuthModule,
    RegistrationModule,
    PaymentModule,
    NotificationModule,
    BlackboardModule,
    CertificateModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
