'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  ChevronRight,
  Loader2,
  PlayCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { TrainingSession, sessionService } from '@/services/session';

export default function InstructorSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await sessionService.getInstructorSessions();
        setSessions(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'فشل تحميل الجلسات');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router]);

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

  const getStatusInfo = (session: TrainingSession) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(startTime.getTime() + session.duration * 60 * 1000);
    const canStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);

    switch (session.status) {
      case 'COMPLETED':
        return {
          label: 'انتهت',
          color: 'bg-gray-100 text-gray-600',
          icon: CheckCircle,
          canStart: false,
        };
      case 'CANCELLED':
        return {
          label: 'ملغية',
          color: 'bg-red-100 text-red-600',
          icon: AlertCircle,
          canStart: false,
        };
      case 'IN_PROGRESS':
        return {
          label: 'جارية الآن',
          color: 'bg-green-100 text-green-600',
          icon: PlayCircle,
          canStart: true,
        };
      case 'SCHEDULED':
        if (now >= canStartTime && now <= endTime) {
          return {
            label: 'جاهزة للبدء',
            color: 'bg-green-100 text-green-600',
            icon: PlayCircle,
            canStart: true,
          };
        }
        return {
          label: 'قادمة',
          color: 'bg-blue-100 text-blue-600',
          icon: Calendar,
          canStart: false,
        };
      default:
        return {
          label: session.status,
          color: 'bg-gray-100 text-gray-600',
          icon: Calendar,
          canStart: false,
        };
    }
  };

  const handleStartSession = async (sessionId: string) => {
    setStartingSession(sessionId);
    try {
      const startUrl = await sessionService.getStartUrl(sessionId);
      window.open(startUrl, '_blank', 'noopener,noreferrer');
    } catch {
      alert('فشل في الحصول على رابط البدء. يرجى المحاولة مرة أخرى.');
    } finally {
      setStartingSession(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">جاري تحميل الجلسات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-white"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Separate sessions by status
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS'
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">جلساتي</h1>
          <p className="mt-1 text-gray-600">إدارة جلسات التدريب المباشرة</p>
        </div>
      </div>

      {/* Sessions Grid */}
      {upcomingSessions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Video className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            لا توجد جلسات قادمة
          </h3>
          <p className="text-gray-500">
            ستظهر هنا الجلسات المجدولة التي تم تعيينك لها
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingSessions.map((session, index) => {
            const status = getStatusInfo(session);
            const StatusIcon = status.icon;
            const isStarting = startingSession === session.id;

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.title}
                          </h3>
                          <span
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600">
                          {session.cohort.program.titleAr} - {session.cohort.nameAr}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(session.startTime)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatTime(session.startTime)} ({session.duration} دقيقة)
                      </span>
                    </div>

                    {session.description && (
                      <p className="text-sm text-gray-500">{session.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/sessions/${session.id}/attendance`}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Users className="h-4 w-4" />
                      الحضور
                    </Link>

                    {status.canStart && (
                      <button
                        onClick={() => handleStartSession(session.id)}
                        disabled={isStarting}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isStarting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري التحميل...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4" />
                            ابدأ الجلسة
                          </>
                        )}
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
