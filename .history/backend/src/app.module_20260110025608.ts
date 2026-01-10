import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common';
import { CatalogModule } from './modules/catalog';
import { AuthModule } from './modules/auth';
import { RegistrationModule } from './modules/registration';
import { PaymentModule } from './modules/payment';

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
    CatalogModule,
    AuthModule,
    RegistrationModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


