import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { RegistrationStatus } from '@prisma/client';

/**
 * Service to handle cleanup of expired registrations
 */
@Injectable()
export class RegistrationCleanupService {
    private readonly logger = new Logger(RegistrationCleanupService.name);

    constructor(private prisma: PrismaService) {}

    /**
     * Run every 5 minutes to clean up expired pending registrations
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async cleanupExpiredRegistrations() {
        this.logger.log('Running expired registrations cleanup...');

        try {
            const now = new Date();

            // Find expired pending registrations
            const expiredRegistrations = await this.prisma.registration.findMany({
                where: {
                    status: RegistrationStatus.PENDING_PAYMENT,
                    expiresAt: {
                        lt: now,
                        not: null,
                    },
                },
                include: {
                    cohort: true,
                },
            });

            if (expiredRegistrations.length === 0) {
                this.logger.log('No expired registrations found');
                return;
            }

            this.logger.log(`Found ${expiredRegistrations.length} expired registrations`);

            // Cancel expired registrations
            const result = await this.prisma.registration.updateMany({
                where: {
                    status: RegistrationStatus.PENDING_PAYMENT,
                    expiresAt: {
                        lt: now,
                        not: null,
                    },
                },
                data: {
                    status: RegistrationStatus.CANCELLED,
                },
            });

            this.logger.log(`Cancelled ${result.count} expired registrations`);

            // TODO: Send email notifications to users about expired registrations
            // TODO: Release any associated payment holds

        } catch (error) {
            this.logger.error('Error cleaning up expired registrations:', error);
        }
    }

    /**
     * Manual cleanup method (can be called via admin API)
     */
    async manualCleanup() {
        this.logger.log('Manual cleanup triggered');
        return this.cleanupExpiredRegistrations();
    }
}
