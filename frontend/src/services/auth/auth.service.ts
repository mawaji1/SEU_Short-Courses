/**
 * SEU Short Courses — Auth Service
 * 
 * Security: Tokens are stored in HttpOnly cookies (server-set, not accessible via JavaScript).
 * This service only caches user data locally, tokens are managed by the browser automatically.
 */

import { apiClient } from '@/lib';
import { AuthResponse, RegisterData, LoginData, User } from './types';

const USER_STORAGE_KEY = 'seu_user';

export const authService = {
    /**
     * Register a new user
     * Tokens are set as HttpOnly cookies by the server
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
        // Only cache user data (tokens are in HttpOnly cookies)
        this.saveUser(response.user);
        return response;
    },

    /**
     * Login with email and password
     * Tokens are set as HttpOnly cookies by the server
     */
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
        // Only cache user data (tokens are in HttpOnly cookies)
        this.saveUser(response.user);
        return response;
    },

    /**
     * Refresh access token
     * Refresh token is sent automatically via HttpOnly cookie
     */
    async refresh(): Promise<AuthResponse | null> {
        try {
            // No need to send refreshToken - it's in HttpOnly cookie
            const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {});
            this.saveUser(response.user);
            return response;
        } catch {
            this.clearAuth();
            return null;
        }
    },

    /**
     * Get current user profile
     * Access token is sent automatically via HttpOnly cookie
     */
    async getProfile(): Promise<User | null> {
        try {
            return await apiClient.get<User>('/api/auth/me');
        } catch {
            return null;
        }
    },

    /**
     * Logout user
     * Server clears HttpOnly cookies
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post('/api/auth/logout', {});
        } catch {
            // Ignore errors - we're logging out anyway
        }
        this.clearAuth();
        window.location.href = '/login';
    },

    /**
     * Save user data to localStorage (NOT tokens - those are in HttpOnly cookies)
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
     * (Cookies are cleared by server on logout)
     */
    clearAuth(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    },

    /**
     * Check if user is authenticated
     * Note: This checks cached user, actual auth is via HttpOnly cookies
     */
    isAuthenticated(): boolean {
        return !!this.getCurrentUser();
    },

    /**
     * Request password reset
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('/api/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     */
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('/api/auth/reset-password', { token, newPassword });
    },

    // ============================================
    // DEPRECATED - Kept for backwards compatibility during migration
    // These will be removed in a future version
    // ============================================

    /** @deprecated Use getCurrentUser() instead */
    getAuth(): { user: User } | null {
        const user = this.getCurrentUser();
        return user ? { user } : null;
    },

    /** @deprecated Tokens are now in HttpOnly cookies */
    getAccessToken(): string | null {
        console.warn('getAccessToken() is deprecated - tokens are now in HttpOnly cookies');
        return null;
    },

    /** @deprecated Use saveUser() instead */
    saveAuth(auth: AuthResponse): void {
        this.saveUser(auth.user);
    },
};

export default authService;

