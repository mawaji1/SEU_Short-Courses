'use client';

import { ReactNode } from 'react';

interface InstructorLayoutProps {
  children: ReactNode;
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  );
}
