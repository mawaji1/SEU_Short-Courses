'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth';

interface LearnerShellProps {
  children: ReactNode;
}

export function LearnerShell({ children }: LearnerShellProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50" dir="rtl">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
