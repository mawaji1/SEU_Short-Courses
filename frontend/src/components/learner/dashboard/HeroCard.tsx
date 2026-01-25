'use client';

import { Calendar, Clock, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroCardProps {
  courseName: string;
  instructorName: string;
  sessionDate: string;
  sessionTime: string;
  onJoin?: () => void;
}

export function HeroCard({
  courseName,
  instructorName,
  sessionDate,
  sessionTime,
  onJoin,
}: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark p-8 text-white shadow-2xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <Video className="h-4 w-4" aria-hidden="true" />
          <span>الجلسة القادمة</span>
        </div>

        <h2 className="mb-2 text-3xl font-bold">{courseName}</h2>
        <p className="mb-6 text-lg text-white/90">{instructorName}</p>

        <div className="mb-6 flex items-center gap-6 text-white/80">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" aria-hidden="true" />
            <span>{sessionDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" aria-hidden="true" />
            <span>{sessionTime}</span>
          </div>
        </div>

        <button
          onClick={onJoin}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <Video className="h-5 w-5" aria-hidden="true" />
          <span>الانضمام الآن</span>
        </button>
      </div>
    </motion.div>
  );
}
