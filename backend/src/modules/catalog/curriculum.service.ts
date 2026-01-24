import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
    CreateModuleDto,
    UpdateModuleDto,
    CreateSessionDto,
    UpdateSessionDto,
} from './dto/module.dto';

@Injectable()
export class CurriculumService {
    constructor(private prisma: PrismaService) {}

    // =========================================================================
    // MODULES
    // =========================================================================

    async createModule(dto: CreateModuleDto) {
        return this.prisma.programModule.create({
            data: {
                programId: dto.programId,
                titleAr: dto.titleAr,
                titleEn: dto.titleEn,
                descriptionAr: dto.descriptionAr,
                descriptionEn: dto.descriptionEn,
                durationHours: dto.durationHours,
                sortOrder: dto.sortOrder ?? 0,
            },
            include: {
                sessions: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
    }

    async getModulesByProgram(programId: string) {
        return this.prisma.programModule.findMany({
            where: { programId },
            include: {
                sessions: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async getModule(id: string) {
        const module = await this.prisma.programModule.findUnique({
            where: { id },
            include: {
                sessions: {
                    orderBy: { sortOrder: 'asc' },
                },
                program: {
                    select: {
                        id: true,
                        titleAr: true,
                        titleEn: true,
                    },
                },
            },
        });

        if (!module) {
            throw new NotFoundException('Module not found');
        }

        return module;
    }

    async updateModule(id: string, dto: UpdateModuleDto) {
        const module = await this.prisma.programModule.findUnique({
            where: { id },
        });

        if (!module) {
            throw new NotFoundException('Module not found');
        }

        return this.prisma.programModule.update({
            where: { id },
            data: dto,
            include: {
                sessions: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
    }

    async deleteModule(id: string) {
        const module = await this.prisma.programModule.findUnique({
            where: { id },
        });

        if (!module) {
            throw new NotFoundException('Module not found');
        }

        await this.prisma.programModule.delete({
            where: { id },
        });

        return { message: 'Module deleted successfully' };
    }

    async reorderModules(programId: string, moduleIds: string[]) {
        const updates = moduleIds.map((id, index) =>
            this.prisma.programModule.update({
                where: { id },
                data: { sortOrder: index },
            })
        );

        await this.prisma.$transaction(updates);

        return this.getModulesByProgram(programId);
    }

    // =========================================================================
    // SESSIONS
    // =========================================================================

    async createSession(dto: CreateSessionDto) {
        return this.prisma.session.create({
            data: {
                moduleId: dto.moduleId,
                titleAr: dto.titleAr,
                titleEn: dto.titleEn,
                descriptionAr: dto.descriptionAr,
                descriptionEn: dto.descriptionEn,
                durationMinutes: dto.durationMinutes,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }

    async getSessionsByModule(moduleId: string) {
        return this.prisma.session.findMany({
            where: { moduleId },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async getSession(id: string) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: {
                module: {
                    select: {
                        id: true,
                        titleAr: true,
                        titleEn: true,
                        programId: true,
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return session;
    }

    async updateSession(id: string, dto: UpdateSessionDto) {
        const session = await this.prisma.session.findUnique({
            where: { id },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return this.prisma.session.update({
            where: { id },
            data: dto,
        });
    }

    async deleteSession(id: string) {
        const session = await this.prisma.session.findUnique({
            where: { id },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        await this.prisma.session.delete({
            where: { id },
        });

        return { message: 'Session deleted successfully' };
    }

    async reorderSessions(moduleId: string, sessionIds: string[]) {
        const updates = sessionIds.map((id, index) =>
            this.prisma.session.update({
                where: { id },
                data: { sortOrder: index },
            })
        );

        await this.prisma.$transaction(updates);

        return this.getSessionsByModule(moduleId);
    }
}
