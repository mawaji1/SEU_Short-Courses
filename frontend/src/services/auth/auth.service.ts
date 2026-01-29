/**
 * SEU Short Courses - Auth Service
 *
 * This service provides a compatibility layer for components that haven't
 * migrated to use useAuth() hook directly. It wraps Better Auth methods.
 *
 * Security: Sessions are managed via HttpOnly cookies by Better Auth.
 */

import { signIn, signUp, signOut, getSession } from '@/lib/auth-client';
import { AuthResponse, RegisterData, LoginData, User } from './types';

const USER_STORAGE_KEY = 'seu_user';

export const authService = {
    /**
     * Register a new user
     * Uses Better Auth sign-up
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const { data: result, error } = await signUp.email({
            email: data.email,
            password: data.password,
            name: `${data.firstName} ${data.lastName}`.trim(),
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
        } as any);

        if (error) {
            throw new Error(error.message || 'Registration failed');
        }

        const user: User = {
            id: result!.user.id,
            email: result!.user.email,
            firstName: (result!.user as any).firstName || result!.user.name?.split(' ')[0] || '',
            lastName: (result!.user as any).lastName || result!.user.name?.split(' ').slice(1).join(' ') || '',
            role: (result!.user as any).role || 'LEARNER',
        };

        // Cache user data for backwards compatibility
        this.saveUser(user);

        return {
            user,
            accessToken: '', // Better Auth manages tokens via cookies
            refreshToken: '',
            expiresIn: 60 * 60 * 24 * 7, // 7 days
        };
    },

    /**
     * Login with email and password
     * Uses Better Auth sign-in
     */
    async login(data: LoginData): Promise<AuthResponse> {
        const { data: result, error } = await signIn.email({
            email: data.email,
            password: data.password,
        });

        if (error) {
            throw new Error(error.message || 'Login failed');
        }

        const user: User = {
            id: result!.user.id,
            email: result!.user.email,
            firstName: (result!.user as any).firstName || result!.user.name?.split(' ')[0] || '',
            lastName: (result!.user as any).lastName || result!.user.name?.split(' ').slice(1).join(' ') || '',
            role: (result!.user as any).role || 'LEARNER',
        };

        // Cache user data for backwards compatibility
        this.saveUser(user);

        return {
            user,
            accessToken: '', // Better Auth manages tokens via cookies
            refreshToken: '',
            expiresIn: 60 * 60 * 24 * 7, // 7 days
        };
    },

    /**
     * Refresh session
     * Better Auth handles session refresh automatically via cookies
     */
    async refresh(): Promise<AuthResponse | null> {
        try {
            const session = await getSession();
            if (!session?.data?.user) {
                this.clearAuth();
                return null;
            }

            const user: User = {
                id: session.data.user.id,
                email: session.data.user.email,
                firstName: (session.data.user as any).firstName || session.data.user.name?.split(' ')[0] || '',
                lastName: (session.data.user as any).lastName || session.data.user.name?.split(' ').slice(1).join(' ') || '',
                role: (session.data.user as any).role || 'LEARNER',
            };

            this.saveUser(user);

            return {
                user,
                accessToken: '',
                refreshToken: '',
                expiresIn: 60 * 60 * 24 * 7,
            };
        } catch {
            this.clearAuth();
            return null;
        }
    },

    /**
     * Get current user profile from session
     */
    async getProfile(): Promise<User | null> {
        try {
            const session = await getSession();
            if (!session?.data?.user) {
                return null;
            }

            return {
                id: session.data.user.id,
                email: session.data.user.email,
                firstName: (session.data.user as any).firstName || session.data.user.name?.split(' ')[0] || '',
                lastName: (session.data.user as any).lastName || session.data.user.name?.split(' ').slice(1).join(' ') || '',
                role: (session.data.user as any).role || 'LEARNER',
            };
        } catch {
            return null;
        }
    },

    /**
     * Logout user
     * Uses Better Auth sign-out
     */
    async logout(): Promise<void> {
        try {
            await signOut();
        } catch {
            // Ignore errors - we're logging out anyway
        }
        this.clearAuth();
        window.location.href = '/login';
    },

    /**
     * Save user data to localStorage (for backwards compatibility)
     */
    saveUser(user: User): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        }
    },

    /**
     * Get cached user data from localStorage
     */
    getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(USER_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Clear all auth data from localStorage
     */
    clearAuth(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    },

    /**
     * Check if user is authenticated
     * Note: This checks cached user; actual auth is via Better Auth session
     */
    isAuthenticated(): boolean {
        return !!this.getCurrentUser();
    },

    /**
     * Request password reset
     * Note: This still uses the old endpoint - Better Auth doesn't handle this yet
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to send password reset email');
        }

        return response.json();
    },

    /**
     * Reset password with token
     * Note: This still uses the old endpoint - Better Auth doesn't handle this yet
     */
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to reset password');
        }

        return response.json();
    },

    // ============================================
    // DEPRECATED - Kept for backwards compatibility
    // ============================================

    /** @deprecated Use getCurrentUser() instead */
    getAuth(): { user: User } | null {
        const user = this.getCurrentUser();
        return user ? { user } : null;
    },

    /** @deprecated Tokens are now in HttpOnly cookies */
    getAccessToken(): string | null {
        console.warn('getAccessToken() is deprecated - tokens are now managed by Better Auth');
        return null;
    },

    /** @deprecated Use saveUser() instead */
    saveAuth(auth: AuthResponse): void {
        this.saveUser(auth.user);
    },
};

export default authService;
