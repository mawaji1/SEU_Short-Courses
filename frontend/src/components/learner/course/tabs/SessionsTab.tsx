'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import { TrainingSession } from '@/services/session';

interface SessionsTabProps {
  sessions: TrainingSession[];
  onJoinSession: (sessionId: string) => Promise<void>;
}

export function SessionsTab({ sessions, onJoinSession }: SessionsTabProps) {
  const [loadingSession, setLoadingSession] = useState<string | null>(null);

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

    // Can join 15 minutes before start
    const canJoinTime = new Date(startTime.getTime() - 15 * 60 * 1000);

    switch (session.status) {
      case 'COMPLETED':
        return {
          label: 'انتهت',
          color: 'bg-gray-100 text-gray-600',
          icon: CheckCircle,
          canJoin: false,
        };
      case 'CANCELLED':
        return {
          label: 'ملغية',
          color: 'bg-red-100 text-red-600',
          icon: XCircle,
          canJoin: false,
        };
      case 'IN_PROGRESS':
        return {
          label: 'جارية الآن',
          color: 'bg-green-100 text-green-600',
          icon: PlayCircle,
          canJoin: true,
        };
      case 'SCHEDULED':
        if (now >= canJoinTime && now <= endTime) {
          return {
            label: 'متاحة للانضمام',
            color: 'bg-green-100 text-green-600',
            icon: PlayCircle,
            canJoin: true,
          };
        }
        return {
          label: 'قادمة',
          color: 'bg-blue-100 text-blue-600',
          icon: Calendar,
          canJoin: false,
        };
      default:
        return {
          label: session.status,
          color: 'bg-gray-100 text-gray-600',
          icon: Calendar,
          canJoin: false,
        };
    }
  };

  const handleJoinClick = async (sessionId: string) => {
    setLoadingSession(sessionId);
    try {
      await onJoinSession(sessionId);
    } finally {
      setLoadingSession(null);
    }
  };

  // Separate sessions into upcoming/current and completed
  const now = new Date();
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS'
  );
  const completedSessions = sessions.filter(
    (s) => s.status === 'COMPLETED' || s.status === 'CANCELLED'
  );

  if (sessions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Video className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">لا توجد جلسات مباشرة</h3>
        <p className="text-gray-500">سيتم إضافة جلسات التدريب المباشرة قريباً</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upcoming/Current Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            الجلسات القادمة ({upcomingSessions.length})
          </h3>
          <div className="space-y-4">
            {upcomingSessions.map((session, index) => {
              const status = getStatusInfo(session);
              const StatusIcon = status.icon;
              const isLoading = loadingSession === session.id;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{session.title}</h4>
                          <p className="text-sm text-gray-500">
                            المدرب: {session.instructor.firstName} {session.instructor.lastName}
                          </p>
                        </div>
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
                      </div>
                      {session.description && (
                        <p className="text-sm text-gray-500">{session.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                      </span>
                      {status.canJoin && (
                        <button
                          onClick={() => handleJoinClick(session.id)}
                          disabled={isLoading}
                          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              جاري التحميل...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4" />
                              انضم للجلسة
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
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            الجلسات السابقة ({completedSessions.length})
          </h3>
          <div className="space-y-3">
            {completedSessions.map((session, index) => {
              const status = getStatusInfo(session);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-700">{session.title}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(session.startTime)} - {formatTime(session.startTime)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
