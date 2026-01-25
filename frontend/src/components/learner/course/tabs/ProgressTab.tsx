'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Award, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

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
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'حضر' };
      case 'ABSENT':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'غائب' };
      case 'EXCUSED':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'معذور' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100', label: 'قادم' };
    }
  };

  const attendedCount = records.filter(r => r.status === 'ATTENDED').length;
  const isOnTrack = attendancePercentage >= requiredPercentage;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-gray-600">نسبة الحضور</p>
          </div>
          <p className={`text-3xl font-bold ${isOnTrack ? 'text-green-600' : 'text-amber-500'}`}>
            {attendancePercentage}%
          </p>
          <p className="mt-1 text-sm text-gray-500">المطلوب: {requiredPercentage}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <p className="text-sm text-gray-600">الجلسات المكتملة</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {attendedCount} <span className="text-lg text-gray-400">/ {records.length}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl border p-6 shadow-sm ${
            certificateEligible
              ? 'border-green-200 bg-green-50'
              : 'border-gray-100 bg-white'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              certificateEligible ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Award className={`h-5 w-5 ${certificateEligible ? 'text-green-600' : 'text-gray-400'}`} aria-hidden="true" />
            </div>
            <p className="text-sm text-gray-600">حالة الشهادة</p>
          </div>
          <p className={`text-lg font-bold ${certificateEligible ? 'text-green-600' : 'text-gray-500'}`}>
            {certificateEligible ? 'مؤهل للشهادة' : 'غير مؤهل بعد'}
          </p>
        </motion.div>
      </div>

      {/* Attendance Table */}
      {records.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Calendar className="h-10 w-10 text-gray-400" aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900">لا توجد جلسات بعد</h3>
          <p className="text-gray-500">سيظهر سجل الحضور هنا عند بدء الجلسات</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="border-b border-gray-200 bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4">
            <h3 className="font-bold text-gray-900">سجل الحضور</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {records.map((record, index) => {
              const config = getStatusConfig(record.status);
              const Icon = config.icon;

              return (
                <motion.div
                  key={record.sessionId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{record.sessionTitleAr}</p>
                    <p className="text-sm text-gray-500">{record.sessionDate}</p>
                  </div>
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
