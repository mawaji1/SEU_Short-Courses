"use client";

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useSession, signIn, signUp, signOut } from '@/lib/auth-client';

// User type that matches our backend User model
interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name?: string;
    role: string;
    phone?: string;
    isActive?: boolean;
    emailVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<{ user: User; expiresIn: number }>;
    register: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Use Better Auth's useSession hook for session management
    const { data: session, isPending, error, refetch } = useSession();

    // Map Better Auth session to our User type
    const user = useMemo((): User | null => {
        if (!session?.user) return null;

        const sessionUser = session.user as {
            id: string;
            email: string;
            firstName?: string;
            lastName?: string;
            name?: string;
            role?: string;
            phone?: string;
            isActive?: boolean;
            emailVerified?: boolean;
        };

        return {
            id: sessionUser.id,
            email: sessionUser.email,
            firstName: sessionUser.firstName || sessionUser.name?.split(' ')[0] || '',
            lastName: sessionUser.lastName || sessionUser.name?.split(' ').slice(1).join(' ') || '',
            name: sessionUser.name,
            role: sessionUser.role || 'LEARNER',
            phone: sessionUser.phone,
            isActive: sessionUser.isActive,
            emailVerified: sessionUser.emailVerified,
        };
    }, [session]);

    const login = useCallback(async (email: string, password: string, _rememberMe = false) => {
        const { data, error } = await signIn.email({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message || 'Login failed');
        }

        if (!data?.user) {
            throw new Error('Login failed - no user returned');
        }

        // Map response to expected format
        const loggedInUser: User = {
            id: data.user.id,
            email: data.user.email,
            firstName: (data.user as any).firstName || data.user.name?.split(' ')[0] || '',
            lastName: (data.user as any).lastName || data.user.name?.split(' ').slice(1).join(' ') || '',
            name: data.user.name || undefined,
            role: (data.user as any).role || 'LEARNER',
            phone: (data.user as any).phone,
            isActive: (data.user as any).isActive,
            emailVerified: data.user.emailVerified,
        };

        return {
            user: loggedInUser,
            expiresIn: 60 * 60 * 24 * 7, // 7 days (session expiry)
        };
    }, []);

    const register = useCallback(async (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
    }) => {
        const { error } = await signUp.email({
            email: data.email,
            password: data.password,
            name: `${data.firstName} ${data.lastName}`.trim(),
            // Pass additional fields that Better Auth will store
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
        } as any);

        if (error) {
            throw new Error(error.message || 'Registration failed');
        }
    }, []);

    const logout = useCallback(async () => {
        await signOut();
        // Redirect to login page
        window.location.href = '/login';
    }, []);

    const refreshUser = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const value: AuthContextType = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading: isPending,
        login,
        register,
        logout,
        refreshUser,
    }), [user, isPending, login, register, logout, refreshUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
