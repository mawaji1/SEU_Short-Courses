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
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', labelEn: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-courses', label: 'دوراتي', labelEn: 'My Courses', icon: BookOpen },
  { href: '/calendar', label: 'التقويم', labelEn: 'Calendar', icon: Calendar },
  { href: '/messages', label: 'الرسائل', labelEn: 'Messages', icon: Mail },
  { href: '/profile', label: 'الملف الشخصي', labelEn: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-seu-blue to-seu-navy text-white">
      {/* Logo */}
      <div className="border-b border-white/10 p-6">
        <h1 className={`font-bold transition-all ${isCollapsed ? 'text-sm' : 'text-lg'}`}>
          {isCollapsed ? 'SEU' : 'الجامعة السعودية الإلكترونية'}
        </h1>
        {!isCollapsed && (
          <p className="mt-1 text-sm text-white/70">الدورات القصيرة</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
                active
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
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

        {!isCollapsed && (
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        )}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-1.5 shadow-lg transition-transform hover:scale-110 md:block"
      >
        <ChevronLeft
          className={`h-4 w-4 text-seu-navy transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed right-4 top-4 z-50 rounded-xl bg-seu-blue p-3 text-white shadow-lg md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-72 md:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`relative hidden h-screen flex-shrink-0 transition-all duration-300 md:block ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
