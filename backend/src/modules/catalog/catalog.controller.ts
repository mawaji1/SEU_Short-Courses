import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CatalogService } from './catalog.service';
import {
    CreateCategoryDto,
    UpdateCategoryDto,
    CreateProgramDto,
    UpdateProgramDto,
    ProgramQueryDto,
    CreateInstructorDto,
    UpdateInstructorDto,
} from './dto';

/**
 * Catalog Controller
 * 
 * REST API endpoints for catalog management:
 * - GET /api/catalog/programs - List programs
 * - GET /api/catalog/programs/:id - Get program by ID
 * - GET /api/catalog/programs/slug/:slug - Get program by slug
 * - POST /api/catalog/programs - Create program (admin)
 * - PUT /api/catalog/programs/:id - Update program (admin)
 * - DELETE /api/catalog/programs/:id - Delete program (admin)
 * 
 * Similar patterns for categories and instructors.
 */
@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) { }

    // ===========================================================================
    // PROGRAMS - PUBLIC
    // ===========================================================================

    @Get('programs')
    async findAllPrograms(@Query() query: ProgramQueryDto) {
        return this.catalogService.findAllPrograms(query);
    }

    @Get('programs/featured')
    async findFeaturedPrograms(@Query('limit') limit?: number) {
        return this.catalogService.findFeaturedPrograms(limit || 6);
    }

    /**
     * Get all program interests (admin)
     * MUST be before programs/:id to avoid route conflict
     */
    @Get('programs/interests')
    async getAllProgramInterests() {
        return this.catalogService.getAllProgramInterests();
    }

    @Get('programs/slug/:slug')
    async findProgramBySlug(@Param('slug') slug: string) {
        return this.catalogService.findProgramBySlug(slug);
    }

    @Get('programs/:id')
    async findProgramById(@Param('id') id: string) {
        return this.catalogService.findProgramById(id);
    }

    // ===========================================================================
    // PROGRAMS - ADMIN
    // ===========================================================================

    @Post('programs')
    @HttpCode(HttpStatus.CREATED)
    async createProgram(@Body() data: CreateProgramDto) {
        return this.catalogService.createProgram(data);
    }

    @Put('programs/:id')
    async updateProgram(
        @Param('id') id: string,
        @Body() data: UpdateProgramDto,
    ) {
        return this.catalogService.updateProgram(id, data);
    }

    @Put('programs/:id/publish')
    async publishProgram(@Param('id') id: string) {
        return this.catalogService.publishProgram(id);
    }

    @Put('programs/:id/unpublish')
    async unpublishProgram(@Param('id') id: string) {
        return this.catalogService.unpublishProgram(id);
    }

    @Put('programs/:id/archive')
    async archiveProgram(@Param('id') id: string) {
        return this.catalogService.archiveProgram(id);
    }

    @Post('programs/:id/clone')
    @HttpCode(HttpStatus.CREATED)
    async cloneProgram(@Param('id') id: string) {
        return this.catalogService.cloneProgram(id);
    }

    /**
     * Register interest in a program (for "Notify Me" feature)
     * Requires authentication
     */
    @Post('programs/:id/interest')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async registerInterest(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        return this.catalogService.registerProgramInterest(id, req.user.id);
    }

    @Delete('programs/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteProgram(@Param('id') id: string) {
        await this.catalogService.deleteProgram(id);
    }

    /**
     * Sync availability status for all programs (admin utility)
     */
    @Post('programs/sync-availability')
    async syncAvailability() {
        return this.catalogService.syncAllProgramsAvailability();
    }

    // ===========================================================================
    // CATEGORIES - PUBLIC
    // ===========================================================================

    @Get('categories')
    async findAllCategories(@Query('includeInactive') includeInactive?: boolean) {
        return this.catalogService.findAllCategories(includeInactive || false);
    }

    @Get('categories/slug/:slug')
    async findCategoryBySlug(@Param('slug') slug: string) {
        return this.catalogService.findCategoryBySlug(slug);
    }

    @Get('categories/:id')
    async findCategoryById(@Param('id') id: string) {
        return this.catalogService.findCategoryById(id);
    }

    // ===========================================================================
    // CATEGORIES - ADMIN
    // ===========================================================================

    @Post('categories')
    @HttpCode(HttpStatus.CREATED)
    async createCategory(@Body() data: CreateCategoryDto) {
        return this.catalogService.createCategory(data);
    }

    @Put('categories/:id')
    async updateCategory(
        @Param('id') id: string,
        @Body() data: UpdateCategoryDto,
    ) {
        return this.catalogService.updateCategory(id, data);
    }

    @Delete('categories/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCategory(@Param('id') id: string) {
        await this.catalogService.deleteCategory(id);
    }

    // ===========================================================================
    // INSTRUCTORS - PUBLIC
    // ===========================================================================

    @Get('instructors')
    async findAllInstructors(@Query('includeInactive') includeInactive?: boolean) {
        return this.catalogService.findAllInstructors(includeInactive || false);
    }

    @Get('instructors/:id')
    async findInstructorById(@Param('id') id: string) {
        return this.catalogService.findInstructorById(id);
    }

    // ===========================================================================
    // INSTRUCTORS - ADMIN
    // ===========================================================================

    @Post('instructors')
    @HttpCode(HttpStatus.CREATED)
    async createInstructor(@Body() data: CreateInstructorDto) {
        return this.catalogService.createInstructor(data);
    }

    @Put('instructors/:id')
    async updateInstructor(
        @Param('id') id: string,
        @Body() data: UpdateInstructorDto,
    ) {
        return this.catalogService.updateInstructor(id, data);
    }

    @Delete('instructors/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteInstructor(@Param('id') id: string) {
        await this.catalogService.deleteInstructor(id);
    }
}
