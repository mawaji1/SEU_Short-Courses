import { Injectable, Logger } from '@nestjs/common';
import { ZoomAuthService } from './zoom-auth.service';

export interface ZoomUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  type: number; // 1=Basic, 2=Licensed (Pro), 3=On-prem
  status: string;
}

interface CreateUserRequest {
  action: 'create' | 'autoCreate' | 'custCreate' | 'ssoCreate';
  user_info: {
    email: string;
    first_name: string;
    last_name: string;
    type: number;
  };
}

/**
 * Manages Zoom user provisioning for instructors.
 * Creates SEU-managed Zoom accounts for instructors who will host sessions.
 */
@Injectable()
export class ZoomUserService {
  private readonly logger = new Logger(ZoomUserService.name);
  private readonly baseUrl = 'https://api.zoom.us/v2';

  constructor(private readonly authService: ZoomAuthService) {}

  /**
   * Create a new Zoom user under the SEU account.
   * Used when assigning an instructor to teach for the first time.
   *
   * @param email - Instructor's email
   * @param firstName - First name
   * @param lastName - Last name
   * @param licenseType - 1 for Basic, 2 for Licensed (Pro)
   */
  async createUser(
    email: string,
    firstName: string,
    lastName: string,
    licenseType: number = 2, // Default to Pro
  ): Promise<ZoomUser> {
    this.logger.log(`Creating Zoom user for ${email}`);

    const token = await this.authService.getAccessToken();

    const body: CreateUserRequest = {
      action: 'create',
      user_info: {
        email,
        first_name: firstName,
        last_name: lastName,
        type: licenseType,
      },
    };

    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error(`Failed to create Zoom user: ${JSON.stringify(error)}`);

      // Handle specific error codes
      if (error.code === 1005) {
        throw new Error('Zoom user with this email already exists');
      }
      if (error.code === 200) {
        throw new Error('No available license to assign to user');
      }

      throw new Error(`Failed to create Zoom user: ${error.message}`);
    }

    const user = await response.json();
    this.logger.log(`Created Zoom user ${user.id} for ${email}`);

    return user as ZoomUser;
  }

  /**
   * Get a Zoom user by ID or email.
   */
  async getUser(userIdOrEmail: string): Promise<ZoomUser | null> {
    const token = await this.authService.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/users/${encodeURIComponent(userIdOrEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get Zoom user: ${error.message}`);
    }

    return (await response.json()) as ZoomUser;
  }

  /**
   * Delete a Zoom user.
   * Used when an instructor is removed from teaching duties.
   *
   * @param userId - Zoom user ID
   * @param transferEmail - Optional email to transfer meetings to
   */
  async deleteUser(userId: string, transferEmail?: string): Promise<void> {
    this.logger.log(`Deleting Zoom user ${userId}`);

    const token = await this.authService.getAccessToken();

    const params = new URLSearchParams({
      action: 'delete', // or 'disassociate' to just remove from account
    });
    if (transferEmail) {
      params.append('transfer_email', transferEmail);
      params.append('transfer_meeting', 'true');
    }

    const response = await fetch(
      `${this.baseUrl}/users/${userId}?${params.toString()}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(`Failed to delete Zoom user: ${error.message}`);
    }

    this.logger.log(`Deleted Zoom user ${userId}`);
  }

  /**
   * Update a Zoom user's license type.
   *
   * @param userId - Zoom user ID
   * @param licenseType - 1=Basic, 2=Licensed (Pro)
   */
  async updateLicenseType(userId: string, licenseType: number): Promise<void> {
    this.logger.log(`Updating license for Zoom user ${userId} to ${licenseType}`);

    const token = await this.authService.getAccessToken();

    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: licenseType }),
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(`Failed to update Zoom user license: ${error.message}`);
    }

    this.logger.log(`Updated license for Zoom user ${userId}`);
  }

  /**
   * List all users in the Zoom account.
   */
  async listUsers(status: 'active' | 'inactive' | 'pending' = 'active'): Promise<ZoomUser[]> {
    const token = await this.authService.getAccessToken();

    const users: ZoomUser[] = [];
    let nextPageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        status,
        page_size: '300',
      });
      if (nextPageToken) {
        params.append('next_page_token', nextPageToken);
      }

      const response = await fetch(
        `${this.baseUrl}/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to list Zoom users: ${error.message}`);
      }

      const data = await response.json();
      users.push(...(data.users || []));
      nextPageToken = data.next_page_token;
    } while (nextPageToken);

    return users;
  }
}
