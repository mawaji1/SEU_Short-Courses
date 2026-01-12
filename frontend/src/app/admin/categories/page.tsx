'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Pencil, Trash2, X, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
  _count?: {
    programs: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    nameAr: '',
    nameEn: '',
    slug: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/categories`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في جلب التصنيفات');
      }

      const data = await response.json();
      setCategories(data);
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
      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify(categoryForm),
      });

      if (!response.ok) {
        throw new Error(editingCategory ? 'فشل في تحديث التصنيف' : 'فشل في إنشاء التصنيف');
      }

      setSuccess(editingCategory ? 'تم تحديث التصنيف بنجاح' : 'تم إنشاء التصنيف بنجاح');
      setShowModal(false);
      setCategoryForm({ nameAr: '', nameEn: '', slug: '', isActive: true });
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catalog/categories/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في حذف التصنيف');
      }

      setSuccess('تم حذف التصنيف بنجاح');
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      slug: category.slug,
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.nameAr.includes(searchQuery) ||
      cat.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.includes(searchQuery),
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">التصنيفات</h1>
          <p className="text-gray-600">إدارة تصنيفات البرامج التدريبية</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ nameAr: '', nameEn: '', slug: '', isActive: true });
            setShowModal(true);
          }}
        >
          <Plus className="w-5 h-5" />
          إضافة تصنيف
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
            placeholder="البحث في التصنيفات..."
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
                التصنيف
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">Slug</th>
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
            {filteredCategories.map((category) => (
              <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{category.nameAr}</div>
                  <div className="text-sm text-gray-500">{category.nameEn}</div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {category.slug}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    {category._count?.programs || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      category.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد تصنيفات</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  اسم التصنيف (عربي) *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.nameAr}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, nameAr: e.target.value })
                  }
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="مثال: التقنية"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  اسم التصنيف (English) *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.nameEn}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, nameEn: e.target.value })
                  }
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="Technology"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, slug: e.target.value })
                  }
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                  placeholder="technology"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={categoryForm.isActive}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, isActive: e.target.checked })
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
                  {editingCategory ? 'حفظ التغييرات' : 'إضافة'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
