import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface BlackboardUser {
  id?: string;
  userName: string;
  externalId?: string;
  name: {
    given: string;
    family: string;
  };
  contact?: {
    email: string;
  };
  availability?: {
    available: 'Yes' | 'No';
  };
}

export interface BlackboardUserResponse {
  id: string;
  userName: string;
  externalId: string;
  name: {
    given: string;
    family: string;
  };
  contact: {
    email: string;
  };
}

@Injectable()
export class BlackboardApiClient {
  private readonly logger = new Logger(BlackboardApiClient.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BLACKBOARD_API_URL') || '';
    this.clientId = this.configService.get<string>('BLACKBOARD_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('BLACKBOARD_CLIENT_SECRET') || '';
  }

  /**
   * Get OAuth 2.0 access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ access_token: string; expires_in: number }>(
          `${this.baseUrl}/learn/api/public/v1/oauth2/token`,
          new URLSearchParams({
            grant_type: 'client_credentials',
          }),
          {
            auth: {
              username: this.clientId,
              password: this.clientSecret,
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      this.logger.log('Successfully obtained Blackboard access token');
      return this.accessToken!;
    } catch (error) {
      this.logger.error('Failed to obtain Blackboard access token', error);
      throw new Error('Blackboard authentication failed');
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
  ): Promise<T> {
    const token = await this.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: `${this.baseUrl}${endpoint}`,
          data,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Blackboard API request failed: ${method} ${endpoint}`,
        axiosError.response?.data || axiosError.message,
      );
      throw error;
    }
  }

  /**
   * Search for user by email
   */
  async findUserByEmail(email: string): Promise<BlackboardUserResponse | null> {
    try {
      const response = await this.makeRequest<{ results: BlackboardUserResponse[] }>(
        'GET',
        `/learn/api/public/v1/users?email=${encodeURIComponent(email)}`,
      );

      if (response.results && response.results.length > 0) {
        this.logger.log(`Found existing Blackboard user: ${email}`);
        return response.results[0];
      }

      return null;
    } catch (error) {
      this.logger.warn(`User search failed for email: ${email}`, error);
      return null;
    }
  }

  /**
   * Search for user by external ID (national ID)
   */
  async findUserByExternalId(externalId: string): Promise<BlackboardUserResponse | null> {
    try {
      const response = await this.makeRequest<{ results: BlackboardUserResponse[] }>(
        'GET',
        `/learn/api/public/v1/users?externalId=${encodeURIComponent(externalId)}`,
      );

      if (response.results && response.results.length > 0) {
        this.logger.log(`Found existing Blackboard user by externalId: ${externalId}`);
        return response.results[0];
      }

      return null;
    } catch (error) {
      this.logger.warn(`User search failed for externalId: ${externalId}`, error);
      return null;
    }
  }

  /**
   * Create new user in Blackboard
   */
  async createUser(userData: BlackboardUser): Promise<BlackboardUserResponse> {
    try {
      const response = await this.makeRequest<BlackboardUserResponse>(
        'POST',
        '/learn/api/public/v1/users',
        {
          ...userData,
          availability: {
            available: 'Yes',
          },
        },
      );

      this.logger.log(`Successfully created Blackboard user: ${userData.userName}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create Blackboard user: ${userData.userName}`, error);
      throw error;
    }
  }

  /**
   * Update existing user in Blackboard
   */
  async updateUser(userId: string, userData: Partial<BlackboardUser>): Promise<BlackboardUserResponse> {
    try {
      const response = await this.makeRequest<BlackboardUserResponse>(
        'PATCH',
        `/learn/api/public/v1/users/${userId}`,
        userData,
      );

      this.logger.log(`Successfully updated Blackboard user: ${userId}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to update Blackboard user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get user by Blackboard ID
   */
  async getUserById(userId: string): Promise<BlackboardUserResponse> {
    try {
      const response = await this.makeRequest<BlackboardUserResponse>(
        'GET',
        `/learn/api/public/v1/users/${userId}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`Failed to get Blackboard user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Enroll user in course
   */
  async enrollUserInCourse(enrollmentData: {
    userId: string;
    courseId: string;
    availability?: { available: 'Yes' | 'No' };
    courseRoleId?: string;
  }): Promise<{ id: string }> {
    try {
      const response = await this.makeRequest<{ id: string }>(
        'POST',
        `/learn/api/public/v1/courses/${enrollmentData.courseId}/users/${enrollmentData.userId}`,
        {
          availability: enrollmentData.availability || { available: 'Yes' },
          courseRoleId: enrollmentData.courseRoleId || 'Student',
        },
      );

      this.logger.log(
        `Successfully enrolled user ${enrollmentData.userId} in course ${enrollmentData.courseId}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to enroll user ${enrollmentData.userId} in course ${enrollmentData.courseId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get enrollment
   */
  async getEnrollment(courseId: string, userId: string): Promise<any> {
    try {
      const response = await this.makeRequest<any>(
        'GET',
        `/learn/api/public/v1/courses/${courseId}/users/${userId}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`Failed to get enrollment for user ${userId} in course ${courseId}`, error);
      throw error;
    }
  }

  /**
   * Delete enrollment (withdraw user from course)
   */
  async deleteEnrollment(courseId: string, userId: string): Promise<void> {
    try {
      await this.makeRequest<void>(
        'DELETE',
        `/learn/api/public/v1/courses/${courseId}/users/${userId}`,
      );

      this.logger.log(`Successfully deleted enrollment for user ${userId} from course ${courseId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete enrollment for user ${userId} from course ${courseId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(
    courseId: string,
    userId: string,
    data: {
      availability?: { available: 'Yes' | 'No' };
      courseRoleId?: string;
    },
  ): Promise<any> {
    try {
      const response = await this.makeRequest<any>(
        'PATCH',
        `/learn/api/public/v1/courses/${courseId}/users/${userId}`,
        data,
      );

      this.logger.log(`Successfully updated enrollment for user ${userId} in course ${courseId}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to update enrollment for user ${userId} in course ${courseId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get user course progress and completion status
   */
  async getUserCourseProgress(courseId: string, userId: string): Promise<{
    completionPercentage: number;
    lastActivityAt: Date;
    isComplete: boolean;
    grade?: number;
  }> {
    try {
      // Get user's grade in the course
      const gradeResponse = await this.makeRequest<any>(
        'GET',
        `/learn/api/public/v1/courses/${courseId}/gradebook/users/${userId}`,
      );

      // Get user's course activity
      const activityResponse = await this.makeRequest<any>(
        'GET',
        `/learn/api/public/v1/courses/${courseId}/users/${userId}/activity`,
      );

      // Calculate completion percentage based on grade and activity
      const completionPercentage = gradeResponse.score || 0;
      const lastActivityAt = activityResponse.lastAccessed
        ? new Date(activityResponse.lastAccessed)
        : new Date();
      const isComplete = completionPercentage >= 80; // 80% threshold

      return {
        completionPercentage,
        lastActivityAt,
        isComplete,
        grade: gradeResponse.score,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get course progress for user ${userId} in course ${courseId}`,
        error,
      );
      // Return default values if API fails
      return {
        completionPercentage: 0,
        lastActivityAt: new Date(),
        isComplete: false,
      };
    }
  }
}
