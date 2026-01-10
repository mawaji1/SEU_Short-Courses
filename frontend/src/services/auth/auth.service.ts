/**
 * SEU Short Courses — Auth Service
 */

import { apiClient } from '@/lib';
import { AuthResponse, RegisterData, LoginData, User } from './types';

const AUTH_STORAGE_KEY = 'seu_auth';

export const authService = {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
        this.saveAuth(response);
        return response;
    },

    /**
     * Login with email and password
     */
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
        this.saveAuth(response);
        return response;
    },

    /**
     * Refresh access token
     */
    async refresh(): Promise<AuthResponse | null> {
        const auth = this.getAuth();
        if (!auth?.refreshToken) return null;

        try {
            const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
                refreshToken: auth.refreshToken,
            });
            this.saveAuth(response);
            return response;
        } catch {
            this.clearAuth();
            return null;
        }
    },

    /**
     * Get current user profile
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
     */
    logout(): void {
        this.clearAuth();
        window.location.href = '/login';
    },

    /**
     * Save auth data to localStorage
     */
    saveAuth(auth: AuthResponse): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
        }
    },

    /**
     * Get auth data from localStorage
     */
    getAuth(): AuthResponse | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(AUTH_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Clear auth data
     */
    clearAuth(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const auth = this.getAuth();
        return !!auth?.accessToken;
    },

    /**
     * Get access token
     */
    getAccessToken(): string | null {
        const auth = this.getAuth();
        return auth?.accessToken || null;
    },

    /**
     * Get current user from stored auth
     */
    getCurrentUser(): User | null {
        const auth = this.getAuth();
        return auth?.user || null;
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
};

export default authService;
