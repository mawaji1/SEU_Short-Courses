import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * 
 * Marks routes that require specific roles.
 * Example: @Roles('ADMIN', 'COORDINATOR')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
