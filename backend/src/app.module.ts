import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common';
import { CatalogModule } from './modules/catalog';
import { AuthModule } from './modules/auth';
import { BetterAuthModule } from './modules/better-auth';
import { RegistrationModule } from './modules/registration';
import { PaymentModule } from './modules/payment';
import { NotificationModule } from './modules/notification';
import { CertificateModule } from './modules/certificate';
import { AuditModule } from './modules/audit';
// Note: BlackboardModule was removed from scope (Decision D-I03, 2026-01-23)

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
    BetterAuthModule,
    RegistrationModule,
    PaymentModule,
    NotificationModule,
    CertificateModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
