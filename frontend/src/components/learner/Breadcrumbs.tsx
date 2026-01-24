'use client';

import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600" aria-label="مسار التنقل">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-500 transition-colors hover:text-seu-blue"
        aria-label="الصفحة الرئيسية"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-seu-blue"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900" aria-current="page">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
