'use client';

import { BookOpen, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsRowProps {
  activeCourses: number;
  completedCourses: number;
  overallProgress: number;
  certificatesEarned: number;
}

export function StatsRow({
  activeCourses,
  completedCourses,
  overallProgress,
  certificatesEarned,
}: StatsRowProps) {
  const stats = [
    {
      label: 'دورات نشطة',
      value: activeCourses,
      icon: BookOpen,
      bgColor: 'bg-seu-blue/10',
      textColor: 'text-seu-blue',
      borderColor: 'border-seu-blue',
    },
    {
      label: 'مكتملة',
      value: completedCourses,
      icon: CheckCircle2,
      bgColor: 'bg-seu-cyan/10',
      textColor: 'text-seu-cyan',
      borderColor: 'border-seu-cyan',
    },
    {
      label: 'التقدم الإجمالي',
      value: `${overallProgress}%`,
      icon: TrendingUp,
      bgColor: 'bg-seu-purple/10',
      textColor: 'text-seu-purple',
      borderColor: 'border-seu-purple',
      isProgress: true,
      progressValue: overallProgress,
    },
    {
      label: 'شهادات',
      value: certificatesEarned,
      icon: Award,
      bgColor: 'bg-seu-orange/10',
      textColor: 'text-seu-orange',
      borderColor: 'border-seu-orange',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl border-2 ${stat.borderColor} bg-white p-6 shadow-sm`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              <div className={`rounded-lg ${stat.bgColor} p-2`}>
                <Icon className={`h-5 w-5 ${stat.textColor}`} aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-seu-navy">{stat.value}</p>
            {stat.isProgress && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progressValue}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-seu-blue to-seu-cyan"
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
