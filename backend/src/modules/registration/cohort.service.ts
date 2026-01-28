import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CohortStatus } from '@prisma/client';
import {
  CreateCohortDto,
  UpdateCohortDto,
} from './dto';

export interface CohortResponseDto {
  id: string;
  programId: string;
  nameAr: string;
  nameEn: string;
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date;
  registrationEndDate: Date;
  capacity: number;
  enrolledCount: number;
  availableSeats: number;
  status: CohortStatus;
  instructorId: string | null;
  // Note: blackboardCourseId removed - Blackboard integration was removed from scope (D-I03)
  program?: {
    id: string;
    titleAr: string;
    titleEn: string;
    slug: string;
  };
  instructor?: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
}

/**
 * Cohort Service
 *
 * Handles cohort management:
 * - CRUD operations
 * - Capacity tracking
 * - Status management
 */
@Injectable()
export class CohortService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new cohort
   */
  async createCohort(dto: CreateCohortDto): Promise<CohortResponseDto> {
    // Verify program exists
    const program = await this.prisma.program.findUnique({
      where: { id: dto.programId },
    });

    if (!program) {
      throw new NotFoundException('البرنامج غير موجود');
    }

    const cohort = await this.prisma.cohort.create({
      data: {
        programId: dto.programId,
        nameAr: dto.nameAr,
        nameEn: dto.nameEn,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        registrationStartDate: new Date(dto.registrationStartDate),
        registrationEndDate: new Date(dto.registrationEndDate),
        capacity: dto.capacity,
        status: CohortStatus.UPCOMING,
      },
      include: {
        program: true,
      },
    });

    // Update program availability status
    await this.updateProgramAvailability(dto.programId);

    return this.formatCohortResponse(cohort);
  }

  /**
   * Get all cohorts (optionally filtered by program)
   */
  async findAllCohorts(
    programId?: string,
    status?: CohortStatus,
  ): Promise<CohortResponseDto[]> {
    const where: any = {};
    if (programId) where.programId = programId;
    if (status) where.status = status;

    const cohorts = await this.prisma.cohort.findMany({
      where,
      include: {
        program: true,
        instructor: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return cohorts.map((c) => this.formatCohortResponse(c));
  }

  /**
   * Get upcoming cohorts for a program (public)
   * Includes FULL cohorts so users can see them (but can't register)
   */
  async findUpcomingCohorts(programId: string): Promise<CohortResponseDto[]> {
    const cohorts = await this.prisma.cohort.findMany({
      where: {
        programId,
        status: {
          in: [CohortStatus.UPCOMING, CohortStatus.OPEN, CohortStatus.FULL],
        },
        registrationEndDate: { gte: new Date() },
      },
      include: {
        program: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return cohorts.map((c) => this.formatCohortResponse(c));
  }

  /**
   * Get cohort by ID
   */
  async findCohortById(id: string): Promise<CohortResponseDto> {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        program: true,
        instructor: true,
      },
    });

    if (!cohort) {
      throw new NotFoundException('الموعد غير موجود');
    }

    return this.formatCohortResponse(cohort);
  }

  /**
   * Update cohort
   */
  async updateCohort(
    id: string,
    dto: UpdateCohortDto,
  ): Promise<CohortResponseDto> {
    const existing = await this.prisma.cohort.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('الموعد غير موجود');
    }

    const cohort = await this.prisma.cohort.update({
      where: { id },
      data: {
        nameAr: dto.nameAr,
        nameEn: dto.nameEn,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        registrationStartDate: dto.registrationStartDate
          ? new Date(dto.registrationStartDate)
          : undefined,
        registrationEndDate: dto.registrationEndDate
          ? new Date(dto.registrationEndDate)
          : undefined,
        capacity: dto.capacity,
        status: dto.status,
      },
      include: {
        program: true,
      },
    });

    // Update program availability status if status changed
    if (dto.status) {
      await this.updateProgramAvailability(cohort.programId);
    }

    return this.formatCohortResponse(cohort);
  }

  /**
   * Delete cohort (only if no enrollments)
   */
  async deleteCohort(id: string): Promise<void> {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        registrations: true,
      },
    });

    if (!cohort) {
      throw new NotFoundException('الموعد غير موجود');
    }

    if (cohort.registrations.length > 0) {
      throw new NotFoundException('لا يمكن حذف دورة بها تسجيلات');
    }

    const programId = cohort.programId;
    await this.prisma.cohort.delete({ where: { id } });

    // Update program availability status
    await this.updateProgramAvailability(programId);
  }

  /**
   * Open registration for a cohort
   */
  async openRegistration(id: string): Promise<CohortResponseDto> {
    return this.updateCohort(id, { status: CohortStatus.OPEN });
  }

  /**
   * Close registration for a cohort
   */
  async closeRegistration(id: string): Promise<CohortResponseDto> {
    const cohort = await this.prisma.cohort.findUnique({ where: { id } });
    if (!cohort) {
      throw new NotFoundException('الموعد غير موجود');
    }

    const newStatus =
      cohort.enrolledCount >= cohort.capacity
        ? CohortStatus.FULL
        : CohortStatus.UPCOMING;

    return this.updateCohort(id, { status: newStatus });
  }

  /**
   * Assign instructor to cohort
   */
  async assignInstructor(
    cohortId: string,
    instructorId: string,
  ): Promise<CohortResponseDto> {
    const instructor = await this.prisma.instructor.findUnique({
      where: { id: instructorId },
    });

    if (!instructor) {
      throw new NotFoundException('المدرب غير موجود');
    }

    const cohort = await this.prisma.cohort.update({
      where: { id: cohortId },
      data: { instructorId },
      include: {
        program: true,
        instructor: true,
      },
    });

    return this.formatCohortResponse(cohort);
  }

  /**
   * Remove instructor from cohort
   */
  async removeInstructor(cohortId: string): Promise<CohortResponseDto> {
    const cohort = await this.prisma.cohort.update({
      where: { id: cohortId },
      data: { instructorId: null },
      include: {
        program: true,
      },
    });

    return this.formatCohortResponse(cohort);
  }

  /**
   * Format cohort response
   */
  private formatCohortResponse(cohort: any): CohortResponseDto {
    return {
      id: cohort.id,
      programId: cohort.programId,
      instructorId: cohort.instructorId,
      nameAr: cohort.nameAr,
      nameEn: cohort.nameEn,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      registrationStartDate: cohort.registrationStartDate,
      registrationEndDate: cohort.registrationEndDate,
      capacity: cohort.capacity,
      enrolledCount: cohort.enrolledCount,
      availableSeats: Math.max(0, cohort.capacity - cohort.enrolledCount),
      status: cohort.status,
      program: cohort.program
        ? {
            id: cohort.program.id,
            titleAr: cohort.program.titleAr,
            titleEn: cohort.program.titleEn,
            slug: cohort.program.slug,
          }
        : undefined,
      instructor: cohort.instructor
        ? {
            id: cohort.instructor.id,
            nameAr: cohort.instructor.nameAr,
            nameEn: cohort.instructor.nameEn,
          }
        : undefined,
    };
  }

  /**
   * Update program availability status based on cohorts
   * Called after cohort create/update/delete
   */
  private async updateProgramAvailability(programId: string): Promise<void> {
    const cohorts = await this.prisma.cohort.findMany({
      where: { programId },
      select: { status: true },
    });

    let availabilityStatus:
      | 'AVAILABLE'
      | 'UPCOMING'
      | 'SOLD_OUT'
      | 'COMING_SOON';

    if (cohorts.length === 0) {
      availabilityStatus = 'COMING_SOON';
    } else {
      const hasOpen = cohorts.some((c) => c.status === 'OPEN');
      const hasUpcoming = cohorts.some((c) => c.status === 'UPCOMING');
      const allFullOrDone = cohorts.every(
        (c) =>
          c.status === 'FULL' ||
          c.status === 'COMPLETED' ||
          c.status === 'CANCELLED',
      );
      const hasFull = cohorts.some((c) => c.status === 'FULL');

      if (hasOpen) {
        availabilityStatus = 'AVAILABLE';
      } else if (hasUpcoming) {
        availabilityStatus = 'UPCOMING';
      } else if (hasFull && allFullOrDone) {
        availabilityStatus = 'SOLD_OUT';
      } else {
        availabilityStatus = 'COMING_SOON';
      }
    }

    await this.prisma.program.update({
      where: { id: programId },
      data: { availabilityStatus },
    });
  }
}
