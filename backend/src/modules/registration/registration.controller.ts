import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PromoCodeService } from './promo-code.service';
import { WaitlistService } from './waitlist.service';
import { CohortService } from './cohort.service';
import { MessageService } from './messages.service';
import {
  InitiateRegistrationDto,
  ConfirmRegistrationDto,
  CancelRegistrationDto,
  CreateCohortDto,
  UpdateCohortDto,
  CreatePromoCodeDto,
  AssignInstructorDto,
} from './dto';
import { BetterAuthGuard } from '../better-auth/better-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Registration Controller
 *
 * REST API endpoints for B2C registration flow:
 * - Registration management
 * - Promo code validation
 * - Waitlist operations
 * - Cohort management
 */
@Controller()
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly promoCodeService: PromoCodeService,
    private readonly waitlistService: WaitlistService,
    private readonly cohortService: CohortService,
    private readonly messageService: MessageService,
  ) {}

  // =========================================================================
  // REGISTRATIONS
  // =========================================================================

  @Post('registrations')
  @UseGuards(BetterAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async initiateRegistration(
    @Request() req: any,
    @Body() dto: InitiateRegistrationDto,
  ) {
    return this.registrationService.initiateRegistration(req.user.id, dto);
  }

  @Get('registrations')
  @UseGuards(BetterAuthGuard)
  async getUserRegistrations(@Request() req: any) {
    return this.registrationService.getUserRegistrations(req.user.id);
  }

  @Get('registrations/:id')
  @UseGuards(BetterAuthGuard)
  async getRegistrationById(@Request() req: any, @Param('id') id: string) {
    return this.registrationService.getRegistrationById(req.user.id, id);
  }

  @Put('registrations/:id/confirm')
  @UseGuards(BetterAuthGuard)
  async confirmRegistration(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<ConfirmRegistrationDto>,
  ) {
    return this.registrationService.confirmRegistration(req.user.id, {
      registrationId: id,
      paymentId: dto.paymentId || '',
    });
  }

  @Put('registrations/:id/cancel')
  @UseGuards(BetterAuthGuard)
  async cancelRegistration(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CancelRegistrationDto>,
  ) {
    return this.registrationService.cancelRegistration(req.user.id, {
      registrationId: id,
      reason: dto.reason,
    });
  }

  // =========================================================================
  // COHORTS (Public)
  // =========================================================================

  @Get('cohorts')
  async findAllCohorts(
    @Query('programId') programId?: string,
    @Query('status') status?: string,
  ) {
    return this.cohortService.findAllCohorts(programId, status as any);
  }

  @Get('cohorts/:id')
  async findCohortById(@Param('id') id: string) {
    return this.cohortService.findCohortById(id);
  }

  @Get('cohorts/:id/availability')
  async checkAvailability(@Param('id') id: string) {
    return this.registrationService.checkAvailability(id);
  }

  @Get('programs/:programId/cohorts')
  async findProgramCohorts(@Param('programId') programId: string) {
    return this.cohortService.findUpcomingCohorts(programId);
  }

  // =========================================================================
  // COHORTS (Admin)
  // =========================================================================

  @Post('cohorts')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  @HttpCode(HttpStatus.CREATED)
  async createCohort(@Body() dto: CreateCohortDto) {
    return this.cohortService.createCohort(dto);
  }

  @Put('cohorts/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  async updateCohort(@Param('id') id: string, @Body() dto: UpdateCohortDto) {
    return this.cohortService.updateCohort(id, dto);
  }

  @Put('cohorts/:id/open')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  async openCohortRegistration(@Param('id') id: string) {
    return this.cohortService.openRegistration(id);
  }

  @Put('cohorts/:id/close')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  async closeCohortRegistration(@Param('id') id: string) {
    return this.cohortService.closeRegistration(id);
  }

  @Delete('cohorts/:id')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCohort(@Param('id') id: string) {
    await this.cohortService.deleteCohort(id);
  }

  @Put('cohorts/:id/instructor')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  async assignInstructor(
    @Param('id') id: string,
    @Body() dto: AssignInstructorDto,
  ) {
    return this.cohortService.assignInstructor(id, dto.instructorId);
  }

  @Delete('cohorts/:id/instructor')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS')
  async removeInstructor(@Param('id') id: string) {
    return this.cohortService.removeInstructor(id);
  }

  // =========================================================================
  // PROMO CODES
  // =========================================================================

  @Post('promo-codes/validate')
  async validatePromoCode(
    @Body() body: { code: string; originalPrice: number; programId?: string },
  ) {
    return this.promoCodeService.validatePromoCode(
      body.code,
      body.originalPrice,
      body.programId,
    );
  }

  @Get('promo-codes')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATIONS', 'MARKETING')
  async findAllPromoCodes(@Query('includeInactive') includeInactive?: boolean) {
    return this.promoCodeService.findAllPromoCodes(includeInactive || false);
  }

  @Post('promo-codes')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MARKETING')
  @HttpCode(HttpStatus.CREATED)
  async createPromoCode(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodeService.createPromoCode(dto);
  }

  @Put('promo-codes/:id/deactivate')
  @UseGuards(BetterAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MARKETING')
  async deactivatePromoCode(@Param('id') id: string) {
    return this.promoCodeService.deactivatePromoCode(id);
  }

  // =========================================================================
  // WAITLIST
  // =========================================================================

  @Post('waitlist')
  @UseGuards(BetterAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async joinWaitlist(@Request() req: any, @Body() body: { cohortId: string }) {
    return this.waitlistService.joinWaitlist(req.user.id, body.cohortId);
  }

  @Get('waitlist')
  @UseGuards(BetterAuthGuard)
  async getUserWaitlistEntries(@Request() req: any) {
    return this.waitlistService.getUserWaitlistEntries(req.user.id);
  }

  @Get('waitlist/cohort/:cohortId')
  @UseGuards(BetterAuthGuard)
  async getWaitlistPosition(
    @Request() req: any,
    @Param('cohortId') cohortId: string,
  ) {
    return this.waitlistService.getWaitlistPosition(req.user.id, cohortId);
  }

  @Delete('waitlist/cohort/:cohortId')
  @UseGuards(BetterAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveWaitlist(
    @Request() req: any,
    @Param('cohortId') cohortId: string,
  ) {
    await this.waitlistService.leaveWaitlist(req.user.id, cohortId);
  }

  @Get('waitlist/cohort/:cohortId/count')
  async getWaitlistCount(@Param('cohortId') cohortId: string) {
    const count = await this.waitlistService.getWaitlistCount(cohortId);
    return { count };
  }

  // =========================================================================
  // LEARNER EXPERIENCE - ENROLLMENTS
  // =========================================================================

  /**
   * Get learner's enrolled courses
   * Returns all enrollments with course and progress information
   */
  @Get('enrollments/my-courses')
  @UseGuards(BetterAuthGuard)
  async getMyEnrollments(@Request() req: any) {
    return this.registrationService.getMyEnrollments(req.user.id);
  }

  /**
   * Get detailed course information with curriculum
   * Includes modules, sessions, instructor, and certificate
   */
  @Get('enrollments/:id/details')
  @UseGuards(BetterAuthGuard)
  async getCourseDetail(@Request() req: any, @Param('id') id: string) {
    return this.registrationService.getCourseDetail(req.user.id, id);
  }

  /**
   * Get progress overview for an enrollment
   * Includes attendance, session statistics, and completion data
   */
  @Get('enrollments/:id/progress')
  @UseGuards(BetterAuthGuard)
  async getProgressOverview(@Request() req: any, @Param('id') id: string) {
    return this.registrationService.getProgressOverview(req.user.id, id);
  }

  /**
   * Get course materials for an enrollment
   * Returns all downloadable materials and links
   */
  @Get('enrollments/:id/materials')
  @UseGuards(BetterAuthGuard)
  async getCourseMaterials(@Request() req: any, @Param('id') id: string) {
    return this.registrationService.getCourseMaterials(req.user.id, id);
  }

  /**
   * Get attendance summary for an enrollment
   * Returns attendance records and overall statistics
   */
  @Get('enrollments/:id/attendance')
  @UseGuards(BetterAuthGuard)
  async getAttendanceSummary(@Request() req: any, @Param('id') id: string) {
    return this.registrationService.getAttendanceSummary(req.user.id, id);
  }

  // =========================================================================
  // MESSAGES (Learner - Instructor Communication)
  // =========================================================================

  /**
   * Get all messages for a cohort
   * Returns instructor announcements and messages
   */
  @Get('cohorts/:cohortId/messages')
  @UseGuards(BetterAuthGuard)
  async getCohortMessages(
    @Request() req: any,
    @Param('cohortId') cohortId: string,
  ) {
    return this.messageService.getCohortMessages(req.user.id, cohortId);
  }

  /**
   * Get unread message count for a cohort
   */
  @Get('cohorts/:cohortId/messages/unread-count')
  @UseGuards(BetterAuthGuard)
  async getUnreadCount(
    @Request() req: any,
    @Param('cohortId') cohortId: string,
  ) {
    const count = await this.messageService.getUnreadCount(
      req.user.id,
      cohortId,
    );
    return { count };
  }

  /**
   * Mark a message as read
   */
  @Put('messages/:messageId/read')
  @UseGuards(BetterAuthGuard)
  async markMessageAsRead(
    @Request() req: any,
    @Param('messageId') messageId: string,
  ) {
    return this.messageService.markAsRead(req.user.id, messageId);
  }
}
