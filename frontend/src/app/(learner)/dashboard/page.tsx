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
