import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtStrategy, LocalStrategy } from './strategies';
import { PrismaService } from '../../common/prisma.service';

/**
 * Auth Module
 * 
 * Handles user authentication and authorization:
 * - User registration
 * - Login with email/password
 * - JWT token management
 * - Password management
 * - RBAC guards
 * - Rate limiting for brute-force protection
 */
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'jwt-secret',
            signOptions: { expiresIn: '15m' },
        }),
        // Rate limiting configuration
        ThrottlerModule.forRoot([
            {
                name: 'auth',
                ttl: 60000, // 60 seconds
                limit: 5,   // 5 requests per 60 seconds for auth endpoints
            },
            {
                name: 'default',
                ttl: 60000, // 60 seconds  
                limit: 10,  // 10 requests per 60 seconds for other endpoints
            },
        ]),
    ],
    controllers: [AuthController, UserController],
    providers: [AuthService, UserService, JwtStrategy, LocalStrategy, PrismaService],
    exports: [AuthService, UserService, JwtModule],
})
export class AuthModule { }

