'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Loader2, ChevronRight, ChevronLeft, BookOpen, MapPin } from 'lucide-react';

interface Enrollment {
  id: string;
  cohort: {
    id: string;
    nameAr: string;
    startDate: string;
    endDate: string;
    program: {
      titleAr: string;
      totalHours: number;
    };
    instructor: {
      nameAr: string;
    } | null;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'START' | 'END' | 'SESSION';
  cohortName: string;
  instructorName: string;
}

const months = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const weekDays = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function CalendarPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/my-courses`,
          { credentials: 'include' }
        );

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.ok) {
          const data: Enrollment[] = await res.json();
          setEnrollments(data);

          // Generate events from enrollments
          const generatedEvents: CalendarEvent[] = [];

          data.forEach((enrollment) => {
            // Add start date event
            if (enrollment.cohort.startDate) {
              generatedEvents.push({
                id: `${enrollment.id}-start`,
                title: `بداية: ${enrollment.cohort.program.titleAr}`,
                date: new Date(enrollment.cohort.startDate),
                type: 'START',
                cohortName: enrollment.cohort.nameAr,
                instructorName: enrollment.cohort.instructor?.nameAr || 'المدرب',
              });
            }

            // Add end date event
            if (enrollment.cohort.endDate) {
              generatedEvents.push({
                id: `${enrollment.id}-end`,
                title: `نهاية: ${enrollment.cohort.program.titleAr}`,
                date: new Date(enrollment.cohort.endDate),
                type: 'END',
                cohortName: enrollment.cohort.nameAr,
                instructorName: enrollment.cohort.instructor?.nameAr || 'المدرب',
              });
            }
          });

          // Sort events by date
          generatedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
          setEvents(generatedEvents);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [router]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = event.date;
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const hasEvent = (day: number) => {
    return getEventsForDay(day).length > 0;
  };

  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'START':
        return { color: 'bg-green-500', label: 'بداية الدورة', textColor: 'text-green-700', bgLight: 'bg-green-50' };
      case 'END':
        return { color: 'bg-red-500', label: 'نهاية الدورة', textColor: 'text-red-700', bgLight: 'bg-red-50' };
      case 'SESSION':
        return { color: 'bg-primary', label: 'جلسة', textColor: 'text-primary', bgLight: 'bg-primary/10' };
      default:
        return { color: 'bg-gray-500', label: 'حدث', textColor: 'text-gray-700', bgLight: 'bg-gray-50' };
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Get upcoming events (future events only)
  const upcomingEvents = events.filter((event) => event.date >= new Date());

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">جاري تحميل التقويم...</p>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <CalendarIcon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقويم</h1>
            <p className="text-gray-600">جدول الدورات والمواعيد المهمة</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2"
        >
          {/* Month Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToNextMonth}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const hasStartEvent = dayEvents.some(e => e.type === 'START');
              const hasEndEvent = dayEvents.some(e => e.type === 'END');

              return (
                <div
                  key={index}
                  className={`relative aspect-square rounded-lg p-2 ${
                    day
                      ? isToday(day)
                        ? 'bg-primary text-white'
                        : dayEvents.length > 0
                          ? 'bg-gray-50'
                          : 'hover:bg-gray-50'
                      : ''
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-sm ${isToday(day) ? 'font-bold' : 'text-gray-700'}`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && !isToday(day) && (
                        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                          {hasStartEvent && (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          )}
                          {hasEndEvent && (
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-gray-600">اليوم</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-gray-600">بداية دورة</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-gray-600">نهاية دورة</span>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-bold text-gray-900">المواعيد القادمة</h3>

          {upcomingEvents.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="mb-2 font-medium text-gray-900">لا توجد مواعيد قادمة</p>
              <p className="text-sm text-gray-500">سجل في دورات جديدة لرؤية مواعيدها هنا</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {upcomingEvents.slice(0, 10).map((event) => {
                const config = getEventTypeConfig(event.type);
                return (
                  <div
                    key={event.id}
                    className={`rounded-xl border border-gray-100 p-4 transition-colors hover:border-gray-200 ${config.bgLight}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${config.color}`} />
                      <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
                    </div>
                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{event.cohortName}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{event.instructorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
