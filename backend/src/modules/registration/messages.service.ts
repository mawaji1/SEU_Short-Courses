import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

/**
 * Message Service
 *
 * Handles instructor-to-learner messaging within cohorts
 */
@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all messages for a specific cohort
   * Used by learners to view instructor announcements
   */
  async getCohortMessages(userId: string, cohortId: string) {
    // Verify user is enrolled in this cohort
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        cohortId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Get all messages for this cohort
    const messages = await this.prisma.cohortMessage.findMany({
      where: { cohortId },
      include: {
        instructor: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            imageUrl: true,
          },
        },
        readReceipts: {
          where: { userId },
          select: {
            id: true,
            readAt: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    return messages.map((message) => ({
      id: message.id,
      subject: message.subject,
      message: message.message,
      sentAt: message.sentAt,
      instructor: message.instructor
        ? {
            id: message.instructor.id,
            nameAr: message.instructor.nameAr,
            nameEn: message.instructor.nameEn,
            imageUrl: message.instructor.imageUrl,
          }
        : null,
      isRead: message.readReceipts.length > 0,
      readAt: message.readReceipts[0]?.readAt || null,
    }));
  }

  /**
   * Get unread message count for a cohort
   */
  async getUnreadCount(userId: string, cohortId: string): Promise<number> {
    // Verify enrollment
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        cohortId,
      },
    });

    if (!enrollment) {
      return 0;
    }

    // Get all messages for this cohort
    const messages = await this.prisma.cohortMessage.findMany({
      where: { cohortId },
      select: { id: true },
    });

    const messageIds = messages.map((m) => m.id);

    // Count read receipts for this user
    const readCount = await this.prisma.messageReadReceipt.count({
      where: {
        userId,
        messageId: { in: messageIds },
      },
    });

    return messages.length - readCount;
  }

  /**
   * Mark a message as read
   */
  async markAsRead(userId: string, messageId: string) {
    // Verify the message exists and user has access
    const message = await this.prisma.cohortMessage.findUnique({
      where: { id: messageId },
      select: { cohortId: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify user is enrolled in the cohort
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        cohortId: message.cohortId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Access denied');
    }

    // Create read receipt (upsert to avoid duplicates)
    await this.prisma.messageReadReceipt.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      create: {
        messageId,
        userId,
      },
      update: {},
    });

    return { success: true };
  }

  /**
   * Send a message to all learners in a cohort (Instructor only)
   */
  async sendMessage(
    instructorId: string,
    cohortId: string,
    subject: string,
    message: string,
  ) {
    // Verify instructor is assigned to this cohort
    const cohort = await this.prisma.cohort.findFirst({
      where: {
        id: cohortId,
        instructorId,
      },
    });

    if (!cohort) {
      throw new NotFoundException(
        'Cohort not found or you are not assigned to it',
      );
    }

    // Create message
    const cohortMessage = await this.prisma.cohortMessage.create({
      data: {
        cohortId,
        instructorId,
        subject,
        message,
      },
      include: {
        instructor: {
          select: {
            nameAr: true,
            nameEn: true,
          },
        },
      },
    });

    return cohortMessage;
  }
}
