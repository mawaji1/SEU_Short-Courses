import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactInquiryDto, ContactInquiryResponseDto } from './dto/contact.dto';

/**
 * Contact Controller
 * Public endpoint for contact form submissions (no auth required)
 */
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  /**
   * Submit a contact inquiry
   * POST /api/contact
   *
   * Rate limited to prevent spam (5 requests per minute per IP)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async submitInquiry(
    @Body() dto: CreateContactInquiryDto,
    @Req() request: Request,
  ): Promise<ContactInquiryResponseDto> {
    this.logger.log(`Contact form submission from ${dto.email}`);

    // Extract metadata for tracking
    const metadata = {
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
    };

    return this.contactService.submitInquiry(dto, metadata);
  }

  /**
   * Get client IP address, handling proxies
   */
  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips.trim();
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
