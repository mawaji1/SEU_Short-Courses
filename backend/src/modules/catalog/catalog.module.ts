import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';

/**
 * Catalog Module
 *
 * Handles all catalog-related functionality:
 * - Programs (courses, workshops, bootcamps, certifications)
 * - Categories (program categorization)
 * - Instructors (course instructors)
 * - Curriculum (program modules and sessions)
 *
 * Dependencies:
 * - PrismaService (from CommonModule - global)
 */
@Module({
  controllers: [CatalogController, CurriculumController],
  providers: [CatalogService, CurriculumService],
  exports: [CatalogService, CurriculumService],
})
export class CatalogModule {}
