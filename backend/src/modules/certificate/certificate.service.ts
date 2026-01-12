import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CertificateStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

export interface GenerateCertificateDto {
  enrollmentId: string;
  locale?: 'ar' | 'en';
}

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);
  private readonly certificatesPath = join(process.cwd(), 'uploads', 'certificates');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get eligible enrollments for certificate generation
   */
  async getEligibleEnrollments(): Promise<any[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        status: 'COMPLETED',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cohort: {
          include: {
            program: {
              select: {
                titleAr: true,
              },
            },
          },
        },
        certificate: {
          select: {
            id: true,
            number: true,
            issuedAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      user: enrollment.user,
      cohort: {
        nameAr: enrollment.cohort.nameAr,
        program: {
          titleAr: enrollment.cohort.program.titleAr,
        },
      },
      status: enrollment.status,
      completedAt: enrollment.completedAt,
      certificateEligible: enrollment.status === 'COMPLETED',
      certificate: enrollment.certificate,
    }));
  }

  /**
   * Generate certificate for completed enrollment
   */
  async generateCertificate(dto: GenerateCertificateDto): Promise<any> {
    const { enrollmentId, locale = 'ar' } = dto;

    // Get enrollment with user and program details
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        cohort: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Check if already has certificate
    const existingCertificate = await this.prisma.certificate.findUnique({
      where: { enrollmentId },
    });

    if (existingCertificate && existingCertificate.status !== CertificateStatus.REVOKED) {
      return existingCertificate;
    }

    // Generate unique certificate number and verification code
    const certificateNumber = this.generateCertificateNumber();
    const verificationCode = this.generateVerificationCode();

    // Create certificate record
    const certificate = await this.prisma.certificate.create({
      data: {
        enrollmentId,
        userId: enrollment.userId,
        cohortId: enrollment.cohortId,
        number: certificateNumber,
        verificationCode,
        status: CertificateStatus.ISSUED,
        issuedAt: new Date(),
      },
    });

    // Generate PDF
    const pdfPath = await this.generatePDF(certificate, enrollment, locale);

    // Update certificate with PDF URL
    const updatedCertificate = await this.prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        pdfUrl: pdfPath,
      },
      include: {
        user: true,
        cohort: {
          include: {
            program: true,
          },
        },
      },
    });

    this.logger.log(`Certificate generated: ${certificateNumber} for user: ${enrollment.user.email}`);

    return updatedCertificate;
  }

  /**
   * Generate PDF certificate
   */
  private async generatePDF(certificate: any, enrollment: any, locale: 'ar' | 'en'): Promise<string> {
    const fileName = `${certificate.number}.pdf`;
    const filePath = join(this.certificatesPath, fileName);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Pipe to file
    doc.pipe(createWriteStream(filePath));

    // Generate QR code for verification
    const verificationUrl = `${process.env.APP_URL}/verify-certificate/${certificate.verificationCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    if (locale === 'ar') {
      await this.generateArabicCertificate(doc, certificate, enrollment, qrCodeDataUrl);
    } else {
      await this.generateEnglishCertificate(doc, certificate, enrollment, qrCodeDataUrl);
    }

    doc.end();

    return `/certificates/${fileName}`;
  }

  /**
   * Generate Arabic certificate template
   */
  private async generateArabicCertificate(
    doc: PDFKit.PDFDocument,
    certificate: any,
    enrollment: any,
    qrCodeDataUrl: string,
  ): Promise<void> {
    const userName = `${enrollment.user.firstName} ${enrollment.user.lastName}`;
    const programName = enrollment.cohort.program.titleAr;
    const issueDate = new Date(certificate.issuedAt).toLocaleDateString('ar-SA');

    // Border
    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(3)
      .stroke('#1e3a8a');

    // Inner border
    doc
      .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .lineWidth(1)
      .stroke('#3b82f6');

    // Header - SEU Logo area
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text('جامعة الأمير سلطان', 0, 80, { align: 'center' });

    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Prince Sultan University', 0, 110, { align: 'center' });

    // Certificate title
    doc
      .fontSize(36)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text('شهادة إتمام', 0, 160, { align: 'center' });

    doc
      .fontSize(18)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Certificate of Completion', 0, 200, { align: 'center' });

    // Decorative line
    doc
      .moveTo(200, 230)
      .lineTo(doc.page.width - 200, 230)
      .lineWidth(2)
      .stroke('#3b82f6');

    // Certificate text
    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#334155')
      .text('تشهد جامعة الأمير سلطان بأن', 0, 260, { align: 'center' });

    // User name
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text(userName, 0, 300, { align: 'center' });

    // Program completion text
    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#334155')
      .text('قد أتم بنجاح البرنامج التدريبي', 0, 350, { align: 'center' });

    // Program name
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text(programName, 0, 390, { align: 'center' });

    // Issue date
    doc
      .fontSize(14)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`تاريخ الإصدار: ${issueDate}`, 0, 450, { align: 'center' });

    // Certificate number
    doc
      .fontSize(12)
      .fillColor('#94a3b8')
      .text(`رقم الشهادة: ${certificate.number}`, 0, 475, { align: 'center' });

    // QR Code
    doc.image(qrCodeDataUrl, doc.page.width - 150, doc.page.height - 150, {
      width: 100,
      height: 100,
    });

    // Verification text
    doc
      .fontSize(10)
      .fillColor('#94a3b8')
      .text('امسح للتحقق', doc.page.width - 150, doc.page.height - 40, {
        width: 100,
        align: 'center',
      });

    // Signature area
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#334155')
      .text('_________________', 150, doc.page.height - 100);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('مدير البرامج التدريبية', 150, doc.page.height - 75);
  }

  /**
   * Generate English certificate template
   */
  private async generateEnglishCertificate(
    doc: PDFKit.PDFDocument,
    certificate: any,
    enrollment: any,
    qrCodeDataUrl: string,
  ): Promise<void> {
    const userName = `${enrollment.user.firstName} ${enrollment.user.lastName}`;
    const programName = enrollment.cohort.program.titleEn || enrollment.cohort.program.titleAr;
    const issueDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Border
    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(3)
      .stroke('#1e3a8a');

    // Inner border
    doc
      .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .lineWidth(1)
      .stroke('#3b82f6');

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text('Prince Sultan University', 0, 80, { align: 'center' });

    // Certificate title
    doc
      .fontSize(36)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text('Certificate of Completion', 0, 150, { align: 'center' });

    // Decorative line
    doc
      .moveTo(200, 200)
      .lineTo(doc.page.width - 200, 200)
      .lineWidth(2)
      .stroke('#3b82f6');

    // Certificate text
    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#334155')
      .text('This is to certify that', 0, 240, { align: 'center' });

    // User name
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text(userName, 0, 280, { align: 'center' });

    // Program completion text
    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#334155')
      .text('has successfully completed the training program', 0, 330, { align: 'center' });

    // Program name
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text(programName, 0, 370, { align: 'center' });

    // Issue date
    doc
      .fontSize(14)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Issued on: ${issueDate}`, 0, 430, { align: 'center' });

    // Certificate number
    doc
      .fontSize(12)
      .fillColor('#94a3b8')
      .text(`Certificate No: ${certificate.number}`, 0, 455, { align: 'center' });

    // QR Code
    doc.image(qrCodeDataUrl, doc.page.width - 150, doc.page.height - 150, {
      width: 100,
      height: 100,
    });

    // Verification text
    doc
      .fontSize(10)
      .fillColor('#94a3b8')
      .text('Scan to Verify', doc.page.width - 150, doc.page.height - 40, {
        width: 100,
        align: 'center',
      });

    // Signature area
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#334155')
      .text('_________________', 150, doc.page.height - 100);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Director of Training Programs', 150, doc.page.height - 75);
  }

  /**
   * Verify certificate by verification code
   */
  async verifyCertificate(verificationCode: string): Promise<any> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { verificationCode },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cohort: {
          include: {
            program: {
              select: {
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return {
      valid: certificate.status === CertificateStatus.ISSUED,
      certificate: {
        number: certificate.number,
        userName: `${certificate.user.firstName} ${certificate.user.lastName}`,
        programName: certificate.cohort.program.titleAr,
        issuedAt: certificate.issuedAt,
        status: certificate.status,
      },
    };
  }

  /**
   * Get user certificates
   */
  async getUserCertificates(userId: string): Promise<any[]> {
    return this.prisma.certificate.findMany({
      where: {
        userId,
        status: CertificateStatus.ISSUED,
      },
      include: {
        cohort: {
          include: {
            program: true,
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });
  }

  /**
   * Revoke certificate
   */
  async revokeCertificate(certificateId: string, reason: string): Promise<any> {
    return this.prisma.certificate.update({
      where: { id: certificateId },
      data: {
        status: CertificateStatus.REVOKED,
        revokedAt: new Date(),
        revocationReason: reason,
      },
    });
  }

  /**
   * Re-issue certificate
   */
  async reissueCertificate(enrollmentId: string, locale: 'ar' | 'en' = 'ar'): Promise<any> {
    // Revoke existing certificate
    const existing = await this.prisma.certificate.findUnique({
      where: { enrollmentId },
    });

    if (existing) {
      await this.revokeCertificate(existing.id, 'Re-issued');
    }

    // Generate new certificate
    return this.generateCertificate({ enrollmentId, locale });
  }

  /**
   * Generate unique certificate number
   */
  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const random = randomBytes(4).toString('hex').toUpperCase();
    return `SEU-${year}-${random}`;
  }

  /**
   * Generate unique verification code
   */
  private generateVerificationCode(): string {
    return randomBytes(16).toString('hex');
  }
}
