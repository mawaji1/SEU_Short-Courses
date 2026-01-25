'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, GraduationCap } from 'lucide-react';
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

        setEnrollments(await res.json());
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
          <p className="text-gray-600">جاري تحميل الدورات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">دوراتي</h1>
            <p className="text-gray-600">{enrollments.length} دورة مسجلة</p>
          </div>
        </div>
      </motion.div>

      <div>
        {enrollments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <GraduationCap className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">لم تلتحق بأي دورة بعد</h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              استكشف مجموعة البرامج التدريبية المتميزة وابدأ رحلتك في التعلم
            </p>
            <button
              onClick={() => router.push('/programs')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-primary-dark hover:shadow-xl"
            >
              تصفح الدورات
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
