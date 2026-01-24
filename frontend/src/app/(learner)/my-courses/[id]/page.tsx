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
