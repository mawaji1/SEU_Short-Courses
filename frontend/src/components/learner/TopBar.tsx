'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const userInitial = user?.firstName?.charAt(0) || 'م';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'متدرب';

  // Fetch total unread messages count from all enrolled cohorts
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        // First get enrollments
        const enrollmentsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/my-courses`,
          { credentials: 'include' }
        );

        if (!enrollmentsRes.ok) return;

        const enrollments = await enrollmentsRes.json();

        // Fetch unread count for each cohort
        let totalUnread = 0;
        for (const enrollment of enrollments) {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts/${enrollment.cohort.id}/messages/unread-count`,
              { credentials: 'include' }
            );
            if (res.ok) {
              const { count } = await res.json();
              totalUnread += count;
            }
          } catch {
            // Silent fail for individual cohort
          }
        }

        setUnreadCount(totalUnread);
      } catch {
        // Silent fail
      }
    };

    fetchUnreadCount();
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 lg:right-64">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="h-6 w-6" />
        </button>

        <h1 className="text-lg font-bold text-gray-900 hidden sm:block">بوابة المتدرب</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications - Links to Messages */}
        <Link
          href="/messages"
          className="relative rounded-lg p-2 hover:bg-gray-100"
          aria-label="الرسائل"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile */}
        <Link href="/profile" className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
            {userInitial}
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-bold text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500">متدرب</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
