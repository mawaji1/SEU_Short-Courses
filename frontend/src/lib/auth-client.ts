import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth Client
 *
 * Configured to communicate with the backend Better Auth handler.
 * Provides React hooks for authentication state management.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Export individual methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
