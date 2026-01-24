'use client';

import Link from 'next/link';
import { Clock, ChevronLeft, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'UPCOMING';
  nextSession?: string;
  certificateReady?: boolean;
}

export function CourseCard({
  id,
  title,
  instructor,
  progress,
  status,
  nextSession,
  certificateReady,
}: CourseCardProps) {
  const statusConfig = {
    IN_PROGRESS: {
      gradient: 'from-seu-blue to-seu-cyan',
      label: 'قيد التقدم',
      textColor: 'text-white',
    },
    COMPLETED: {
      gradient: 'from-seu-cyan to-seu-lime',
      label: 'مكتمل',
      textColor: 'text-seu-navy',
    },
    UPCOMING: {
      gradient: 'from-seu-purple to-seu-blue',
      label: 'قادم',
      textColor: 'text-white',
    },
  };

  const config = statusConfig[status];

  return (
    <Link href={`/my-courses/${id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-seu-blue hover:shadow-lg"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} p-4 ${config.textColor}`}>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            {status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
            {config.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-5">
          <h3 className="mb-2 text-lg font-bold text-seu-navy group-hover:text-seu-blue">
            {title}
          </h3>
          <p className="mb-4 text-sm text-gray-600">{instructor}</p>

          {/* Progress Bar */}
          {status !== 'UPCOMING' && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">التقدم</span>
                <span className="font-bold text-seu-blue">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Info */}
          {nextSession && (
            <div className="flex items-center gap-2 rounded-lg bg-seu-orange/10 p-3">
              <Clock className="h-4 w-4 text-seu-orange" aria-hidden="true" />
              <span className="text-sm font-medium text-seu-navy">{nextSession}</span>
            </div>
          )}

          {certificateReady && (
            <div className="flex items-center gap-2 rounded-lg bg-seu-cyan/10 p-3">
              <Award className="h-4 w-4 text-seu-cyan" aria-hidden="true" />
              <span className="text-sm font-medium text-seu-navy">شهادة جاهزة للتحميل</span>
            </div>
          )}
        </div>

        {/* Hover Indicator */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-500 group-hover:bg-gray-50">
          <span>عرض التفاصيل</span>
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        </div>
      </motion.div>
    </Link>
  );
}
