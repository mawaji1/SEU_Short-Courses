'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Plus, Search, Pencil, Calendar, Users,
  ChevronDown, ChevronUp, X, UserPlus, Copy, Sparkles
} from 'lucide-react';
import { CurriculumBuilder } from '@/components/admin';

interface Program {
  id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  descriptionAr: string;
  descriptionEn: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  price: number;
  earlyBirdPrice?: number;
  corporatePrice?: number;
  durationHours?: number;
  type?: string;
  deliveryMode?: string;
  status: string;
  isFeatured?: boolean;
  certificateEnabled?: boolean;
  certificateAttendanceThreshold?: number;
  category?: {
    id: string;
    nameAr: string;
  };
  instructor?: {
    nameAr: string;
  };
  modules?: any[];
}

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
  status: string;
  instructorId: string | null;
  instructor?: {
    id: string;
    nameAr: string;
  };
}

interface Instructor {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
}

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [cohorts, setCohorts] = useState<Record<string, Cohort[]>>({});
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    shortDescriptionAr: '',
    shortDescriptionEn: '',
    price: '',
    earlyBirdPrice: '',
    corporatePrice: '',
    categoryId: '',
    durationHours: '',
    type: 'COURSE',
    deliveryMode: 'ONLINE',
    isFeatured: false,
    certificateEnabled: true,
    certificateAttendanceThreshold: 80,
  });
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [cohortForm, setCohortForm] = useState({
    nameAr: '',
    nameEn: '',
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      fetchPrograms(),
      fetchInstructors(),
      fetchCategories()
    ]);
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs`,
        {
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('فشل في جلب البرامج');
      }

      const data = await response.json();
      setPrograms(data.data || []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/instructors`,
        {
          credentials: 'include',
        },
      );

      if (response.ok) {
        const data = await response.json();
        setInstructors(data);
      }
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/categories`,
        {
          credentials: 'include',
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchCohorts = async (programId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts?programId=${programId}`,
        {
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('فشل في جلب الدفعات');
      }

      const data = await response.json();
      setCohorts((prev) => ({ ...prev, [programId]: data }));
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب الدفعات');
    }
  };

  const toggleProgramExpansion = (programId: string) => {
    if (expandedProgram === programId) {
      setExpandedProgram(null);
    } else {
      setExpandedProgram(programId);
      if (!cohorts[programId]) {
        fetchCohorts(programId);
      }
    }
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            programId: selectedProgram,
            nameAr: cohortForm.nameAr,
            nameEn: cohortForm.nameEn,
            startDate: new Date(cohortForm.startDate).toISOString(),
            endDate: new Date(cohortForm.endDate).toISOString(),
            registrationStartDate: new Date(cohortForm.registrationStartDate).toISOString(),
            registrationEndDate: new Date(cohortForm.registrationEndDate).toISOString(),
            capacity: parseInt(cohortForm.capacity),
          }),
        },
      );

      if (!response.ok) {
        throw new Error('فشل في إنشاء الدفعة');
      }

      setSuccess('تم إنشاء الدفعة بنجاح');
      setShowCohortModal(false);
      setCohortForm({
        nameAr: '',
        nameEn: '',
        startDate: '',
        endDate: '',
        registrationStartDate: '',
        registrationEndDate: '',
        capacity: '',
      });
      fetchCohorts(selectedProgram);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الدفعة');
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const isEditing = !!editingProgramId;
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs/${editingProgramId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titleAr: programForm.titleAr,
          titleEn: programForm.titleEn,
          descriptionAr: programForm.descriptionAr,
          descriptionEn: programForm.descriptionEn,
          shortDescriptionAr: programForm.shortDescriptionAr,
          shortDescriptionEn: programForm.shortDescriptionEn,
          slug: programForm.titleEn.toLowerCase().replace(/\s+/g, '-'),
          price: parseFloat(programForm.price),
          earlyBirdPrice: programForm.earlyBirdPrice ? parseFloat(programForm.earlyBirdPrice) : undefined,
          corporatePrice: programForm.corporatePrice ? parseFloat(programForm.corporatePrice) : undefined,
          categoryId: programForm.categoryId,
          durationHours: parseInt(programForm.durationHours),
          type: programForm.type,
          deliveryMode: programForm.deliveryMode,
          isFeatured: programForm.isFeatured,
          certificateEnabled: programForm.certificateEnabled,
          certificateAttendanceThreshold: programForm.certificateAttendanceThreshold,
          ...(isEditing ? {} : { status: 'DRAFT' }),
        }),
      });

      if (!response.ok) {
        throw new Error(isEditing ? 'فشل في تحديث البرنامج' : 'فشل في إنشاء البرنامج');
      }

      setSuccess(isEditing ? 'تم تحديث البرنامج بنجاح' : 'تم إنشاء البرنامج بنجاح');
      setShowProgramModal(false);
      setEditingProgramId(null);
      setProgramForm({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        shortDescriptionAr: '',
        shortDescriptionEn: '',
        price: '',
        earlyBirdPrice: '',
        corporatePrice: '',
        categoryId: '',
        durationHours: '',
        type: 'COURSE',
        deliveryMode: 'ONLINE',
        isFeatured: false,
        certificateEnabled: true,
        certificateAttendanceThreshold: 80,
      });
      fetchPrograms();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ البرنامج');
    }
  };

  const handleStatusChange = async (programId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs/${programId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error('فشل في تحديث حالة البرنامج');
      }

      setSuccess('تم تحديث حالة البرنامج بنجاح');
      fetchPrograms();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحديث حالة البرنامج');
    }
  };

  const handleCloneProgram = async (programId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs/${programId}/clone`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('فشل في نسخ البرنامج');
      }

      setSuccess('تم نسخ البرنامج بنجاح');
      fetchPrograms();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء نسخ البرنامج');
    }
  };

  const handleAssignInstructor = async (cohortId: string, instructorId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts/${cohortId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instructorId }),
        },
      );

      if (!response.ok) {
        throw new Error('فشل في تعيين المدرب');
      }

      setSuccess('تم تعيين المدرب بنجاح');
      if (expandedProgram) {
        fetchCohorts(expandedProgram);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تعيين المدرب');
    }
  };

  const filteredPrograms = useMemo(() =>
    programs.filter((prog) => {
      const matchesSearch =
        prog.titleAr.includes(searchQuery) ||
        prog.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !filterStatus || prog.status === filterStatus;
      return matchesSearch && matchesStatus;
    }), [programs, searchQuery, filterStatus]
  );

  const statusCounts = useMemo(() => ({
    all: programs.length,
    PUBLISHED: programs.filter((p) => p.status === 'PUBLISHED').length,
    DRAFT: programs.filter((p) => p.status === 'DRAFT').length,
    ARCHIVED: programs.filter((p) => p.status === 'ARCHIVED').length,
  }), [programs]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto" dir="rtl">
        {/* Skeleton Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Skeleton Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-10 w-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Skeleton Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Screen reader loading announcement */}
        <div className="sr-only" role="status" aria-live="polite">
          جاري تحميل البرامج…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto" dir="rtl">
      {/* Header with SEU gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 rounded-3xl p-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111E4D 0%, #0083BE 50%, #32B7A8 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full translate-x-1/4 translate-y-1/4" style={{ background: 'rgba(196, 214, 0, 0.1)' }} />
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8" style={{ color: '#C4D600' }} />
              <h1 className="text-4xl font-bold text-white">البرامج التدريبية</h1>
            </div>
            <p className="text-white/80 text-lg">إدارة البرامج والدفعات التدريبية</p>
          </div>
          <Button
            onClick={() => setShowProgramModal(true)}
            size="lg"
            className="gap-2 shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{ background: 'white', color: '#111E4D' }}
          >
            <Plus className="w-5 h-5" />
            إضافة برنامج
          </Button>
        </div>
      </motion.div>

      {/* Alerts with animation */}
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

      {/* Filters with animation */}
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
              placeholder="البحث في البرامج…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-seu-blue focus-visible:ring-2 focus-visible:ring-seu-blue/20 outline-none transition-all"
              aria-label="البحث في البرامج"
              name="search"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2" role="group" aria-label="تصفية حسب الحالة">
            <button
              onClick={() => setFilterStatus(null)}
              className="px-5 py-2.5 rounded-xl font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 shadow-sm"
              style={!filterStatus 
                ? { background: '#111E4D', color: 'white' } 
                : { background: '#f3f4f6', color: '#374151' }}
              aria-label="عرض جميع البرامج"
              aria-pressed={!filterStatus}
            >
              الكل ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('PUBLISHED')}
              className="px-5 py-2.5 rounded-xl font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 shadow-sm"
              style={filterStatus === 'PUBLISHED'
                ? { background: '#32B7A8', color: 'white' }
                : { background: 'rgba(50, 183, 168, 0.1)', color: '#32B7A8' }}
              aria-label="عرض البرامج المنشورة"
              aria-pressed={filterStatus === 'PUBLISHED'}
            >
              منشور ({statusCounts.PUBLISHED})
            </button>
            <button
              onClick={() => setFilterStatus('DRAFT')}
              className="px-5 py-2.5 rounded-xl font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 shadow-sm"
              style={filterStatus === 'DRAFT'
                ? { background: '#593888', color: 'white' }
                : { background: 'rgba(89, 56, 136, 0.1)', color: '#593888' }}
              aria-label="عرض المسودات"
              aria-pressed={filterStatus === 'DRAFT'}
            >
              مسودة ({statusCounts.DRAFT})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Programs Table with animation */}
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
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  البرنامج
                </th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  التصنيف
                </th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  السعر
                </th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  الحالة
                </th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map((program) => (
                <React.Fragment key={program.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{program.titleAr}</div>
                      <div className="text-sm text-gray-500">{program.titleEn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-accent font-medium">
                        {program.category?.nameAr}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                        {program.price.toLocaleString('ar-SA')} ر.س
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={program.status}
                        onChange={(e) => handleStatusChange(program.id, e.target.value)}
                        aria-label={`تغيير حالة ${program.titleAr}`}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 transition-all ${
                          program.status === 'PUBLISHED'
                            ? 'bg-green-50 text-green-700 border-green-200 focus-visible:ring-green-500'
                            : program.status === 'DRAFT'
                            ? 'bg-gray-50 text-gray-600 border-gray-200 focus-visible:ring-gray-400'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        <option value="DRAFT">مسودة</option>
                        <option value="PUBLISHED">منشور</option>
                        <option value="ARCHIVED">مؤرشف</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleProgramExpansion(program.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                          title="عرض الدورات والمحتوى"
                          aria-label={expandedProgram === program.id ? 'إخفاء تفاصيل البرنامج' : 'عرض تفاصيل البرنامج'}
                          aria-expanded={expandedProgram === program.id}
                        >
                          {expandedProgram === program.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProgram(program.id);
                            setShowCohortModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all"
                          title="إضافة دورة جديدة"
                          aria-label="إضافة دورة جديدة"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProgramId(program.id);
                            setProgramForm({
                              titleAr: program.titleAr,
                              titleEn: program.titleEn,
                              shortDescriptionAr: program.shortDescriptionAr || '',
                              shortDescriptionEn: program.shortDescriptionEn || '',
                              descriptionAr: program.descriptionAr,
                              descriptionEn: program.descriptionEn,
                              price: program.price.toString(),
                              earlyBirdPrice: program.earlyBirdPrice?.toString() || '',
                              corporatePrice: program.corporatePrice?.toString() || '',
                              durationHours: program.durationHours?.toString() || '',
                              categoryId: program.category?.id || '',
                              type: program.type || 'COURSE',
                              deliveryMode: program.deliveryMode || 'ONLINE',
                              isFeatured: program.isFeatured || false,
                              certificateEnabled: program.certificateEnabled ?? true,
                              certificateAttendanceThreshold: program.certificateAttendanceThreshold ?? 80,
                            });
                            setShowProgramModal(true);
                          }}
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-all"
                          title="تعديل البرنامج"
                          aria-label="تعديل البرنامج"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleCloneProgram(program.id)}
                          className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition-all"
                          title="نسخ البرنامج"
                          aria-label="نسخ البرنامج"
                        >
                          <Copy className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Cohorts and Curriculum Expansion */}
                  {expandedProgram === program.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-6">
                          {/* Curriculum Section */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <CurriculumBuilder
                              programId={program.id}
                              initialModules={program.modules || []}
                              onUpdate={() => fetchPrograms()}
                            />
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد برامج</p>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingProgramId ? 'تعديل البرنامج' : 'إضافة برنامج جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowProgramModal(false);
                  setEditingProgramId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-all"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="titleAr" className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان البرنامج (عربي) *
                  </label>
                  <input
                    id="titleAr"
                    name="titleAr"
                    type="text"
                    required
                    autoComplete="off"
                    value={programForm.titleAr}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, titleAr: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="titleEn" className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان البرنامج (English)
                  </label>
                  <input
                    id="titleEn"
                    name="titleEn"
                    type="text"
                    autoComplete="off"
                    value={programForm.titleEn}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, titleEn: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="shortDescriptionAr" className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف المختصر (عربي) *
                  </label>
                  <input
                    id="shortDescriptionAr"
                    name="shortDescriptionAr"
                    type="text"
                    required
                    autoComplete="off"
                    value={programForm.shortDescriptionAr}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, shortDescriptionAr: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="shortDescriptionEn" className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف المختصر (English)
                  </label>
                  <input
                    id="shortDescriptionEn"
                    name="shortDescriptionEn"
                    type="text"
                    autoComplete="off"
                    value={programForm.shortDescriptionEn}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, shortDescriptionEn: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="descriptionAr" className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف الكامل (عربي) *
                  </label>
                  <textarea
                    id="descriptionAr"
                    name="descriptionAr"
                    required
                    rows={3}
                    value={programForm.descriptionAr}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, descriptionAr: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="descriptionEn" className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف الكامل (English)
                  </label>
                  <textarea
                    id="descriptionEn"
                    name="descriptionEn"
                    rows={3}
                    value={programForm.descriptionEn}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, descriptionEn: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأساسي (ر.س) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={programForm.price}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, price: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="earlyBirdPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    سعر الحجز المبكر (ر.س)
                  </label>
                  <input
                    id="earlyBirdPrice"
                    name="earlyBirdPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={programForm.earlyBirdPrice}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, earlyBirdPrice: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all tabular-nums"
                    placeholder="اختياري"
                  />
                </div>

                <div>
                  <label htmlFor="corporatePrice" className="block text-sm font-medium text-gray-700 mb-2">
                    السعر المؤسسي (ر.س)
                  </label>
                  <input
                    id="corporatePrice"
                    name="corporatePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={programForm.corporatePrice}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, corporatePrice: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all tabular-nums"
                    placeholder="اختياري"
                  />
                </div>

                <div>
                  <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700 mb-2">
                    عدد الساعات *
                  </label>
                  <input
                    id="durationHours"
                    name="durationHours"
                    type="number"
                    required
                    min="1"
                    inputMode="numeric"
                    value={programForm.durationHours}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, durationHours: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                    التصنيف *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    value={programForm.categoryId}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, categoryId: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  >
                    <option value="">اختر التصنيف…</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={programForm.certificateEnabled}
                      onChange={(e) =>
                        setProgramForm({ ...programForm, certificateEnabled: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    تفعيل الشهادات
                  </label>
                </div>

                {programForm.certificateEnabled && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نسبة الحضور المطلوبة للشهادة: {programForm.certificateAttendanceThreshold}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={programForm.certificateAttendanceThreshold}
                      onChange={(e) =>
                        setProgramForm({ ...programForm, certificateAttendanceThreshold: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="programType" className="block text-sm font-medium text-gray-700 mb-2">
                    نوع البرنامج *
                  </label>
                  <select
                    id="programType"
                    name="type"
                    required
                    value={programForm.type}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, type: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  >
                    <option value="COURSE">دورة تدريبية</option>
                    <option value="WORKSHOP">ورشة عمل</option>
                    <option value="BOOTCAMP">معسكر تدريبي</option>
                    <option value="CERTIFICATION">برنامج شهادة</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="deliveryMode" className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة التقديم *
                  </label>
                  <select
                    id="deliveryMode"
                    name="deliveryMode"
                    required
                    value={programForm.deliveryMode}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, deliveryMode: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  >
                    <option value="ONLINE">عن بُعد</option>
                    <option value="ONSITE">حضوري</option>
                    <option value="HYBRID">مدمج</option>
                  </select>
                </div>

                {/* Featured Toggle */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={programForm.isFeatured}
                        onChange={(e) =>
                          setProgramForm({ ...programForm, isFeatured: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                      <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">برنامج مميز</span>
                      <p className="text-sm text-gray-500">عرض البرنامج في الصفحة الرئيسية</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProgramId ? 'حفظ التعديلات' : 'إنشاء البرنامج'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowProgramModal(false);
                    setEditingProgramId(null);
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Cohort Modal */}
      {showCohortModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">إضافة دفعة جديدة</h3>
              <button
                onClick={() => setShowCohortModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-all"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الدفعة (عربي)
                  </label>
                  <input
                    type="text"
                    required
                    value={cohortForm.nameAr}
                    onChange={(e) =>
                      setCohortForm({ ...cohortForm, nameAr: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الدفعة (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={cohortForm.nameEn}
                    onChange={(e) =>
                      setCohortForm({ ...cohortForm, nameEn: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ البدء
                  </label>
                  <input
                    type="date"
                    required
                    value={cohortForm.startDate}
                    onChange={(e) =>
                      setCohortForm({ ...cohortForm, startDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="date"
                    required
                    value={cohortForm.endDate}
                    onChange={(e) =>
                      setCohortForm({ ...cohortForm, endDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    بداية التسجيل
                  </label>
                  <input
                    type="date"
                    required
                    value={cohortForm.registrationStartDate}
                    onChange={(e) =>
                      setCohortForm({
                        ...cohortForm,
                        registrationStartDate: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نهاية التسجيل
                  </label>
                  <input
                    type="date"
                    required
                    value={cohortForm.registrationEndDate}
                    onChange={(e) =>
                      setCohortForm({
                        ...cohortForm,
                        registrationEndDate: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعة القصوى
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={cohortForm.capacity}
                    onChange={(e) =>
                      setCohortForm({ ...cohortForm, capacity: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  إنشاء الدفعة
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCohortModal(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
