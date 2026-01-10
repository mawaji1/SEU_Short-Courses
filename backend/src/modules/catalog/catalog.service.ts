import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Prisma } from '@prisma/client';
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
 * Catalog Service
 * 
 * Handles all catalog-related business logic:
 * - Programs (courses, workshops, etc.)
 * - Categories
 * - Instructors
 */
@Injectable()
export class CatalogService {
    constructor(private prisma: PrismaService) { }

    // ===========================================================================
    // CATEGORIES
    // ===========================================================================

    async createCategory(data: CreateCategoryDto) {
        return this.prisma.category.create({
            data,
            include: {
                parent: true,
                children: true,
            },
        });
    }

    async findAllCategories(includeInactive = false) {
        return this.prisma.category.findMany({
            where: includeInactive ? {} : { isActive: true },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { programs: true },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async findCategoryById(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                programs: {
                    where: { status: 'PUBLISHED' },
                    take: 10,
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async findCategoryBySlug(slug: string) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: true,
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with slug ${slug} not found`);
        }

        return category;
    }

    async updateCategory(id: string, data: UpdateCategoryDto) {
        await this.findCategoryById(id); // Ensure exists
        return this.prisma.category.update({
            where: { id },
            data,
            include: {
                parent: true,
                children: true,
            },
        });
    }

    async deleteCategory(id: string) {
        await this.findCategoryById(id); // Ensure exists
        return this.prisma.category.delete({ where: { id } });
    }

    // ===========================================================================
    // PROGRAMS
    // ===========================================================================

    async createProgram(data: CreateProgramDto) {
        return this.prisma.program.create({
            data: {
                ...data,
                price: new Prisma.Decimal(data.price),
            },
            include: {
                category: true,
                instructor: true,
            },
        });
    }

    async findAllPrograms(query: ProgramQueryDto) {
        const {
            page = 1,
            limit = 10,
            categoryId,
            status,
            type,
            search,
            isFeatured,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.ProgramWhereInput = {};

        if (categoryId) where.categoryId = categoryId;
        if (status) where.status = status;
        if (type) where.type = type;
        if (isFeatured !== undefined) where.isFeatured = isFeatured;

        if (search) {
            where.OR = [
                { titleAr: { contains: search, mode: 'insensitive' } },
                { titleEn: { contains: search, mode: 'insensitive' } },
                { shortDescriptionAr: { contains: search, mode: 'insensitive' } },
                { shortDescriptionEn: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Execute query with pagination
        const [data, total] = await Promise.all([
            this.prisma.program.findMany({
                where,
                include: {
                    category: true,
                    instructor: true,
                    _count: {
                        select: { cohorts: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.program.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findPublishedPrograms(query: ProgramQueryDto) {
        return this.findAllPrograms({
            ...query,
            status: 'PUBLISHED' as any,
        });
    }

    async findFeaturedPrograms(limit = 6) {
        return this.prisma.program.findMany({
            where: {
                status: 'PUBLISHED',
                isFeatured: true,
            },
            include: {
                category: true,
                instructor: true,
            },
            take: limit,
            orderBy: { sortOrder: 'asc' },
        });
    }

    async findProgramById(id: string) {
        const program = await this.prisma.program.findUnique({
            where: { id },
            include: {
                category: true,
                instructor: true,
                cohorts: {
                    where: {
                        status: { in: ['UPCOMING', 'OPEN'] },
                    },
                    orderBy: { startDate: 'asc' },
                },
            },
        });

        if (!program) {
            throw new NotFoundException(`Program with ID ${id} not found`);
        }

        return program;
    }

    async findProgramBySlug(slug: string) {
        const program = await this.prisma.program.findUnique({
            where: { slug },
            include: {
                category: true,
                instructor: true,
                cohorts: {
                    where: {
                        status: { in: ['UPCOMING', 'OPEN'] },
                    },
                    orderBy: { startDate: 'asc' },
                },
            },
        });

        if (!program) {
            throw new NotFoundException(`Program with slug ${slug} not found`);
        }

        return program;
    }

    async updateProgram(id: string, data: UpdateProgramDto) {
        await this.findProgramById(id); // Ensure exists

        const updateData: any = { ...data };
        if (data.price !== undefined) {
            updateData.price = new Prisma.Decimal(data.price);
        }

        return this.prisma.program.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
                instructor: true,
            },
        });
    }

    async publishProgram(id: string) {
        return this.updateProgram(id, { status: 'PUBLISHED' as any });
    }

    async unpublishProgram(id: string) {
        return this.updateProgram(id, { status: 'DRAFT' as any });
    }

    async archiveProgram(id: string) {
        return this.updateProgram(id, { status: 'ARCHIVED' as any });
    }

    async deleteProgram(id: string) {
        await this.findProgramById(id); // Ensure exists
        return this.prisma.program.delete({ where: { id } });
    }

    // ===========================================================================
    // INSTRUCTORS
    // ===========================================================================

    async createInstructor(data: CreateInstructorDto) {
        return this.prisma.instructor.create({ data });
    }

    async findAllInstructors(includeInactive = false) {
        return this.prisma.instructor.findMany({
            where: includeInactive ? {} : { isActive: true },
            include: {
                _count: {
                    select: { programs: true },
                },
            },
            orderBy: { nameEn: 'asc' },
        });
    }

    async findInstructorById(id: string) {
        const instructor = await this.prisma.instructor.findUnique({
            where: { id },
            include: {
                programs: {
                    where: { status: 'PUBLISHED' },
                },
            },
        });

        if (!instructor) {
            throw new NotFoundException(`Instructor with ID ${id} not found`);
        }

        return instructor;
    }

    async updateInstructor(id: string, data: UpdateInstructorDto) {
        await this.findInstructorById(id); // Ensure exists
        return this.prisma.instructor.update({
            where: { id },
            data,
        });
    }

    async deleteInstructor(id: string) {
        await this.findInstructorById(id); // Ensure exists
        return this.prisma.instructor.delete({ where: { id } });
    }
}
