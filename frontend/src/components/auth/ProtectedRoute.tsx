"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
    allowedRoles?: string[];
}

export function ProtectedRoute({
    children,
    requireAuth = true,
    redirectTo = '/login',
    allowedRoles,
}: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            // Redirect to login if auth is required but user is not authenticated
            if (requireAuth && !isAuthenticated) {
                const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
                router.push(redirectUrl);
                return;
            }

            // Check role-based access
            if (requireAuth && isAuthenticated && allowedRoles && user) {
                if (!allowedRoles.includes(user.role)) {
                    router.push('/unauthorized');
                }
            }
        }
    }, [isLoading, isAuthenticated, requireAuth, user, allowedRoles, router, pathname, redirectTo]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // If auth is required but user is not authenticated, don't render children
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    // If role check fails, don't render children
    if (requireAuth && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
