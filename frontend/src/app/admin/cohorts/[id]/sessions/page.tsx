'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Plus,
  Video,
  Calendar,
  Clock,
  Users,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import {
  TrainingSession,
  CreateSessionDto,
  sessionService,
} from '@/services/session';

interface Cohort {
  id: string;
  nameAr: string;
  nameEn: string;
  program: {
    id: string;
    titleAr: string;
    titleEn: string;
  };
  instructor?: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function CohortSessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const cohortId = resolvedParams.id;

  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructorId: '',
    startTime: '',
    duration: 60,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // Fetch cohort and sessions
        const [cohortRes, sessionsData, instructorsRes] = await Promise.all([
          fetch(`${apiUrl}/api/cohorts/${cohortId}`, { credentials: 'include' }),
          sessionService.getCohortSessions(cohortId),
          fetch(`${apiUrl}/api/auth/users?role=INSTRUCTOR`, { credentials: 'include' }),
        ]);

        if (!cohortRes.ok) {
          if (cohortRes.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('فشل تحميل بيانات الدفعة');
        }

        const cohortData = await cohortRes.json();
        setCohort(cohortData);
        setSessions(sessionsData);

        if (instructorsRes.ok) {
          const instructorsData = await instructorsRes.json();
          setInstructors(instructorsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cohortId, router]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.instructorId || !formData.startTime) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setCreating(true);
    try {
      const newSession = await sessionService.createSession({
        cohortId,
        title: formData.title,
        description: formData.description || undefined,
        instructorId: formData.instructorId,
        startTime: new Date(formData.startTime).toISOString(),
        duration: formData.duration,
      });

      setSessions((prev) => [...prev, newSession]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        instructorId: '',
        startTime: '',
        duration: 60,
      });
    } catch {
      alert('فشل إنشاء الجلسة. يرجى المحاولة مرة أخرى.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذه الجلسة؟')) {
      return;
    }

    setDeletingId(sessionId);
    try {
      await sessionService.cancelSession(sessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, status: 'CANCELLED' as const } : s
        )
      );
    } catch {
      alert('فشل إلغاء الجلسة');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusInfo = (status: TrainingSession['status']) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'انتهت', color: 'bg-gray-100 text-gray-600', icon: CheckCircle };
      case 'CANCELLED':
        return { label: 'ملغية', color: 'bg-red-100 text-red-600', icon: XCircle };
      case 'IN_PROGRESS':
        return { label: 'جارية', color: 'bg-green-100 text-green-600', icon: PlayCircle };
      case 'SCHEDULED':
        return { label: 'مجدولة', color: 'bg-blue-100 text-blue-600', icon: Calendar };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-600', icon: Calendar };
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error || !cohort) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-gray-600">{error || 'الدفعة غير موجودة'}</p>
          <Link
            href="/admin/cohorts"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-white"
          >
            العودة للدفعات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/cohorts" className="hover:text-primary transition-colors">
          الدفعات
        </Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-gray-900 font-medium">{cohort.nameAr}</span>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-gray-900 font-medium">الجلسات</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">جلسات التدريب</h1>
          <p className="mt-1 text-gray-600">
            {cohort.program.titleAr} - {cohort.nameAr}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-5 w-5" />
          إضافة جلسة
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreateForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="w-full max-w-lg rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              إضافة جلسة جديدة
            </h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  عنوان الجلسة *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="مثال: الجلسة الأولى - مقدمة"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="وصف مختصر للجلسة (اختياري)"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  المدرب *
                </label>
                <select
                  value={formData.instructorId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, instructorId: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                >
                  <option value="">اختر المدرب</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.firstName} {instructor.lastName} ({instructor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    تاريخ ووقت البدء *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    المدة (بالدقائق) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 60,
                      }))
                    }
                    required
                    min={15}
                    max={480}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    'إنشاء الجلسة'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Video className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            لا توجد جلسات
          </h3>
          <p className="text-gray-500">
            لم يتم إنشاء أي جلسات تدريب لهذه الدفعة بعد
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => {
            const status = getStatusInfo(session.status);
            const StatusIcon = status.icon;
            const isDeleting = deletingId === session.id;

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-gray-900">{session.title}</h3>
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(session.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(session.startTime)} ({session.duration} دقيقة)
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.instructor.firstName} {session.instructor.lastName}
                      </span>
                    </div>
                    {session.description && (
                      <p className="text-sm text-gray-500">{session.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/sessions/${session.id}/attendance`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      الحضور
                    </Link>
                    {session.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCancelSession(session.id)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        إلغاء
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
