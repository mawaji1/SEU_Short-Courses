'use client';

import { Award, Clock } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  instructor: string;
  cohortName: string;
  progress: number;
  totalHours: number;
  certificateEnabled: boolean;
}

export function CourseHeader({
  title,
  instructor,
  cohortName,
  progress,
  totalHours,
  certificateEnabled,
}: CourseHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-seu-navy">{title}</h1>
          <p className="mt-1 text-gray-600">{instructor} • {cohortName}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{totalHours} ساعة</span>
          </div>
          {certificateEnabled && (
            <div className="flex items-center gap-1 text-seu-cyan">
              <Award className="h-4 w-4" aria-hidden="true" />
              <span>شهادة معتمدة</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">التقدم الإجمالي</span>
          <span className="font-bold text-seu-blue">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`التقدم ${progress}%`}
          />
        </div>
      </div>
    </div>
  );
}
