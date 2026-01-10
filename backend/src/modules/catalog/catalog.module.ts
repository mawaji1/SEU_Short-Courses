import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

/**
 * Catalog Module
 * 
 * Handles all catalog-related functionality:
 * - Programs (courses, workshops, bootcamps, certifications)
 * - Categories (program categorization)
 * - Instructors (course instructors)
 * 
 * Dependencies:
 * - PrismaService (from CommonModule - global)
 */
@Module({
    controllers: [CatalogController],
    providers: [CatalogService],
    exports: [CatalogService],
})
export class CatalogModule { }
