import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlackboardApiClient } from './blackboard-api.client';
import { NotificationService } from '../notification/notification.service';
import { User, BlackboardProvisionStatus } from '@prisma/client';

export interface ProvisioningResult {
  success: boolean;
  blackboardUserId?: string;
  error?: string;
  action: 'created' | 'matched' | 'failed';
}

@Injectable()
export class BlackboardProvisioningService {
  private readonly logger = new Logger(BlackboardProvisioningService.name);
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 2000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly blackboardClient: BlackboardApiClient,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Provision user to Blackboard with retry logic
   */
  async provisionUser(userId: string): Promise<ProvisioningResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Check if already provisioned
    if (user.blackboardUserId && user.blackboardProvisionStatus === 'PROVISIONED') {
      this.logger.log(`User already provisioned: ${user.email}`);
      return {
        success: true,
        blackboardUserId: user.blackboardUserId,
        action: 'matched',
      };
    }

    // Update status to PENDING
    await this.updateProvisionStatus(userId, 'PENDING');

    // Attempt provisioning with retry
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.attemptProvisioning(user);
        
        // Update user record with Blackboard ID
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            blackboardUserId: result.blackboardUserId,
            blackboardProvisionStatus: 'PROVISIONED',
            blackboardProvisionedAt: new Date(),
          },
        });

        this.logger.log(`Successfully provisioned user: ${user.email} (attempt ${attempt})`);
        return result;
      } catch (error) {
        this.logger.error(
          `Provisioning attempt ${attempt}/${this.maxRetries} failed for user: ${user.email}`,
          error,
        );

        if (attempt === this.maxRetries) {
          // Final attempt failed
          await this.handleProvisioningFailure(user, error);
          return {
            success: false,
            error: error.message,
            action: 'failed',
          };
        }

        // Wait before retry with exponential backoff
        await this.sleep(this.retryDelayMs * Math.pow(2, attempt - 1));
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
      action: 'failed',
    };
  }

  /**
   * Attempt to provision user (match or create)
   */
  private async attemptProvisioning(user: User): Promise<ProvisioningResult> {
    // Strategy 1: Try to match by email
    let existingUser = await this.blackboardClient.findUserByEmail(user.email);
    
    if (existingUser) {
      this.logger.log(`Matched existing Blackboard user by email: ${user.email}`);
      return {
        success: true,
        blackboardUserId: existingUser.id,
        action: 'matched',
      };
    }

    // Strategy 2: Try to match by national ID (if available)
    if (user.nationalId) {
      existingUser = await this.blackboardClient.findUserByExternalId(user.nationalId);
      
      if (existingUser) {
        this.logger.log(`Matched existing Blackboard user by nationalId: ${user.nationalId}`);
        return {
          success: true,
          blackboardUserId: existingUser.id,
          action: 'matched',
        };
      }
    }

    // Strategy 3: Create new user
    const newUser = await this.blackboardClient.createUser({
      userName: user.email.split('@')[0], // Use email prefix as username
      externalId: user.nationalId || user.id, // Use national ID or platform ID
      name: {
        given: user.firstName,
        family: user.lastName,
      },
      contact: {
        email: user.email,
      },
    });

    this.logger.log(`Created new Blackboard user: ${user.email}`);
    return {
      success: true,
      blackboardUserId: newUser.id,
      action: 'created',
    };
  }

  /**
   * Handle provisioning failure
   */
  private async handleProvisioningFailure(user: User, error: any): Promise<void> {
    // Update status to FAILED
    await this.updateProvisionStatus(user.id, 'FAILED', error.message);

    // Send alert to admin
    await this.notificationService.sendAdminAlert({
      subject: 'Blackboard User Provisioning Failed',
      message: `Failed to provision user to Blackboard after ${this.maxRetries} attempts.\n\nUser: ${user.email}\nUser ID: ${user.id}\nError: ${error.message}`,
      priority: 'HIGH',
      metadata: {
        userId: user.id,
        email: user.email,
        error: error.message,
      },
    });

    this.logger.error(`Provisioning failed for user: ${user.email}`, error);
  }

  /**
   * Update provisioning status
   */
  private async updateProvisionStatus(
    userId: string,
    status: BlackboardProvisionStatus,
    errorMessage?: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        blackboardProvisionStatus: status,
        blackboardProvisionError: errorMessage,
      },
    });
  }

  /**
   * Bulk provision users
   */
  async bulkProvisionUsers(userIds: string[]): Promise<{
    successful: number;
    failed: number;
    results: ProvisioningResult[];
  }> {
    const results: ProvisioningResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const userId of userIds) {
      const result = await this.provisionUser(userId);
      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Small delay between requests to avoid rate limiting
      await this.sleep(500);
    }

    this.logger.log(`Bulk provisioning complete: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, results };
  }

  /**
   * Get provisioning status for user
   */
  async getProvisioningStatus(userId: string): Promise<{
    status: BlackboardProvisionStatus;
    blackboardUserId: string | null;
    provisionedAt: Date | null;
    error: string | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        blackboardProvisionStatus: true,
        blackboardUserId: true,
        blackboardProvisionedAt: true,
        blackboardProvisionError: true,
      },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    return {
      status: user.blackboardProvisionStatus,
      blackboardUserId: user.blackboardUserId,
      provisionedAt: user.blackboardProvisionedAt,
      error: user.blackboardProvisionError,
    };
  }

  /**
   * Retry failed provisioning
   */
  async retryFailedProvisioning(userId: string): Promise<ProvisioningResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    if (user.blackboardProvisionStatus !== 'FAILED') {
      throw new Error(`User provisioning status is not FAILED: ${user.blackboardProvisionStatus}`);
    }

    this.logger.log(`Retrying failed provisioning for user: ${user.email}`);
    return this.provisionUser(userId);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
