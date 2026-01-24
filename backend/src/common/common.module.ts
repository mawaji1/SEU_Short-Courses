import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Common Module
 *
 * Provides shared services across all modules.
 * Global module - no need to import in other modules.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommonModule {}
