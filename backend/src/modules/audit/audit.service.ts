import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Logging Service
 * 
 * Tracks all admin actions for security and compliance
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an admin action
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details ? JSON.stringify(entry.details) : null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });

      this.logger.log(
        `Audit: ${entry.action} on ${entry.resource}${entry.resourceId ? `/${entry.resourceId}` : ''} by user ${entry.userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    // Group by action
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActions: logs.length,
      actionBreakdown: actionCounts,
      recentActions: logs.slice(0, 10),
    };
  }
}
