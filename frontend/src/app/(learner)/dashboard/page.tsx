'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  ChevronLeft,
  PlayCircle,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
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
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Sparkles className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">حدث خطأ</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
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
  const pendingCourses = enrollments.filter(e => !e.completionStatus || e.completionStatus === 'NOT_STARTED').length;

  // Find next session (first in-progress course)
  const nextCourse = enrollments.find(e => e.completionStatus === 'IN_PROGRESS');

  const statsCards = [
    {
      label: 'برامج نشطة',
      value: activeCourses,
      icon: GraduationCap,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'في انتظار البدء',
      value: pendingCourses,
      icon: Clock,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'مكتملة',
      value: completedCourses,
      icon: Award,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'شهادات',
      value: certificatesEarned,
      icon: Award,
      bgColor: 'bg-accent/10',
      iconColor: 'text-accent',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark p-8 text-white shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/30" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20" />
          <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-white/10" />
        </div>

        <div className="relative z-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>بوابة المتدرب</span>
          </div>

          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            مرحباً، {user?.firstName}! 👋
          </h1>
          <p className="mb-6 text-lg text-white/90">
            استمر في رحلتك التدريبية واكتسب مهارات جديدة
          </p>

          {nextCourse ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/70">الجلسة القادمة</p>
                  <p className="font-bold">{nextCourse.cohort.program.titleAr}</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/my-courses/${nextCourse.id}`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <PlayCircle className="h-5 w-5" />
                <span>الذهاب للدورة</span>
              </button>
            </div>
          ) : (
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <BookOpen className="h-5 w-5" />
              <span>تصفح البرامج</span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* My Courses Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">دوراتي</h2>
          <Link
            href="/my-courses"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition-all hover:border-primary hover:text-primary"
          >
            عرض الكل
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              لم تسجل في أي برنامج بعد
            </h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              استكشف مجموعة البرامج التدريبية المتميزة وابدأ رحلتك في التعلم
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-primary-dark hover:shadow-xl"
            >
              استكشف البرامج
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.slice(0, 6).map((enrollment, index) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link href={`/my-courses/${enrollment.id}`}>
                  <div className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg">
                    {/* Header with Status */}
                    <div className={`p-4 ${
                      enrollment.completionStatus === 'COMPLETED'
                        ? 'bg-gradient-to-r from-accent to-accent-light text-primary-dark'
                        : enrollment.completionStatus === 'IN_PROGRESS'
                          ? 'bg-gradient-to-r from-primary to-accent text-white'
                          : 'bg-gradient-to-r from-primary-dark to-primary text-white'
                    }`}>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                        {enrollment.completionStatus === 'COMPLETED' && (
                          <>
                            <Award className="h-3 w-3" />
                            مكتمل
                          </>
                        )}
                        {enrollment.completionStatus === 'IN_PROGRESS' && (
                          <>
                            <PlayCircle className="h-3 w-3" />
                            قيد التقدم
                          </>
                        )}
                        {(!enrollment.completionStatus || enrollment.completionStatus === 'NOT_STARTED') && (
                          <>
                            <Clock className="h-3 w-3" />
                            قادم
                          </>
                        )}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-primary">
                        {enrollment.cohort.program.titleAr}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        {enrollment.cohort.instructor?.nameAr || 'المدرب'}
                      </p>

                      {/* Progress Bar */}
                      {enrollment.completionStatus !== 'NOT_STARTED' && (
                        <div className="mb-4">
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">التقدم</span>
                            <span className="font-bold text-primary">{enrollment.progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Start Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {new Date(enrollment.cohort.startDate).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-500 group-hover:bg-gray-50">
                      <span>عرض التفاصيل</span>
                      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
