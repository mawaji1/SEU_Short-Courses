'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus, Search, Pencil, Trash2, Eye, Calendar, Users,
  ChevronDown, ChevronUp, X, Loader2, UserPlus, Copy
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
    fetchPrograms();
    fetchInstructors();
    fetchCategories();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
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
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/instructors`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
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
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/categories`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
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
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts?programId=${programId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
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
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
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
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const isEditing = !!editingProgramId;
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs/${editingProgramId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.accessToken}`,
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
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs/${programId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
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
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/programs/${programId}/clone`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
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
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts/${cohortId}/instructor`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
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

  const filteredPrograms = programs.filter((prog) => {
    const matchesSearch =
      prog.titleAr.includes(searchQuery) ||
      prog.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || prog.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: programs.length,
    PUBLISHED: programs.filter((p) => p.status === 'PUBLISHED').length,
    DRAFT: programs.filter((p) => p.status === 'DRAFT').length,
    ARCHIVED: programs.filter((p) => p.status === 'ARCHIVED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">البرامج التدريبية</h1>
          <p className="text-gray-600">إدارة البرامج والدفعات التدريبية</p>
        </div>
        <Button
          onClick={() => setShowProgramModal(true)}
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة برنامج
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في البرامج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${!filterStatus
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              الكل ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('PUBLISHED')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'PUBLISHED'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
            >
              منشور ({statusCounts.PUBLISHED})
            </button>
            <button
              onClick={() => setFilterStatus('DRAFT')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'DRAFT'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              مسودة ({statusCounts.DRAFT})
            </button>
          </div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
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
                      <span className="text-sm font-bold text-gray-900">
                        {program.price.toLocaleString()} ر.س
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={program.status}
                        onChange={(e) => handleStatusChange(program.id, e.target.value)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                          program.status === 'PUBLISHED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : program.status === 'DRAFT'
                            ? 'bg-gray-50 text-gray-600 border-gray-200'
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
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="عرض الدفعات"
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
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                          title="إضافة دفعة"
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
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                          title="تعديل البرنامج"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCloneProgram(program.id)}
                          className="p-2 hover:bg-purple-50 rounded-lg text-purple-600"
                          title="نسخ البرنامج"
                        >
                          <Copy className="w-4 h-4" />
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

                          {/* Cohorts Section */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3">
                              الدفعات التدريبية
                            </h4>
                          {cohorts[program.id]?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {cohorts[program.id].map((cohort) => (
                                <div
                                  key={cohort.id}
                                  className="bg-white rounded-lg border border-gray-200 p-4"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h5 className="font-bold text-gray-900">
                                        {cohort.nameAr}
                                      </h5>
                                      <p className="text-sm text-gray-500">
                                        {cohort.nameEn}
                                      </p>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${cohort.status === 'OPEN'
                                        ? 'bg-green-100 text-green-700'
                                        : cohort.status === 'FULL'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                      {cohort.status}
                                    </span>
                                  </div>

                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {new Date(cohort.startDate).toLocaleDateString('ar-SA')} -{' '}
                                        {new Date(cohort.endDate).toLocaleDateString('ar-SA')}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      <span>
                                        {cohort.enrolledCount} / {cohort.capacity} متدرب
                                      </span>
                                    </div>
                                    {cohort.instructor && (
                                      <div className="flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        <span>{cohort.instructor.nameAr}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Instructor Assignment */}
                                  {!cohort.instructor && instructors.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <select
                                        onChange={(e) =>
                                          handleAssignInstructor(cohort.id, e.target.value)
                                        }
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                                      >
                                        <option value="">تعيين مدرب...</option>
                                        {instructors.map((instructor) => (
                                          <option key={instructor.id} value={instructor.id}>
                                            {instructor.nameAr} - {instructor.titleAr}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">
                              لا توجد دفعات لهذا البرنامج
                            </p>
                          )}
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
      </div>

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
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان البرنامج (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={programForm.titleAr}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, titleAr: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان البرنامج (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={programForm.titleEn}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, titleEn: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف المختصر (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={programForm.shortDescriptionAr}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, shortDescriptionAr: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف المختصر (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={programForm.shortDescriptionEn}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, shortDescriptionEn: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف الكامل (عربي) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={programForm.descriptionAr}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, descriptionAr: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف الكامل (English) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={programForm.descriptionEn}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, descriptionEn: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأساسي (ر.س) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={programForm.price}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, price: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سعر الحجز المبكر (ر.س)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={programForm.earlyBirdPrice}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, earlyBirdPrice: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                    placeholder="اختياري"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر المؤسسي (ر.س)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={programForm.corporatePrice}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, corporatePrice: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                    placeholder="اختياري"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد الساعات *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={programForm.durationHours}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, durationHours: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التصنيف *
                  </label>
                  <select
                    required
                    value={programForm.categoryId}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, categoryId: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  >
                    <option value="">اختر التصنيف...</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع البرنامج *
                  </label>
                  <select
                    required
                    value={programForm.type}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, type: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  >
                    <option value="COURSE">دورة تدريبية</option>
                    <option value="WORKSHOP">ورشة عمل</option>
                    <option value="BOOTCAMP">معسكر تدريبي</option>
                    <option value="CERTIFICATION">برنامج شهادة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة التقديم *
                  </label>
                  <select
                    required
                    value={programForm.deliveryMode}
                    onChange={(e) =>
                      setProgramForm({ ...programForm, deliveryMode: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
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
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
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
