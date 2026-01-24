'use client';

import { CheckCircle2, Circle } from 'lucide-react';

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
  instructorName: string;
  instructorBio?: string;
  instructorImage?: string;
}

export function OverviewTab({
  modules,
  instructorName,
  instructorBio,
  instructorImage,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Curriculum */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-seu-navy">المنهج الدراسي</h2>
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <div
              key={module.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="bg-gray-50 px-4 py-3">
                <h3 className="font-bold text-seu-navy">
                  الوحدة {moduleIndex + 1}: {module.titleAr}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {module.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    {session.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-seu-cyan" aria-hidden="true" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" aria-hidden="true" />
                    )}
                    <span className={session.isCompleted ? 'text-gray-600' : 'text-gray-900'}>
                      {session.titleAr}
                    </span>
                    <span className="mr-auto text-sm text-gray-500">
                      {session.durationMinutes} دقيقة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instructor */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-seu-navy">عن المدرب</h2>
        <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6">
          {instructorImage ? (
            <img
              src={instructorImage}
              alt={instructorName}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-seu-blue to-seu-purple text-2xl font-bold text-white">
              {instructorName.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-seu-navy">{instructorName}</h3>
            <p className="mt-2 text-gray-600">{instructorBio || 'مدرب معتمد'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
