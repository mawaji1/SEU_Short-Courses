'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Mail,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  { href: '/profile', label: 'الملف الشخصي', icon: User },
];

interface SidebarContentProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onClose?: () => void;
  pathname: string;
  user: { firstName?: string; lastName?: string; email?: string } | null;
  logout: () => void;
}

function SidebarContent({ isCollapsed, isMobile, onClose, pathname, user, logout }: SidebarContentProps) {
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || 'متعلم';
  };

  const getUserInitial = () => {
    return user?.firstName?.charAt(0) || 'م';
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-seu-blue to-seu-navy text-white">
      {/* Header with Close Button (Mobile) */}
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <div>
          <h1 className={`font-bold transition-all ${isCollapsed ? 'text-sm' : 'text-lg'}`}>
            {isCollapsed ? 'SEU' : 'الجامعة السعودية الإلكترونية'}
          </h1>
          {!isCollapsed && (
            <p className="mt-1 text-sm text-white/70">الدورات القصيرة</p>
          )}
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
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
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
                active
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!isCollapsed && <span>{item.label}</span>}
              {isCollapsed && <span className="sr-only">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="mr-auto rounded-full bg-seu-orange px-2 py-0.5 text-xs font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-seu-cyan font-bold text-seu-navy">
            {getUserInitial()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{getUserDisplayName()}</p>
              <p className="truncate text-xs text-white/70">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          aria-label={isCollapsed ? 'تسجيل الخروج' : undefined}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/20 ${
            isCollapsed ? 'px-2' : ''
          }`}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, closeMobileMenu]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        aria-label="فتح القائمة"
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
        className="fixed right-4 top-4 z-50 rounded-xl bg-seu-blue p-3 text-white shadow-lg md:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            id="mobile-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-72 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="قائمة التنقل"
          >
            <SidebarContent
              isCollapsed={false}
              isMobile={true}
              onClose={closeMobileMenu}
              pathname={pathname}
              user={user}
              logout={logout}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`relative hidden h-screen flex-shrink-0 transition-all duration-300 md:block ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          isMobile={false}
          pathname={pathname}
          user={user}
          logout={logout}
        />
        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
          aria-expanded={!isCollapsed}
          className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-lg transition-transform hover:scale-110"
        >
          <ChevronLeft
            className={`h-4 w-4 text-seu-navy transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </aside>
    </>
  );
}
