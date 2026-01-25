'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Mail, FileText, Loader2, ChevronRight } from 'lucide-react';
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
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">جاري تحميل تفاصيل الدورة...</p>
        </div>
      </div>
    );
  }

  if (error || !courseDetail) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <BookOpen className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mb-3 text-xl font-bold text-gray-900">حدث خطأ</h2>
          <p className="mb-6 text-gray-600">{error || 'البرنامج غير موجود'}</p>
          <button
            onClick={() => router.push('/my-courses')}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            العودة لدوراتي
          </button>
        </div>
      </div>
    );
  }

  // Get instructor info with proper fallback
  const instructor = courseDetail.cohort.instructor;
  const instructorName = instructor?.nameAr;
  const hasInstructor = !!instructorName;

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
          instructorName={instructorName}
          instructorBio={instructor?.bio}
          instructorImage={instructor?.imageUrl}
          hasInstructor={hasInstructor}
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
            instructorName: m.instructor?.nameAr,
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-gray-600"
        aria-label="التنقل"
      >
        <Link href="/my-courses" className="hover:text-primary transition-colors">
          دوراتي
        </Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-gray-900 font-medium">{courseDetail.cohort.program.titleAr}</span>
      </motion.nav>

      <CourseHeader
        title={courseDetail.cohort.program.titleAr}
        instructorName={instructorName}
        hasInstructor={hasInstructor}
        cohortName={courseDetail.cohort.nameAr}
        progress={courseDetail.progress}
        totalHours={courseDetail.cohort.program.totalHours}
        certificateEnabled={courseDetail.cohort.program.certificateEnabled}
      />

      <CourseTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
