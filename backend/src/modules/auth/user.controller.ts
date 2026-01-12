import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * User Management Controller
 * Admin-only endpoints for managing users
 */
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get all users
   * Admin only
   */
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  /**
   * Get user by ID
   * Admin only
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  /**
   * Change user role
   * Admin only
   */
  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  async changeUserRole(@Param('id') id: string, @Body() body: { role: UserRole }) {
    return this.userService.changeUserRole(id, body.role);
  }

  /**
   * Toggle user active status
   * Admin only
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async toggleUserStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.userService.toggleUserStatus(id, body.isActive);
  }
}
