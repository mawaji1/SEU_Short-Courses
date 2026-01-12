'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';

interface Instructor {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  bioAr?: string;
  bioEn?: string;
  email?: string;
  imageUrl?: string;
  isActive: boolean;
  _count?: {
    programs: number;
  };
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [instructorForm, setInstructorForm] = useState({
    nameAr: '',
    nameEn: '',
    titleAr: '',
    titleEn: '',
    bioAr: '',
    bioEn: '',
    email: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/instructors`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في جلب المدربين');
      }

      const data = await response.json();
      setInstructors(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const url = editingInstructor
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/instructors/${editingInstructor.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/instructors`;

      const response = await fetch(url, {
        method: editingInstructor ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify(instructorForm),
      });

      if (!response.ok) {
        throw new Error(editingInstructor ? 'فشل في تحديث المدرب' : 'فشل في إنشاء المدرب');
      }

      setSuccess(editingInstructor ? 'تم تحديث المدرب بنجاح' : 'تم إنشاء المدرب بنجاح');
      setShowModal(false);
      setInstructorForm({
        nameAr: '',
        nameEn: '',
        titleAr: '',
        titleEn: '',
        bioAr: '',
        bioEn: '',
        email: '',
        isActive: true,
      });
      setEditingInstructor(null);
      fetchInstructors();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المدرب؟')) return;

    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/instructors/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في حذف المدرب');
      }

      setSuccess('تم حذف المدرب بنجاح');
      fetchInstructors();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setInstructorForm({
      nameAr: instructor.nameAr,
      nameEn: instructor.nameEn,
      titleAr: instructor.titleAr,
      titleEn: instructor.titleEn,
      bioAr: instructor.bioAr || '',
      bioEn: instructor.bioEn || '',
      email: instructor.email || '',
      isActive: instructor.isActive,
    });
    setShowModal(true);
  };

  const filteredInstructors = instructors.filter(
    (inst) =>
      inst.nameAr.includes(searchQuery) ||
      inst.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.email?.includes(searchQuery),
  );

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
    <div className="max-w-[1200px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المدربون</h1>
          <p className="text-gray-600">إدارة المدربين والخبراء</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingInstructor(null);
            setInstructorForm({
              nameAr: '',
              nameEn: '',
              titleAr: '',
              titleEn: '',
              bioAr: '',
              bioEn: '',
              email: '',
              isActive: true,
            });
            setShowModal(true);
          }}
        >
          <Plus className="w-5 h-5" />
          إضافة مدرب
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

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                المدرب
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                البريد الإلكتروني
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                البرامج
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
            {filteredInstructors.map((instructor) => (
              <tr key={instructor.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {instructor.nameAr.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{instructor.nameAr}</div>
                      <div className="text-sm text-gray-500">{instructor.titleAr}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{instructor.email || '-'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {instructor._count?.programs || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      instructor.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {instructor.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(instructor)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(instructor.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInstructors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا يوجد مدربون</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingInstructor ? 'تعديل المدرب' : 'إضافة مدرب جديد'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    الاسم (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorForm.nameAr}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, nameAr: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="د. أحمد محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    الاسم (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorForm.nameEn}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, nameEn: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="Dr. Ahmed Mohammed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    المسمى الوظيفي (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorForm.titleAr}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, titleAr: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="أستاذ مشارك في..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    المسمى الوظيفي (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorForm.titleEn}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, titleEn: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="Associate Professor"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={instructorForm.email}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, email: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="email@seu.edu.sa"
                    dir="ltr"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    النبذة (عربي)
                  </label>
                  <textarea
                    rows={3}
                    value={instructorForm.bioAr}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, bioAr: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="نبذة مختصرة عن المدرب..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    النبذة (English)
                  </label>
                  <textarea
                    rows={3}
                    value={instructorForm.bioEn}
                    onChange={(e) =>
                      setInstructorForm({ ...instructorForm, bioEn: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    placeholder="Brief bio about the instructor..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={instructorForm.isActive}
                  onChange={(e) =>
                    setInstructorForm({ ...instructorForm, isActive: e.target.checked })
                  }
                  className="accent-accent"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  نشط
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" className="flex-1">
                  {editingInstructor ? 'حفظ التغييرات' : 'إضافة'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
