/**
 * SEU Short Courses — Auth Types
 */

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    emailVerified?: boolean;
    createdAt?: string;
}

export interface AuthResponse {
    user: User;
    expiresIn: number;
    // Tokens are now in HttpOnly cookies, not in response body
    // These are kept for backwards compatibility but should not be used
    accessToken?: string;
    refreshToken?: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface LoginData {
    email: string;
    password: string;
    rememberMe?: boolean;
}

