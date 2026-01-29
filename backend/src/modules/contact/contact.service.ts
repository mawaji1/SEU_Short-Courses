import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateContactInquiryDto, ContactInquiryResponseDto } from './dto/contact.dto';
import { InquirySubject } from '@prisma/client';

/**
 * Contact Service
 * Handles public contact form submissions
 * - Stores inquiries in database for tracking
 * - Sends email notification to RSI staff
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  // RSI contact email
  private readonly RSI_EMAIL = process.env.RSI_CONTACT_EMAIL || 'INFO.RSI@seu.edu.sa';

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Submit a contact inquiry
   * - Validates and stores the inquiry
   * - Sends notification email to RSI staff
   */
  async submitInquiry(
    dto: CreateContactInquiryDto,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<ContactInquiryResponseDto> {
    this.logger.log(`New contact inquiry from ${dto.email}`);

    // Store inquiry in database
    const inquiry = await this.prisma.contactInquiry.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });

    this.logger.log(`Contact inquiry created with ID: ${inquiry.id}`);

    // Send notification email to RSI staff (async, don't wait)
    this.sendNotificationEmail(inquiry).catch((error) => {
      this.logger.error(`Failed to send notification email: ${error.message}`);
    });

    return {
      id: inquiry.id,
      message: 'تم استلام رسالتك بنجاح. سنتواصل معك في أقرب وقت.',
      submittedAt: inquiry.createdAt,
    };
  }

  /**
   * Send notification email to RSI staff
   */
  private async sendNotificationEmail(inquiry: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: InquirySubject;
    message: string;
    createdAt: Date;
  }): Promise<void> {
    const subjectLabels: Record<InquirySubject, string> = {
      GENERAL: 'استفسار عام',
      REGISTRATION: 'استفسار عن التسجيل',
      PAYMENT: 'استفسار عن الدفع',
      CERTIFICATES: 'استفسار عن الشهادات',
      CORPORATE: 'تدريب مؤسسي / B2B',
      PARTNERSHIP: 'شراكات وتعاون',
      COMPLAINT: 'شكوى أو اقتراح',
    };

    const subjectLabel = subjectLabels[inquiry.subject] || inquiry.subject;

    try {
      await this.mailerService.sendMail({
        to: this.RSI_EMAIL,
        subject: `[تواصل معنا] ${subjectLabel} - ${inquiry.name}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a365d;">رسالة جديدة من نموذج التواصل</h2>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">رقم الاستفسار:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${inquiry.id}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">الاسم:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${inquiry.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">البريد الإلكتروني:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                  <a href="mailto:${inquiry.email}">${inquiry.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">رقم الجوال:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${inquiry.phone || 'غير محدد'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">الموضوع:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${subjectLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">التاريخ:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${inquiry.createdAt.toLocaleString('ar-SA')}</td>
              </tr>
            </table>

            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2d3748;">الرسالة:</h3>
              <p style="white-space: pre-wrap; color: #4a5568;">${inquiry.message}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

            <p style="color: #718096; font-size: 12px;">
              هذه الرسالة آلية من نظام التعليم التنفيذي - معهد البحوث والدراسات الاستشارية
            </p>
          </div>
        `,
      });

      this.logger.log(`Notification email sent for inquiry ${inquiry.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email for inquiry ${inquiry.id}:`, error);
      throw error;
    }
  }
}
