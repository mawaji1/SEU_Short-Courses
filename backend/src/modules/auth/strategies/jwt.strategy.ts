import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

/**
 * Custom extractor that checks cookies first, then Authorization header
 * This allows for secure HttpOnly cookie-based auth while maintaining backwards compatibility
 */
const cookieOrHeaderExtractor = (req: Request): string | null => {
    // Try to extract from HttpOnly cookie first (most secure)
    if (req.cookies?.access_token) {
        return req.cookies.access_token;
    }

    // Fall back to Authorization header for backwards compatibility
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
};

/**
 * JWT Strategy
 * 
 * Validates JWT tokens from:
 * 1. HttpOnly cookies (preferred, more secure)
 * 2. Authorization header (backwards compatibility)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: cookieOrHeaderExtractor,
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'jwt-secret',
        });
    }

    async validate(payload: JwtPayload) {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}

