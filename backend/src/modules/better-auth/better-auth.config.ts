import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Create Better Auth instance with Prisma adapter
 *
 * Better Auth handles:
 * - Session management (DB-backed sessions)
 * - Password hashing (bcrypt by default)
 * - Email/password authentication
 * - Rate limiting
 * - Cookie management
 *
 * Note: We use custom model name 'authSession' instead of 'session' to avoid
 * conflict with the curriculum Session model.
 */
export function createBetterAuth(prisma: PrismaClient) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),

    // Email/password authentication
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      // Custom bcrypt password hashing to match existing password format
      password: {
        hash: async (password: string) => {
          // Use 10 rounds to match existing hashes
          return bcrypt.hash(password, 10);
        },
        verify: async (data: { hash: string; password: string }) => {
          return bcrypt.compare(data.password, data.hash);
        },
      },
    },

    // Session configuration
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 15, // 15 minute cache (matches old access token)
      },
    },

    // Rate limiting
    rateLimit: {
      enabled: true,
      window: 60, // 60 seconds
      max: 5, // 5 requests per window (matches existing throttler)
    },

    // User model configuration
    user: {
      additionalFields: {
        firstName: {
          type: 'string',
          required: true,
        },
        lastName: {
          type: 'string',
          required: true,
        },
        phone: {
          type: 'string',
          required: false,
        },
        nationalId: {
          type: 'string',
          required: false,
        },
        role: {
          type: 'string',
          required: true,
          defaultValue: 'LEARNER',
        },
        organizationId: {
          type: 'string',
          required: false,
        },
        isActive: {
          type: 'boolean',
          required: true,
          defaultValue: true,
        },
        emailVerified: {
          type: 'boolean',
          required: true,
          defaultValue: false,
        },
      },
    },

    // Trusted origins for CORS
    trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],

    // Advanced configuration
    advanced: {
      // Use secure cookies in production
      useSecureCookies: process.env.NODE_ENV === 'production',
      // Cookie prefix
      cookiePrefix: 'better-auth',
    },
  });
}

// Type export for the auth instance
export type BetterAuthInstance = ReturnType<typeof createBetterAuth>;
