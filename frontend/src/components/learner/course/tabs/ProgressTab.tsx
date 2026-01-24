'use client';

import { CheckCircle2, XCircle, Clock, Award, AlertTriangle } from 'lucide-react';

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
        return { icon: CheckCircle2, color: 'text-seu-cyan', bg: 'bg-seu-cyan/10', label: 'حضر' };
      case 'ABSENT':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'غائب' };
      case 'EXCUSED':
        return { icon: AlertTriangle, color: 'text-seu-orange', bg: 'bg-seu-orange/10', label: 'معذور' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100', label: 'قادم' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-seu-blue bg-white p-6">
          <p className="text-sm text-gray-600">نسبة الحضور</p>
          <p className={`text-3xl font-bold ${
            attendancePercentage >= requiredPercentage ? 'text-seu-cyan' : 'text-seu-orange'
          }`}>
            {attendancePercentage}%
          </p>
          <p className="mt-1 text-xs text-gray-500">المطلوب: {requiredPercentage}%</p>
        </div>

        <div className="rounded-xl border-2 border-seu-cyan bg-white p-6">
          <p className="text-sm text-gray-600">الجلسات المحضورة</p>
          <p className="text-3xl font-bold text-seu-navy">
            {records.filter(r => r.status === 'ATTENDED').length} / {records.length}
          </p>
        </div>

        <div className={`rounded-xl border-2 p-6 ${
          certificateEligible ? 'border-seu-cyan bg-seu-cyan/5' : 'border-gray-200 bg-white'
        }`}>
          <p className="text-sm text-gray-600">حالة الشهادة</p>
          <div className="mt-1 flex items-center gap-2">
            <Award className={`h-6 w-6 ${certificateEligible ? 'text-seu-cyan' : 'text-gray-400'}`} aria-hidden="true" />
            <span className={`font-bold ${certificateEligible ? 'text-seu-cyan' : 'text-gray-500'}`}>
              {certificateEligible ? 'مؤهل للشهادة' : 'غير مؤهل بعد'}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h3 className="font-bold text-seu-navy">سجل الحضور</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {records.map((record) => {
            const config = getStatusConfig(record.status);
            const Icon = config.icon;

            return (
              <div key={record.sessionId} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{record.sessionTitleAr}</p>
                  <p className="text-sm text-gray-500">{record.sessionDate}</p>
                </div>
                <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${config.bg}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
