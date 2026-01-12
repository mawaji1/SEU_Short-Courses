import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CertificateService } from './certificate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('api/certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  /**
   * Get eligible enrollments for certificate generation
   * Admin/Operations only
   */
  @Get('eligible-enrollments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  async getEligibleEnrollments() {
    return this.certificateService.getEligibleEnrollments();
  }

  /**
   * Generate certificate for enrollment
   * Admin/Operations only
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @HttpCode(HttpStatus.CREATED)
  async generateCertificate(
    @Body() body: { enrollmentId: string; locale?: 'ar' | 'en' },
  ) {
    return this.certificateService.generateCertificate(body);
  }

  /**
   * Get user's certificates
   * Authenticated users only
   */
  @Get('my-certificates')
  @UseGuards(JwtAuthGuard)
  async getMyCertificates(@Request() req: any) {
    return this.certificateService.getUserCertificates(req.user.sub);
  }

  /**
   * Get certificate by ID
   * Authenticated users only
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCertificate(@Param('id') id: string) {
    return this.certificateService.getUserCertificates(id);
  }

  /**
   * Download certificate PDF
   * Authenticated users only
   */
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadCertificate(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    // Get certificate details
    const certificate = await this.certificateService.getUserCertificates(id);
    
    if (!certificate || certificate.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const cert = certificate[0];
    const filePath = join(process.cwd(), 'uploads', 'certificates', `${cert.number}.pdf`);

    // Stream PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cert.number}.pdf"`);

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  /**
   * Verify certificate (public endpoint)
   */
  @Get('verify/:verificationCode')
  @HttpCode(HttpStatus.OK)
  async verifyCertificate(@Param('verificationCode') verificationCode: string) {
    return this.certificateService.verifyCertificate(verificationCode);
  }

  /**
   * Re-issue certificate
   * Admin only
   */
  @Post('reissue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async reissueCertificate(
    @Body() body: { enrollmentId: string; locale?: 'ar' | 'en' },
  ) {
    return this.certificateService.reissueCertificate(body.enrollmentId, body.locale);
  }

  /**
   * Revoke certificate
   * Admin only
   */
  @Post('revoke/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async revokeCertificate(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.certificateService.revokeCertificate(id, body.reason);
  }
}
