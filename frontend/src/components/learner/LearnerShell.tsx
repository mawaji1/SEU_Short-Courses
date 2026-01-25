'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ProtectedRoute } from '@/components/auth';

interface LearnerShellProps {
  children: ReactNode;
}

export function LearnerShell({ children }: LearnerShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mt-16 p-6 lg:mr-64 lg:p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
