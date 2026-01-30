'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  TrainingSession,
  AttendanceRecord,
  AttendanceSummary,
  sessionService,
} from '@/services/session';

export default function SessionAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const sessionId = resolvedParams.id;

  const [session, setSession] = useState<TrainingSession | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    try {
      const [sessionData, attendanceData, summaryData] = await Promise.all([
        sessionService.getSession(sessionId),
        sessionService.getSessionAttendance(sessionId),
        sessionService.getAttendanceSummary(sessionId),
      ]);

      setSession(sessionData);
      setAttendance(attendanceData);
      setSummary(summaryData);
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sessionId, router]);

  const handleToggleAttendance = async (userId: string, currentStatus: boolean) => {
    setSavingUserId(userId);
    try {
      await sessionService.overrideAttendance(sessionId, {
        userId,
        present: !currentStatus,
      });

      // Update local state
      setAttendance((prev) =>
        prev.map((record) =>
          record.userId === userId
            ? { ...record, isPresent: !currentStatus, isOverride: true }
            : record
        )
      );

      // Update summary
      setSummary((prev) => {
        if (!prev) return prev;
        const change = currentStatus ? -1 : 1;
        const newPresent = prev.totalPresent + change;
        return {
          ...prev,
          totalPresent: newPresent,
          attendanceRate:
            prev.totalRegistered > 0
              ? Math.round((newPresent / prev.totalRegistered) * 100 * 100) / 100
              : 0,
        };
      });
    } catch {
      alert('فشل تحديث الحضور. يرجى المحاولة مرة أخرى.');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await sessionService.exportAttendance(sessionId, 'csv');
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${sessionId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      alert('فشل تصدير البيانات');
    } finally {
      setExporting(false);
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">جاري تحميل بيانات الحضور...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-gray-600">{error || 'الجلسة غير موجودة'}</p>
          <button
            onClick={() => router.push('/sessions')}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-white"
          >
            العودة للجلسات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-gray-600"
        aria-label="التنقل"
      >
        <Link href="/sessions" className="hover:text-primary transition-colors">
          جلساتي
        </Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-gray-900 font-medium">{session.title}</span>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-gray-900 font-medium">الحضور</span>
      </motion.nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سجل الحضور</h1>
          <p className="mt-1 text-gray-600">
            {session.title} - {session.cohort.program.titleAr}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            تصدير CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">المسجلون</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalRegistered}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الحاضرون</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalPresent}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">نسبة الحضور</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.attendanceRate}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  المتدرب
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  وقت الدخول
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  وقت الخروج
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  المدة
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  الإجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد متدربون مسجلون في هذه الجلسة
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {record.user.firstName} {record.user.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {record.user.email}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatTime(record.joinTime)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatTime(record.leaveTime)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDuration(record.duration)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                          record.isPresent
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {record.isPresent ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            حاضر
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            غائب
                          </>
                        )}
                        {record.isOverride && (
                          <span className="text-xs opacity-70">(يدوي)</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleAttendance(record.userId, record.isPresent)
                        }
                        disabled={savingUserId === record.userId}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          record.isPresent
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50`}
                      >
                        {savingUserId === record.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : record.isPresent ? (
                          'تحويل لغائب'
                        ) : (
                          'تحويل لحاضر'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
