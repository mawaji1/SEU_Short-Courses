'use client';

import React from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

interface PublicLayoutProps {
  children: React.ReactNode;
  locale?: 'ar' | 'en';
}

export function PublicLayout({ children, locale = 'ar' }: PublicLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <PublicHeader locale={locale} />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter locale={locale} />
    </div>
  );
}

export default PublicLayout;
