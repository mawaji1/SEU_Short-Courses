'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Mail,
  User,
  Award,
  LogOut,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/my-courses', label: 'دوراتي', icon: BookOpen },
  { href: '/calendar', label: 'التقويم', icon: Calendar },
  { href: '/messages', label: 'الرسائل', icon: Mail },
  { href: '/certificates', label: 'شهاداتي', icon: Award },
  { href: '/profile', label: 'الملف الشخصي', icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/images/seu-header-logo.svg"
                alt="SEU"
                width={100}
                height={40}
                className="h-10 w-auto"
              />
              <div className="text-sm font-bold text-primary">بوابة المتدرب</div>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              aria-label="إغلاق القائمة"
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4" role="navigation" aria-label="القائمة الرئيسية">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors
                    ${active
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="mr-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="space-y-1 border-t border-gray-100 p-4">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
              الإعدادات
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
