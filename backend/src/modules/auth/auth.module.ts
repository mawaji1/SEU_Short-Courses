import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
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
 */
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'jwt-secret',
            signOptions: { expiresIn: '15m' },
        }),
    ],
    controllers: [AuthController, UserController],
    providers: [AuthService, UserService, JwtStrategy, LocalStrategy, PrismaService],
    exports: [AuthService, UserService, JwtModule],
})
export class AuthModule { }
