# Learner Experience UX Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the learner experience from disconnected pages into a cohesive dashboard with persistent sidebar navigation and tab-based course hub.

**Architecture:** Create a `LearnerShell` layout component with persistent sidebar that wraps all learner pages. Convert course detail from separate pages to client-side tabs. Add dashboard widgets for "next action" visibility.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Framer Motion, Lucide Icons, SEU Brand Colors

---

## Phase 1: Core Shell & Sidebar

### Task 1: Create Sidebar Component

**Files:**
- Create: `frontend/src/components/learner/Sidebar.tsx`
- Create: `frontend/src/components/learner/index.ts`

**Step 1: Create Sidebar component**

```tsx
// frontend/src/components/learner/Sidebar.tsx
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
            {user?.name?.charAt(0) || 'م'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{user?.name || 'متعلم'}</p>
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
```

**Step 2: Create index export**

```tsx
// frontend/src/components/learner/index.ts
export { Sidebar } from './Sidebar';
```

**Step 3: Verify component renders**

```bash
cd frontend && npm run build 2>&1 | head -20
```

Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add frontend/src/components/learner/
git commit -m "feat(learner): add Sidebar component with SEU branding"
```

---

### Task 2: Create LearnerShell Layout Component

**Files:**
- Create: `frontend/src/components/learner/LearnerShell.tsx`
- Modify: `frontend/src/components/learner/index.ts`

**Step 1: Create LearnerShell component**

```tsx
// frontend/src/components/learner/LearnerShell.tsx
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
```

**Step 2: Update index export**

```tsx
// frontend/src/components/learner/index.ts
export { Sidebar } from './Sidebar';
export { LearnerShell } from './LearnerShell';
```

**Step 3: Commit**

```bash
git add frontend/src/components/learner/
git commit -m "feat(learner): add LearnerShell layout wrapper"
```

---

### Task 3: Create Breadcrumbs Component

**Files:**
- Create: `frontend/src/components/learner/Breadcrumbs.tsx`
- Modify: `frontend/src/components/learner/index.ts`

**Step 1: Create Breadcrumbs component**

```tsx
// frontend/src/components/learner/Breadcrumbs.tsx
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
    <nav className="flex items-center gap-2 text-sm text-gray-600">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-500 transition-colors hover:text-seu-blue"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-seu-blue"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
```

**Step 2: Update index export**

```tsx
// frontend/src/components/learner/index.ts
export { Sidebar } from './Sidebar';
export { LearnerShell } from './LearnerShell';
export { Breadcrumbs } from './Breadcrumbs';
```

**Step 3: Commit**

```bash
git add frontend/src/components/learner/
git commit -m "feat(learner): add Breadcrumbs navigation component"
```

---

### Task 4: Create PageHeader Component

**Files:**
- Create: `frontend/src/components/learner/PageHeader.tsx`
- Modify: `frontend/src/components/learner/index.ts`

**Step 1: Create PageHeader component**

```tsx
// frontend/src/components/learner/PageHeader.tsx
'use client';

import { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-seu-navy">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-gray-600">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Update index export**

```tsx
// frontend/src/components/learner/index.ts
export { Sidebar } from './Sidebar';
export { LearnerShell } from './LearnerShell';
export { Breadcrumbs } from './Breadcrumbs';
export { PageHeader } from './PageHeader';
```

**Step 3: Commit**

```bash
git add frontend/src/components/learner/
git commit -m "feat(learner): add PageHeader component with breadcrumbs"
```

---

## Phase 2: Dashboard Transformation

### Task 5: Create Dashboard Widgets

**Files:**
- Create: `frontend/src/components/learner/dashboard/HeroCard.tsx`
- Create: `frontend/src/components/learner/dashboard/StatsRow.tsx`
- Create: `frontend/src/components/learner/dashboard/CourseCard.tsx`
- Create: `frontend/src/components/learner/dashboard/index.ts`

**Step 1: Create HeroCard (Next Session)**

```tsx
// frontend/src/components/learner/dashboard/HeroCard.tsx
'use client';

import { Calendar, Clock, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroCardProps {
  courseName: string;
  instructorName: string;
  sessionDate: string;
  sessionTime: string;
  onJoin?: () => void;
}

export function HeroCard({
  courseName,
  instructorName,
  sessionDate,
  sessionTime,
  onJoin,
}: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-seu-blue via-seu-cyan to-seu-purple p-8 text-white shadow-2xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <Video className="h-4 w-4" />
          <span>الجلسة القادمة</span>
        </div>

        <h2 className="mb-2 text-3xl font-bold">{courseName}</h2>
        <p className="mb-6 text-lg text-white/90">{instructorName}</p>

        <div className="mb-6 flex items-center gap-6 text-white/80">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>{sessionDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{sessionTime}</span>
          </div>
        </div>

        <button
          onClick={onJoin}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-seu-blue shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <Video className="h-5 w-5" />
          <span>الانضمام الآن</span>
        </button>
      </div>
    </motion.div>
  );
}
```

**Step 2: Create StatsRow**

```tsx
// frontend/src/components/learner/dashboard/StatsRow.tsx
'use client';

import { BookOpen, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsRowProps {
  activeCourses: number;
  completedCourses: number;
  overallProgress: number;
  certificatesEarned: number;
}

export function StatsRow({
  activeCourses,
  completedCourses,
  overallProgress,
  certificatesEarned,
}: StatsRowProps) {
  const stats = [
    {
      label: 'دورات نشطة',
      value: activeCourses,
      icon: BookOpen,
      color: 'seu-blue',
      bgColor: 'bg-seu-blue/10',
      textColor: 'text-seu-blue',
      borderColor: 'border-seu-blue',
    },
    {
      label: 'مكتملة',
      value: completedCourses,
      icon: CheckCircle2,
      color: 'seu-cyan',
      bgColor: 'bg-seu-cyan/10',
      textColor: 'text-seu-cyan',
      borderColor: 'border-seu-cyan',
    },
    {
      label: 'التقدم الإجمالي',
      value: `${overallProgress}%`,
      icon: TrendingUp,
      color: 'seu-purple',
      bgColor: 'bg-seu-purple/10',
      textColor: 'text-seu-purple',
      borderColor: 'border-seu-purple',
      isProgress: true,
      progressValue: overallProgress,
    },
    {
      label: 'شهادات',
      value: certificatesEarned,
      icon: Award,
      color: 'seu-orange',
      bgColor: 'bg-seu-orange/10',
      textColor: 'text-seu-orange',
      borderColor: 'border-seu-orange',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl border-2 ${stat.borderColor} bg-white p-6 shadow-sm`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              <div className={`rounded-lg ${stat.bgColor} p-2`}>
                <Icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold text-seu-navy`}>{stat.value}</p>
            {stat.isProgress && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progressValue}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan"
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
```

**Step 3: Create CourseCard**

```tsx
// frontend/src/components/learner/dashboard/CourseCard.tsx
'use client';

import Link from 'next/link';
import { Clock, ChevronLeft, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'UPCOMING';
  nextSession?: string;
  certificateReady?: boolean;
}

export function CourseCard({
  id,
  title,
  instructor,
  progress,
  status,
  nextSession,
  certificateReady,
}: CourseCardProps) {
  const statusConfig = {
    IN_PROGRESS: {
      gradient: 'from-seu-blue to-seu-cyan',
      label: 'قيد التقدم',
      textColor: 'text-white',
    },
    COMPLETED: {
      gradient: 'from-seu-cyan to-seu-lime',
      label: 'مكتمل',
      textColor: 'text-seu-navy',
    },
    UPCOMING: {
      gradient: 'from-seu-purple to-seu-blue',
      label: 'قادم',
      textColor: 'text-white',
    },
  };

  const config = statusConfig[status];

  return (
    <Link href={`/my-courses/${id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-seu-blue hover:shadow-lg"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-4 ${config.textColor}`}>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            {status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
            {config.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-5">
          <h3 className="mb-2 text-lg font-bold text-seu-navy group-hover:text-seu-blue">
            {title}
          </h3>
          <p className="mb-4 text-sm text-gray-600">{instructor}</p>

          {/* Progress Bar */}
          {status !== 'UPCOMING' && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">التقدم</span>
                <span className="font-bold text-seu-blue">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Info */}
          {nextSession && (
            <div className="flex items-center gap-2 rounded-lg bg-seu-orange/10 p-3">
              <Clock className="h-4 w-4 text-seu-orange" />
              <span className="text-sm font-medium text-seu-navy">{nextSession}</span>
            </div>
          )}

          {certificateReady && (
            <div className="flex items-center gap-2 rounded-lg bg-seu-cyan/10 p-3">
              <Award className="h-4 w-4 text-seu-cyan" />
              <span className="text-sm font-medium text-seu-navy">شهادة جاهزة للتحميل</span>
            </div>
          )}
        </div>

        {/* Hover Indicator */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-500 group-hover:bg-gray-50">
          <span>عرض التفاصيل</span>
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </div>
      </motion.div>
    </Link>
  );
}
```

**Step 4: Create index export**

```tsx
// frontend/src/components/learner/dashboard/index.ts
export { HeroCard } from './HeroCard';
export { StatsRow } from './StatsRow';
export { CourseCard } from './CourseCard';
```

**Step 5: Commit**

```bash
git add frontend/src/components/learner/dashboard/
git commit -m "feat(learner): add dashboard widgets (HeroCard, StatsRow, CourseCard)"
```

---

### Task 6: Create New Dashboard Page

**Files:**
- Create: `frontend/src/app/(learner)/dashboard/page.tsx`
- Create: `frontend/src/app/(learner)/layout.tsx`

**Step 1: Create learner layout with shell**

```tsx
// frontend/src/app/(learner)/layout.tsx
import { LearnerShell } from '@/components/learner';

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearnerShell>{children}</LearnerShell>;
}
```

**Step 2: Create dashboard page**

```tsx
// frontend/src/app/(learner)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/learner';
import { HeroCard, StatsRow, CourseCard } from '@/components/learner/dashboard';
import { Loader2 } from 'lucide-react';

interface Enrollment {
  id: string;
  status: string;
  progress: number;
  completionStatus: string | null;
  cohort: {
    id: string;
    nameAr: string;
    startDate: string;
    program: {
      titleAr: string;
      certificateEnabled: boolean;
    };
    instructor: {
      nameAr: string;
    } | null;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/my-courses`,
          { credentials: 'include' }
        );

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('فشل تحميل البيانات');
        }

        const data = await res.json();
        setEnrollments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-seu-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-seu-blue px-4 py-2 text-white"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeCourses = enrollments.filter(e => e.completionStatus === 'IN_PROGRESS').length;
  const completedCourses = enrollments.filter(e => e.completionStatus === 'COMPLETED').length;
  const certificatesEarned = enrollments.filter(
    e => e.completionStatus === 'COMPLETED' && e.cohort.program.certificateEnabled
  ).length;
  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  // Find next session (first in-progress course)
  const nextCourse = enrollments.find(e => e.completionStatus === 'IN_PROGRESS');

  return (
    <div className="min-h-full">
      <PageHeader
        title="لوحة التحكم"
        subtitle="مرحباً بك في منصة التعلم"
      />

      <div className="space-y-6 p-6">
        {/* Hero Card - Next Session */}
        {nextCourse && (
          <HeroCard
            courseName={nextCourse.cohort.program.titleAr}
            instructorName={nextCourse.cohort.instructor?.nameAr || 'المدرب'}
            sessionDate="اليوم"
            sessionTime="7:00 مساءً"
            onJoin={() => router.push(`/my-courses/${nextCourse.id}`)}
          />
        )}

        {/* Stats Row */}
        <StatsRow
          activeCourses={activeCourses}
          completedCourses={completedCourses}
          overallProgress={overallProgress}
          certificatesEarned={certificatesEarned}
        />

        {/* Course Cards */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-seu-navy">دوراتي</h2>

          {enrollments.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">لم تلتحق بأي دورة بعد</p>
              <button
                onClick={() => router.push('/programs')}
                className="mt-4 rounded-lg bg-seu-blue px-6 py-2 text-white"
              >
                تصفح الدورات
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  id={enrollment.id}
                  title={enrollment.cohort.program.titleAr}
                  instructor={enrollment.cohort.instructor?.nameAr || 'المدرب'}
                  progress={enrollment.progress}
                  status={
                    enrollment.completionStatus === 'COMPLETED'
                      ? 'COMPLETED'
                      : enrollment.completionStatus === 'IN_PROGRESS'
                        ? 'IN_PROGRESS'
                        : 'UPCOMING'
                  }
                  certificateReady={
                    enrollment.completionStatus === 'COMPLETED' &&
                    enrollment.cohort.program.certificateEnabled
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add frontend/src/app/\(learner\)/
git commit -m "feat(learner): create dashboard page with LearnerShell layout"
```

---

## Phase 3: Course Hub with Tabs

### Task 7: Create Tab Components

**Files:**
- Create: `frontend/src/components/learner/course/CourseTabs.tsx`
- Create: `frontend/src/components/learner/course/CourseHeader.tsx`
- Create: `frontend/src/components/learner/course/index.ts`

**Step 1: Create CourseTabs component**

```tsx
// frontend/src/components/learner/course/CourseTabs.tsx
'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: number;
  content: ReactNode;
}

interface CourseTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function CourseTabs({ tabs, defaultTab }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div>
      {/* Tab List */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex gap-1 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all ${
                  isActive
                    ? 'bg-seu-blue text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-white/20' : 'bg-seu-orange text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-seu-blue"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6"
      >
        {activeContent}
      </motion.div>
    </div>
  );
}
```

**Step 2: Create CourseHeader component**

```tsx
// frontend/src/components/learner/course/CourseHeader.tsx
'use client';

import { Award, Users, Clock } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  instructor: string;
  cohortName: string;
  progress: number;
  totalHours: number;
  certificateEnabled: boolean;
}

export function CourseHeader({
  title,
  instructor,
  cohortName,
  progress,
  totalHours,
  certificateEnabled,
}: CourseHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-seu-navy">{title}</h1>
          <p className="mt-1 text-gray-600">{instructor} • {cohortName}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{totalHours} ساعة</span>
          </div>
          {certificateEnabled && (
            <div className="flex items-center gap-1 text-seu-cyan">
              <Award className="h-4 w-4" />
              <span>شهادة معتمدة</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">التقدم الإجمالي</span>
          <span className="font-bold text-seu-blue">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create index export**

```tsx
// frontend/src/components/learner/course/index.ts
export { CourseTabs } from './CourseTabs';
export { CourseHeader } from './CourseHeader';
```

**Step 4: Commit**

```bash
git add frontend/src/components/learner/course/
git commit -m "feat(learner): add course hub components (CourseTabs, CourseHeader)"
```

---

### Task 8: Create Tab Content Components

**Files:**
- Create: `frontend/src/components/learner/course/tabs/OverviewTab.tsx`
- Create: `frontend/src/components/learner/course/tabs/ProgressTab.tsx`
- Create: `frontend/src/components/learner/course/tabs/MessagesTab.tsx`
- Create: `frontend/src/components/learner/course/tabs/MaterialsTab.tsx`
- Create: `frontend/src/components/learner/course/tabs/index.ts`

**Step 1: Create OverviewTab**

```tsx
// frontend/src/components/learner/course/tabs/OverviewTab.tsx
'use client';

import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface Module {
  id: string;
  titleAr: string;
  sessions: {
    id: string;
    titleAr: string;
    durationMinutes: number;
    isCompleted: boolean;
  }[];
}

interface OverviewTabProps {
  modules: Module[];
  instructorName: string;
  instructorBio?: string;
  instructorImage?: string;
}

export function OverviewTab({
  modules,
  instructorName,
  instructorBio,
  instructorImage,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Curriculum */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-seu-navy">المنهج الدراسي</h2>
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <div
              key={module.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="bg-gray-50 px-4 py-3">
                <h3 className="font-bold text-seu-navy">
                  الوحدة {moduleIndex + 1}: {module.titleAr}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {module.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    {session.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-seu-cyan" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                    <span className={session.isCompleted ? 'text-gray-600' : 'text-gray-900'}>
                      {session.titleAr}
                    </span>
                    <span className="mr-auto text-sm text-gray-500">
                      {session.durationMinutes} دقيقة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instructor */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-seu-navy">عن المدرب</h2>
        <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6">
          {instructorImage ? (
            <img
              src={instructorImage}
              alt={instructorName}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-seu-blue to-seu-purple text-2xl font-bold text-white">
              {instructorName.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-seu-navy">{instructorName}</h3>
            <p className="mt-2 text-gray-600">{instructorBio || 'مدرب معتمد'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

**Step 2: Create ProgressTab**

```tsx
// frontend/src/components/learner/course/tabs/ProgressTab.tsx
'use client';

import { CheckCircle2, XCircle, Clock, Award, AlertTriangle } from 'lucide-react';

interface AttendanceRecord {
  sessionId: string;
  sessionTitleAr: string;
  sessionDate: string;
  status: 'ATTENDED' | 'ABSENT' | 'EXCUSED' | 'PENDING';
}

interface ProgressTabProps {
  attendancePercentage: number;
  requiredPercentage: number;
  certificateEligible: boolean;
  records: AttendanceRecord[];
}

export function ProgressTab({
  attendancePercentage,
  requiredPercentage,
  certificateEligible,
  records,
}: ProgressTabProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ATTENDED':
        return { icon: CheckCircle2, color: 'text-seu-cyan', bg: 'bg-seu-cyan/10', label: 'حضر' };
      case 'ABSENT':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'غائب' };
      case 'EXCUSED':
        return { icon: AlertTriangle, color: 'text-seu-orange', bg: 'bg-seu-orange/10', label: 'معذور' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100', label: 'قادم' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-seu-blue bg-white p-6">
          <p className="text-sm text-gray-600">نسبة الحضور</p>
          <p className={`text-3xl font-bold ${
            attendancePercentage >= requiredPercentage ? 'text-seu-cyan' : 'text-seu-orange'
          }`}>
            {attendancePercentage}%
          </p>
          <p className="mt-1 text-xs text-gray-500">المطلوب: {requiredPercentage}%</p>
        </div>

        <div className="rounded-xl border-2 border-seu-cyan bg-white p-6">
          <p className="text-sm text-gray-600">الجلسات المحضورة</p>
          <p className="text-3xl font-bold text-seu-navy">
            {records.filter(r => r.status === 'ATTENDED').length} / {records.length}
          </p>
        </div>

        <div className={`rounded-xl border-2 p-6 ${
          certificateEligible ? 'border-seu-cyan bg-seu-cyan/5' : 'border-gray-200 bg-white'
        }`}>
          <p className="text-sm text-gray-600">حالة الشهادة</p>
          <div className="mt-1 flex items-center gap-2">
            <Award className={`h-6 w-6 ${certificateEligible ? 'text-seu-cyan' : 'text-gray-400'}`} />
            <span className={`font-bold ${certificateEligible ? 'text-seu-cyan' : 'text-gray-500'}`}>
              {certificateEligible ? 'مؤهل للشهادة' : 'غير مؤهل بعد'}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h3 className="font-bold text-seu-navy">سجل الحضور</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {records.map((record) => {
            const config = getStatusConfig(record.status);
            const Icon = config.icon;

            return (
              <div key={record.sessionId} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{record.sessionTitleAr}</p>
                  <p className="text-sm text-gray-500">{record.sessionDate}</p>
                </div>
                <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${config.bg}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create MessagesTab**

```tsx
// frontend/src/components/learner/course/tabs/MessagesTab.tsx
'use client';

import { useState } from 'react';
import { Mail, MailOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  instructorName: string;
  isRead: boolean;
}

interface MessagesTabProps {
  messages: Message[];
  onMarkAsRead: (messageId: string) => void;
}

export function MessagesTab({ messages, onMarkAsRead }: MessagesTabProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      onMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <Mail className="mx-auto h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">لا توجد رسائل حتى الآن</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Message List */}
      <div className="space-y-2 lg:col-span-1">
        {messages.map((message) => (
          <button
            key={message.id}
            onClick={() => handleMessageClick(message)}
            className={`w-full cursor-pointer rounded-xl border-2 p-4 text-right transition-all ${
              selectedMessage?.id === message.id
                ? 'border-seu-blue bg-seu-blue/5'
                : message.isRead
                  ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  : 'border-seu-blue/30 bg-seu-blue/5 hover:border-seu-blue/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {message.isRead ? (
                <MailOpen className="mt-1 h-5 w-5 text-gray-400" />
              ) : (
                <Mail className="mt-1 h-5 w-5 text-seu-blue" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`truncate font-semibold ${
                  message.isRead ? 'text-gray-700' : 'text-seu-navy'
                }`}>
                  {message.subject}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDate(message.sentAt)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Message Content */}
      <div className="lg:col-span-2">
        {selectedMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-seu-navy">{selectedMessage.subject}</h2>
              <p className="mt-2 text-sm text-gray-600">
                من: {selectedMessage.instructorName} • {formatDate(selectedMessage.sentAt)}
              </p>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
              {selectedMessage.message}
            </div>
          </motion.div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <Mail className="mx-auto h-16 w-16 text-gray-300" />
              <p className="mt-4 text-gray-500">اختر رسالة لعرضها</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Create MaterialsTab**

```tsx
// frontend/src/components/learner/course/tabs/MaterialsTab.tsx
'use client';

import { FileText, Video, Link as LinkIcon, Download, ExternalLink } from 'lucide-react';

interface Material {
  id: string;
  titleAr: string;
  type: 'PDF' | 'VIDEO' | 'DOCUMENT' | 'LINK' | 'PRESENTATION';
  url: string;
  sizeBytes?: number;
}

interface MaterialsTabProps {
  materials: Material[];
}

export function MaterialsTab({ materials }: MaterialsTabProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'PDF':
        return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
      case 'VIDEO':
        return { icon: Video, color: 'text-seu-purple', bg: 'bg-seu-purple/10' };
      case 'LINK':
        return { icon: LinkIcon, color: 'text-seu-blue', bg: 'bg-seu-blue/10' };
      default:
        return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (materials.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <FileText className="mx-auto h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">لا توجد مواد متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => {
        const config = getTypeConfig(material.type);
        const Icon = config.icon;
        const isExternal = material.type === 'LINK';

        return (
          <a
            key={material.id}
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-seu-blue hover:shadow-md"
          >
            <div className={`rounded-lg p-3 ${config.bg}`}>
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-seu-blue">
                {material.titleAr}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {material.type} {material.sizeBytes && `• ${formatFileSize(material.sizeBytes)}`}
              </p>
            </div>
            {isExternal ? (
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-seu-blue" />
            ) : (
              <Download className="h-5 w-5 text-gray-400 group-hover:text-seu-blue" />
            )}
          </a>
        );
      })}
    </div>
  );
}
```

**Step 5: Create index export**

```tsx
// frontend/src/components/learner/course/tabs/index.ts
export { OverviewTab } from './OverviewTab';
export { ProgressTab } from './ProgressTab';
export { MessagesTab } from './MessagesTab';
export { MaterialsTab } from './MaterialsTab';
```

**Step 6: Update course index**

```tsx
// frontend/src/components/learner/course/index.ts
export { CourseTabs } from './CourseTabs';
export { CourseHeader } from './CourseHeader';
export * from './tabs';
```

**Step 7: Commit**

```bash
git add frontend/src/components/learner/course/
git commit -m "feat(learner): add course hub tab content components"
```

---

### Task 9: Create Course Hub Page

**Files:**
- Create: `frontend/src/app/(learner)/my-courses/[id]/page.tsx`
- Create: `frontend/src/app/(learner)/my-courses/page.tsx`

**Step 1: Create course hub page with tabs**

```tsx
// frontend/src/app/(learner)/my-courses/[id]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, TrendingUp, Mail, FileText, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/learner';
import { CourseHeader, CourseTabs, OverviewTab, ProgressTab, MessagesTab, MaterialsTab } from '@/components/learner/course';

interface CourseDetail {
  id: string;
  progress: number;
  cohort: {
    id: string;
    nameAr: string;
    program: {
      titleAr: string;
      totalHours: number;
      certificateEnabled: boolean;
      certificateAttendanceThreshold: number;
    };
    instructor: { nameAr: string; bio?: string; imageUrl?: string } | null;
  };
  curriculum: {
    id: string;
    titleAr: string;
    sessions: { id: string; titleAr: string; durationMinutes: number }[];
  }[];
}

interface AttendanceData {
  overallPercentage: number;
  requiredPercentage: number;
  certificateEligible: boolean;
  records: {
    sessionId: string;
    sessionTitleAr: string;
    sessionDate: string;
    status: 'ATTENDED' | 'ABSENT' | 'EXCUSED' | 'PENDING';
  }[];
}

interface Message {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  instructor: { nameAr: string } | null;
  isRead: boolean;
}

interface Material {
  id: string;
  titleAr: string;
  type: 'PDF' | 'VIDEO' | 'DOCUMENT' | 'LINK' | 'PRESENTATION';
  url: string;
  sizeBytes?: number;
}

export default function CourseHubPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const enrollmentId = resolvedParams.id;

  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // Fetch all data in parallel
        const [detailRes, attendanceRes, materialsRes] = await Promise.all([
          fetch(`${apiUrl}/api/enrollments/${enrollmentId}/details`, { credentials: 'include' }),
          fetch(`${apiUrl}/api/enrollments/${enrollmentId}/attendance`, { credentials: 'include' }),
          fetch(`${apiUrl}/api/enrollments/${enrollmentId}/materials`, { credentials: 'include' }),
        ]);

        if (!detailRes.ok) {
          if (detailRes.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('فشل تحميل البيانات');
        }

        const detailData = await detailRes.json();
        setCourseDetail(detailData);

        if (attendanceRes.ok) {
          setAttendance(await attendanceRes.json());
        }

        if (materialsRes.ok) {
          setMaterials(await materialsRes.json());
        }

        // Fetch messages using cohortId from detail
        const cohortId = detailData.cohort.id;
        const [messagesRes, unreadRes] = await Promise.all([
          fetch(`${apiUrl}/api/cohorts/${cohortId}/messages`, { credentials: 'include' }),
          fetch(`${apiUrl}/api/cohorts/${cohortId}/messages/unread-count`, { credentials: 'include' }),
        ]);

        if (messagesRes.ok) {
          setMessages(await messagesRes.json());
        }

        if (unreadRes.ok) {
          const { count } = await unreadRes.json();
          setUnreadCount(count);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enrollmentId, router]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${messageId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent fail
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-seu-blue" />
      </div>
    );
  }

  if (error || !courseDetail) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'البرنامج غير موجود'}</p>
          <button
            onClick={() => router.push('/my-courses')}
            className="mt-4 rounded-lg bg-seu-blue px-4 py-2 text-white"
          >
            العودة لدوراتي
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: BookOpen,
      content: (
        <OverviewTab
          modules={courseDetail.curriculum.map((mod) => ({
            ...mod,
            sessions: mod.sessions.map((s) => ({ ...s, isCompleted: false })),
          }))}
          instructorName={courseDetail.cohort.instructor?.nameAr || 'المدرب'}
          instructorBio={courseDetail.cohort.instructor?.bio}
          instructorImage={courseDetail.cohort.instructor?.imageUrl}
        />
      ),
    },
    {
      id: 'progress',
      label: 'التقدم',
      icon: TrendingUp,
      content: attendance ? (
        <ProgressTab
          attendancePercentage={attendance.overallPercentage}
          requiredPercentage={attendance.requiredPercentage}
          certificateEligible={attendance.certificateEligible}
          records={attendance.records}
        />
      ) : (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ),
    },
    {
      id: 'messages',
      label: 'الرسائل',
      icon: Mail,
      badge: unreadCount,
      content: (
        <MessagesTab
          messages={messages.map((m) => ({
            ...m,
            instructorName: m.instructor?.nameAr || 'المدرب',
          }))}
          onMarkAsRead={handleMarkAsRead}
        />
      ),
    },
    {
      id: 'materials',
      label: 'المواد',
      icon: FileText,
      content: <MaterialsTab materials={materials} />,
    },
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        title={courseDetail.cohort.program.titleAr}
        breadcrumbs={[
          { label: 'دوراتي', href: '/my-courses' },
          { label: courseDetail.cohort.program.titleAr },
        ]}
      />

      <CourseHeader
        title={courseDetail.cohort.program.titleAr}
        instructor={courseDetail.cohort.instructor?.nameAr || 'المدرب'}
        cohortName={courseDetail.cohort.nameAr}
        progress={courseDetail.progress}
        totalHours={courseDetail.cohort.program.totalHours}
        certificateEnabled={courseDetail.cohort.program.certificateEnabled}
      />

      <CourseTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
```

**Step 2: Create my-courses list page**

```tsx
// frontend/src/app/(learner)/my-courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/learner';
import { CourseCard } from '@/components/learner/dashboard';

interface Enrollment {
  id: string;
  progress: number;
  completionStatus: string | null;
  cohort: {
    program: {
      titleAr: string;
      certificateEnabled: boolean;
    };
    instructor: { nameAr: string } | null;
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/my-courses`,
          { credentials: 'include' }
        );

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch');
        }

        setEnrollments(await res.json());
      } catch {
        // Error handling
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-seu-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="دوراتي"
        subtitle={`${enrollments.length} دورة مسجلة`}
      />

      <div className="p-6">
        {enrollments.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">لم تلتحق بأي دورة بعد</p>
            <button
              onClick={() => router.push('/programs')}
              className="mt-4 rounded-lg bg-seu-blue px-6 py-2 text-white"
            >
              تصفح الدورات
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                id={enrollment.id}
                title={enrollment.cohort.program.titleAr}
                instructor={enrollment.cohort.instructor?.nameAr || 'المدرب'}
                progress={enrollment.progress}
                status={
                  enrollment.completionStatus === 'COMPLETED'
                    ? 'COMPLETED'
                    : enrollment.completionStatus === 'IN_PROGRESS'
                      ? 'IN_PROGRESS'
                      : 'UPCOMING'
                }
                certificateReady={
                  enrollment.completionStatus === 'COMPLETED' &&
                  enrollment.cohort.program.certificateEnabled
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add frontend/src/app/\(learner\)/my-courses/
git commit -m "feat(learner): create course hub with tab-based navigation"
```

---

## Phase 4: Cleanup & Polish

### Task 10: Update Main Component Exports

**Files:**
- Modify: `frontend/src/components/learner/index.ts`

**Step 1: Update main export**

```tsx
// frontend/src/components/learner/index.ts
export { Sidebar } from './Sidebar';
export { LearnerShell } from './LearnerShell';
export { Breadcrumbs } from './Breadcrumbs';
export { PageHeader } from './PageHeader';
export * from './dashboard';
export * from './course';
```

**Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no errors

**Step 3: Commit**

```bash
git add frontend/src/components/learner/
git commit -m "chore(learner): consolidate component exports"
```

---

### Task 11: Final Integration Test

**Step 1: Start development server**

```bash
cd frontend && npm run dev &
cd backend && npm run start:dev &
```

**Step 2: Manual verification checklist**

- [ ] Navigate to `/dashboard` - should show sidebar + dashboard widgets
- [ ] Click course card - should navigate to course hub with tabs
- [ ] Switch between tabs - should be instant (no page reload)
- [ ] Sidebar navigation highlights active page
- [ ] Mobile: hamburger menu opens sidebar
- [ ] Breadcrumbs navigate correctly

**Step 3: Stop dev servers and commit summary**

```bash
git add .
git commit -m "feat(learner-ux): complete UX refactor with sidebar and tab-based course hub

- Add LearnerShell with persistent sidebar navigation
- Create dashboard with HeroCard, StatsRow, CourseCard widgets
- Implement tab-based course hub (Overview, Progress, Messages, Materials)
- Add PageHeader with breadcrumbs
- Mobile-responsive sidebar with hamburger menu
- SEU brand colors throughout"
```

---

## Summary

| Phase | Tasks | Key Deliverables |
|-------|-------|------------------|
| Phase 1 | Tasks 1-4 | Sidebar, LearnerShell, Breadcrumbs, PageHeader |
| Phase 2 | Tasks 5-6 | Dashboard widgets, Dashboard page |
| Phase 3 | Tasks 7-9 | CourseTabs, Tab content components, Course hub page |
| Phase 4 | Tasks 10-11 | Export cleanup, Integration testing |

**Total: 11 tasks**

**Architecture Decisions:**
- Use Next.js route groups `(learner)` for layout isolation
- Client-side tab switching for instant UX
- Parallel data fetching with Promise.all()
- Framer Motion for smooth transitions
- SEU brand colors from existing tailwind config
