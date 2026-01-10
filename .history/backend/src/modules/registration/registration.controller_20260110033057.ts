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
import { InitiateRegistrationDto, ConfirmRegistrationDto, CancelRegistrationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Registration Controller
 * 
 * REST API endpoints for B2C registration flow:
 * - Registration management
 * - Promo code validation
 * - Waitlist operations
 * - Cohort management
 */
@Controller('api')
export class RegistrationController {
    constructor(
        private readonly registrationService: RegistrationService,
        private readonly promoCodeService: PromoCodeService,
        private readonly waitlistService: WaitlistService,
        private readonly cohortService: CohortService,
    ) { }

    // =========================================================================
    // REGISTRATIONS
    // =========================================================================

    @Post('registrations')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async initiateRegistration(
        @Request() req: any,
        @Body() dto: InitiateRegistrationDto,
    ) {
        return this.registrationService.initiateRegistration(req.user.id, dto);
    }

    @Get('registrations')
    @UseGuards(JwtAuthGuard)
    async getUserRegistrations(@Request() req: any) {
        return this.registrationService.getUserRegistrations(req.user.id);
    }

    @Get('registrations/:id')
    @UseGuards(JwtAuthGuard)
    async getRegistrationById(
        @Request() req: any,
        @Param('id') id: string,
    ) {
        return this.registrationService.getRegistrationById(req.user.id, id);
    }

    @Put('registrations/:id/confirm')
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createCohort(@Body() dto: any) {
        return this.cohortService.createCohort(dto);
    }

    @Put('cohorts/:id')
    @UseGuards(JwtAuthGuard)
    async updateCohort(
        @Param('id') id: string,
        @Body() dto: any,
    ) {
        return this.cohortService.updateCohort(id, dto);
    }

    @Put('cohorts/:id/open')
    @UseGuards(JwtAuthGuard)
    async openCohortRegistration(@Param('id') id: string) {
        return this.cohortService.openRegistration(id);
    }

    @Put('cohorts/:id/close')
    @UseGuards(JwtAuthGuard)
    async closeCohortRegistration(@Param('id') id: string) {
        return this.cohortService.closeRegistration(id);
    }

    @Delete('cohorts/:id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCohort(@Param('id') id: string) {
        await this.cohortService.deleteCohort(id);
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
    @UseGuards(JwtAuthGuard)
    async findAllPromoCodes(@Query('includeInactive') includeInactive?: boolean) {
        return this.promoCodeService.findAllPromoCodes(includeInactive || false);
    }

    @Post('promo-codes')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createPromoCode(@Body() dto: any) {
        return this.promoCodeService.createPromoCode(dto);
    }

    @Put('promo-codes/:id/deactivate')
    @UseGuards(JwtAuthGuard)
    async deactivatePromoCode(@Param('id') id: string) {
        return this.promoCodeService.deactivatePromoCode(id);
    }

    // =========================================================================
    // WAITLIST
    // =========================================================================

    @Post('waitlist')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async joinWaitlist(
        @Request() req: any,
        @Body() body: { cohortId: string },
    ) {
        return this.waitlistService.joinWaitlist(req.user.id, body.cohortId);
    }

    @Get('waitlist')
    @UseGuards(JwtAuthGuard)
    async getUserWaitlistEntries(@Request() req: any) {
        return this.waitlistService.getUserWaitlistEntries(req.user.sub);
    }

    @Get('waitlist/cohort/:cohortId')
    @UseGuards(JwtAuthGuard)
    async getWaitlistPosition(
        @Request() req: any,
        @Param('cohortId') cohortId: string,
    ) {
        return this.waitlistService.getWaitlistPosition(req.user.sub, cohortId);
    }

    @Delete('waitlist/cohort/:cohortId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async leaveWaitlist(
        @Request() req: any,
        @Param('cohortId') cohortId: string,
    ) {
        await this.waitlistService.leaveWaitlist(req.user.sub, cohortId);
    }

    @Get('waitlist/cohort/:cohortId/count')
    async getWaitlistCount(@Param('cohortId') cohortId: string) {
        const count = await this.waitlistService.getWaitlistCount(cohortId);
        return { count };
    }
}
