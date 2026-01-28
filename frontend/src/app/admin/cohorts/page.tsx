'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Plus, Search, Calendar, Users, ChevronDown, ChevronUp,
  X, UserPlus, Clock, MapPin, Filter, CalendarDays
} from 'lucide-react';

interface Cohort {
  id: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  capacity: number;
  enrolledCount: number;
  availableSeats: number;
  status: 'UPCOMING' | 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  instructorId: string | null;
  program?: {
    id: string;
    titleAr: string;
    titleEn: string;
    slug: string;
  };
  instructor?: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
}

interface Program {
  id: string;
  titleAr: string;
  titleEn: string;
}

interface Instructor {
  id: string;
  nameAr: string;
  nameEn: string;
}

const statusLabels: Record<string, { ar: string; color: string; bg: string }> = {
  UPCOMING: { ar: 'قادمة', color: '#0083BE', bg: 'rgba(0, 131, 190, 0.1)' },
  OPEN: { ar: 'التسجيل مفتوح', color: '#32B7A8', bg: 'rgba(50, 183, 168, 0.1)' },
  FULL: { ar: 'مكتملة', color: '#FFA300', bg: 'rgba(255, 163, 0, 0.1)' },
  IN_PROGRESS: { ar: 'جارية', color: '#593888', bg: 'rgba(89, 56, 136, 0.1)' },
  COMPLETED: { ar: 'منتهية', color: '#5A6872', bg: 'rgba(90, 104, 114, 0.1)' },
  CANCELLED: { ar: 'ملغاة', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
};

export default function AdminCohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterProgram, setFilterProgram] = useState<string | null>(null);

  // Modal state
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [cohortForm, setCohortForm] = useState({
    programId: '',
    nameAr: '',
    nameEn: '',
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    capacity: '30',
  });

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetchCohorts(),
      fetchPrograms(),
      fetchInstructors(),
    ]);
  }, []);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('فشل في جلب الدورات');
      const data = await response.json();
      setCohorts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs`,
        { credentials: 'include' }
      );
      if (!response.ok) return;
      const data = await response.json();
      setPrograms(data.data || []);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/instructors`,
        { credentials: 'include' }
      );
      if (!response.ok) return;
      const data = await response.json();
      setInstructors(data);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    }
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCohort
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts/${editingCohort.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts`;

      const response = await fetch(url, {
        method: editingCohort ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...cohortForm,
          capacity: parseInt(cohortForm.capacity),
        }),
      });

      if (!response.ok) throw new Error('فشل في حفظ الدورة');

      setSuccess(editingCohort ? 'تم تحديث الدورة بنجاح' : 'تم إنشاء الدورة بنجاح');
      setShowCohortModal(false);
      setEditingCohort(null);
      resetForm();
      fetchCohorts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (cohortId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts/${cohortId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error('فشل في تحديث الحالة');
      fetchCohorts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignInstructor = async (cohortId: string, instructorId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts/${cohortId}/instructor`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ instructorId }),
        }
      );
      if (!response.ok) throw new Error('فشل في تعيين المدرب');
      setSuccess('تم تعيين المدرب بنجاح');
      fetchCohorts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setCohortForm({
      programId: '',
      nameAr: '',
      nameEn: '',
      startDate: '',
      endDate: '',
      registrationStartDate: '',
      registrationEndDate: '',
      capacity: '30',
    });
  };

  const openEditModal = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setCohortForm({
      programId: cohort.program?.id || '',
      nameAr: cohort.nameAr,
      nameEn: cohort.nameEn,
      startDate: cohort.startDate.split('T')[0],
      endDate: cohort.endDate.split('T')[0],
      registrationStartDate: cohort.registrationStartDate.split('T')[0],
      registrationEndDate: cohort.registrationEndDate.split('T')[0],
      capacity: cohort.capacity.toString(),
    });
    setShowCohortModal(true);
  };

  // Filtered cohorts
  const filteredCohorts = useMemo(() => {
    return cohorts.filter((cohort) => {
      const matchesSearch =
        cohort.nameAr.includes(searchQuery) ||
        cohort.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cohort.program?.titleAr.includes(searchQuery);
      const matchesStatus = !filterStatus || cohort.status === filterStatus;
      const matchesProgram = !filterProgram || cohort.program?.id === filterProgram;
      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [cohorts, searchQuery, filterStatus, filterProgram]);

  // Status counts
  const statusCounts = useMemo(() => ({
    all: cohorts.length,
    UPCOMING: cohorts.filter(c => c.status === 'UPCOMING').length,
    OPEN: cohorts.filter(c => c.status === 'OPEN').length,
    IN_PROGRESS: cohorts.filter(c => c.status === 'IN_PROGRESS').length,
  }), [cohorts]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 rounded-3xl p-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #593888 0%, #0083BE 50%, #32B7A8 100%)' }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full translate-x-1/4 translate-y-1/4" style={{ background: 'rgba(196, 214, 0, 0.1)' }} />
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="w-8 h-8" style={{ color: '#C4D600' }} />
              <h1 className="text-4xl font-bold text-white">الدورات التدريبية</h1>
            </div>
            <p className="text-white/80 text-lg">إدارة مواعيد وجداول البرامج التدريبية</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingCohort(null);
              setShowCohortModal(true);
            }}
            size="lg"
            className="gap-2 shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{ background: 'white', color: '#593888' }}
          >
            <Plus className="w-5 h-5" />
            إضافة دورة جديدة
          </Button>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-red-50 border-r-4 border-red-500 rounded-lg p-4 mb-6 shadow-sm"
            role="alert"
          >
            <p className="text-red-700 font-medium">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-green-50 border-r-4 border-green-500 rounded-lg p-4 mb-6 shadow-sm"
            role="status"
          >
            <p className="text-green-700 font-medium">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-seu-blue transition-colors" />
            <input
              type="text"
              placeholder="البحث في الدورات…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-seu-blue focus-visible:ring-2 focus-visible:ring-seu-blue/20 outline-none transition-all"
              aria-label="البحث في الدورات"
            />
          </div>

          {/* Program Filter */}
          <select
            value={filterProgram || ''}
            onChange={(e) => setFilterProgram(e.target.value || null)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-seu-blue outline-none transition-all min-w-[200px]"
            aria-label="تصفية حسب البرنامج"
          >
            <option value="">جميع البرامج</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.titleAr}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex gap-2" role="group" aria-label="تصفية حسب الحالة">
            <button
              onClick={() => setFilterStatus(null)}
              className="px-4 py-2 rounded-xl font-medium transition-all"
              style={!filterStatus 
                ? { background: '#593888', color: 'white' } 
                : { background: '#f3f4f6', color: '#374151' }}
            >
              الكل ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('OPEN')}
              className="px-4 py-2 rounded-xl font-medium transition-all"
              style={filterStatus === 'OPEN'
                ? { background: '#32B7A8', color: 'white' }
                : { background: 'rgba(50, 183, 168, 0.1)', color: '#32B7A8' }}
            >
              مفتوحة ({statusCounts.OPEN})
            </button>
            <button
              onClick={() => setFilterStatus('UPCOMING')}
              className="px-4 py-2 rounded-xl font-medium transition-all"
              style={filterStatus === 'UPCOMING'
                ? { background: '#0083BE', color: 'white' }
                : { background: 'rgba(0, 131, 190, 0.1)', color: '#0083BE' }}
            >
              قادمة ({statusCounts.UPCOMING})
            </button>
            <button
              onClick={() => setFilterStatus('IN_PROGRESS')}
              className="px-4 py-2 rounded-xl font-medium transition-all"
              style={filterStatus === 'IN_PROGRESS'
                ? { background: '#593888', color: 'white' }
                : { background: 'rgba(89, 56, 136, 0.1)', color: '#593888' }}
            >
              جارية ({statusCounts.IN_PROGRESS})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Cohorts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الدورة</th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">البرنامج</th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">التاريخ</th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">المقاعد</th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">المدرب</th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الحالة</th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCohorts.map((cohort, index) => (
                <motion.tr
                  key={cohort.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{cohort.nameAr}</div>
                    <div className="text-sm text-gray-500">{cohort.nameEn}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium" style={{ color: '#593888' }}>
                      {cohort.program?.titleAr}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(cohort.startDate)}</span>
                      <span>-</span>
                      <span>{formatDate(cohort.endDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium tabular-nums">
                        {cohort.enrolledCount} / {cohort.capacity}
                      </span>
                      {cohort.availableSeats <= 5 && cohort.availableSeats > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          متبقي {cohort.availableSeats}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={cohort.instructorId || ''}
                      onChange={(e) => handleAssignInstructor(cohort.id, e.target.value)}
                      className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:border-seu-blue outline-none"
                      aria-label="تعيين المدرب"
                    >
                      <option value="">اختر المدرب…</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.nameAr}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={cohort.status}
                      onChange={(e) => handleStatusChange(cohort.id, e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all"
                      style={{
                        background: statusLabels[cohort.status]?.bg,
                        color: statusLabels[cohort.status]?.color,
                        borderColor: statusLabels[cohort.status]?.color,
                      }}
                      aria-label="تغيير حالة الدورة"
                    >
                      <option value="UPCOMING">قادمة</option>
                      <option value="OPEN">التسجيل مفتوح</option>
                      <option value="FULL">مكتملة</option>
                      <option value="IN_PROGRESS">جارية</option>
                      <option value="COMPLETED">منتهية</option>
                      <option value="CANCELLED">ملغاة</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(cohort)}
                    >
                      تعديل
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCohorts.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد دورات</p>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Cohort Modal */}
      {showCohortModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingCohort ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
              </h3>
              <button
                onClick={() => {
                  setShowCohortModal(false);
                  setEditingCohort(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} className="space-y-4">
              {/* Program Selection */}
              <div>
                <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-2">
                  البرنامج التدريبي *
                </label>
                <select
                  id="programId"
                  required
                  value={cohortForm.programId}
                  onChange={(e) => setCohortForm({ ...cohortForm, programId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-seu-blue outline-none"
                  disabled={!!editingCohort}
                >
                  <option value="">اختر البرنامج…</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cohort Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nameAr" className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الدورة (عربي) *
                  </label>
                  <input
                    id="nameAr"
                    type="text"
                    required
                    placeholder="مثال: الدورة الأولى - يناير 2026"
                    value={cohortForm.nameAr}
                    onChange={(e) => setCohortForm({ ...cohortForm, nameAr: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-seu-blue outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الدورة (English) *
                  </label>
                  <input
                    id="nameEn"
                    type="text"
                    required
                    placeholder="e.g., Cohort 1 - January 2026"
                    value={cohortForm.nameEn}
                    onChange={(e) => setCohortForm({ ...cohortForm, nameEn: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-seu-blue outline-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ البداية *
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    required
                    value={cohortForm.startDate}
                    onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-seu-blue outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ النهاية *
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    required
                    value={cohortForm.endDate}
                    onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-seu-blue outline-none"
                  />
                </div>
              </div>

              {/* Registration Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="registrationStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                    بداية التسجيل *
                  </label>
                  <input
                    id="registrationStartDate"
                    type="date"
                    required
                    value={cohortForm.registrationStartDate}
                    onChange={(e) => setCohortForm({ ...cohortForm, registrationStartDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-seu-blue outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="registrationEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                    نهاية التسجيل *
                  </label>
                  <input
                    id="registrationEndDate"
                    type="date"
                    required
                    value={cohortForm.registrationEndDate}
                    onChange={(e) => setCohortForm({ ...cohortForm, registrationEndDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-seu-blue outline-none"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  عدد المقاعد *
                </label>
                <input
                  id="capacity"
                  type="number"
                  required
                  min="1"
                  value={cohortForm.capacity}
                  onChange={(e) => setCohortForm({ ...cohortForm, capacity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-seu-blue outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCohort ? 'حفظ التعديلات' : 'إنشاء الدورة'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCohortModal(false);
                    setEditingCohort(null);
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
