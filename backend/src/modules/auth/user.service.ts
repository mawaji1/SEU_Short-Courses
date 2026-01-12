import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UserRole } from '@prisma/client';

/**
 * User Management Service
 * Handles user CRUD operations for admin
 */
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all users
   */
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationalId: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        blackboardUserId: true,
        blackboardProvisionStatus: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Change user role
   */
  async changeUserRole(userId: string, newRole: UserRole) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return {
      success: true,
      message: 'User role updated successfully',
      user,
    };
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    return {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    };
  }
}
