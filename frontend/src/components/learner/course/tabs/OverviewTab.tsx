'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, BookOpen, User } from 'lucide-react';

interface Module {
  id: string;
  titleAr: string;
  sessions: {
    id: string;
    titleAr: string;
    durationMinutes: number;
    isCompleted: boolean;
  }[];
}

interface OverviewTabProps {
  modules: Module[];
  instructorName?: string;
  instructorBio?: string;
  instructorImage?: string;
  hasInstructor: boolean;
}

export function OverviewTab({
  modules,
  instructorName,
  instructorBio,
  instructorImage,
  hasInstructor,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Curriculum */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">المنهج الدراسي</h2>
        </div>

        {modules.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">لم يتم إضافة المنهج الدراسي بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.1 }}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">
                    الوحدة {moduleIndex + 1}: {module.titleAr}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {module.sessions.length} جلسة
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {module.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {session.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" aria-hidden="true" />
                      )}
                      <span className={`flex-1 ${session.isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                        {session.titleAr}
                      </span>
                      {session.durationMinutes > 0 && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {session.durationMinutes} دقيقة
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Instructor - only show if instructor exists */}
      {hasInstructor && instructorName && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <User className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">عن المدرب</h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-5 rounded-xl border border-gray-200 bg-white p-6"
          >
            {instructorImage ? (
              <img
                src={instructorImage}
                alt={instructorName}
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-2xl font-bold text-white flex-shrink-0">
                {instructorName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{instructorName}</h3>
              {instructorBio && (
                <p className="mt-2 text-gray-600 leading-relaxed">{instructorBio}</p>
              )}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
