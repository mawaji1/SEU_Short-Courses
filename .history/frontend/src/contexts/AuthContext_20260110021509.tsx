"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { User } from '@/services/auth/types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
    }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize auth state on mount
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            if (authService.isAuthenticated()) {
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    // Try to fetch user profile from API
                    const profile = await authService.getProfile();
                    if (profile) {
                        setUser(profile);
                    } else {
                        authService.clearAuth();
                    }
                }
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error);
            authService.clearAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        setUser(response.user);
    };

    const register = async (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
    }) => {
        const response = await authService.register(data);
        setUser(response.user);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const profile = await authService.getProfile();
            if (profile) {
                setUser(profile);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
