import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BetterAuthService } from './better-auth.service';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

/**
 * Better Auth Guard
 *
 * Replaces JwtAuthGuard for route protection.
 * Validates session via Better Auth and populates request.user
 */
@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    private readonly betterAuthService: BetterAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Convert Express headers to Web Headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) {
        headers.set(
          key,
          Array.isArray(value) ? value.join(', ') : String(value),
        );
      }
    }

    // Get cookies and add them to headers for Better Auth
    if (request.cookies) {
      const cookieHeader = Object.entries(request.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      if (cookieHeader) {
        headers.set('cookie', cookieHeader);
      }
    }

    // Validate session with Better Auth
    const session = await this.betterAuthService.validateSession(headers);

    if (!session?.user) {
      throw new UnauthorizedException('غير مصرح بالدخول');
    }

    // Map Better Auth user to expected format
    const user = session.user as {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      isActive?: boolean;
    };

    // Check if user is active
    if (user.isActive === false) {
      throw new UnauthorizedException('الحساب غير مفعل');
    }

    // Populate request.user (maintains compatibility with @CurrentUser decorator)
    request.user = {
      id: user.id,
      sub: user.id, // For backwards compatibility
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'LEARNER',
    };

    // Check role-based access if @Roles decorator is present
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(request.user.role)) {
        throw new UnauthorizedException('ليس لديك صلاحية للوصول');
      }
    }

    return true;
  }
}
