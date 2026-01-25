'use client';

import { motion } from 'framer-motion';
import { Award, Clock, User, Users } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  instructorName?: string;
  hasInstructor: boolean;
  cohortName: string;
  progress: number;
  totalHours: number;
  certificateEnabled: boolean;
}

export function CourseHeader({
  title,
  instructorName,
  hasInstructor,
  cohortName,
  progress,
  totalHours,
  certificateEnabled,
}: CourseHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
    >
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary-dark p-6 text-white">
        <h1 className="text-2xl font-bold mb-3">{title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
          {/* Cohort */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>{cohortName}</span>
          </div>

          {/* Instructor - only show if exists */}
          {hasInstructor && instructorName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" aria-hidden="true" />
              <span>{instructorName}</span>
            </div>
          )}

          {/* Hours - only show if > 0 */}
          {totalHours > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{totalHours} ساعة</span>
            </div>
          )}

          {/* Certificate badge */}
          {certificateEnabled && (
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <Award className="h-4 w-4" aria-hidden="true" />
              <span>شهادة معتمدة</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">التقدم الإجمالي</span>
          <span className="font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`التقدم ${progress}%`}
          />
        </div>
      </div>
    </motion.div>
  );
}
