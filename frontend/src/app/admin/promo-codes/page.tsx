'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, CheckCircle, XCircle, Percent, DollarSign, Calendar } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  maxUses: number | null;
  usedCount: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  programId: string | null;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: '',
    maxUses: '',
    minPurchase: '',
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, [includeInactive]);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/promo-codes?includeInactive=${includeInactive}`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('يرجى تسجيل الدخول أولاً - انتهت صلاحية الجلسة');
        }
        throw new Error(`فشل في جلب أكواد الخصم (${response.status})`);
      }

      const data = await response.json();
      setPromoCodes(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.value) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      
      const payload = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        validFrom: new Date(formData.validFrom),
        validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/promo-codes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إنشاء كود الخصم');
      }

      setSuccess('تم إنشاء كود الخصم بنجاح');
      setShowCreateForm(false);
      setFormData({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        maxUses: '',
        minPurchase: '',
        maxDiscount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
      });
      await fetchPromoCodes();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء كود الخصم');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('هل أنت متأكد من تعطيل هذا الكود؟')) {
      return;
    }

    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/promo-codes/${id}/deactivate`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في تعطيل كود الخصم');
      }

      setSuccess('تم تعطيل كود الخصم بنجاح');
      await fetchPromoCodes();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تعطيل كود الخصم');
    }
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

  const activeCount = promoCodes.filter((p) => p.isActive).length;
  const totalUsage = promoCodes.reduce((sum, p) => sum + p.usedCount, 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة أكواد الخصم</h1>
            <p className="text-gray-600">إنشاء وإدارة أكواد الخصم للبرامج التدريبية</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 ml-2" />
            إنشاء كود جديد
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إنشاء كود خصم جديد</h2>
            
            <form onSubmit={handleCreatePromoCode} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الكود <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الخصم <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED_AMOUNT">مبلغ ثابت (ر.س)</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القيمة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'PERCENTAGE' ? '10' : '100'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'PERCENTAGE' ? 'نسبة الخصم (0-100)' : 'مبلغ الخصم بالريال'}
                  </p>
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأقصى للاستخدام
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="غير محدود"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">اتركه فارغاً للاستخدام غير المحدود</p>
                </div>

                {/* Min Purchase */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأدنى للشراء (ر.س)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Max Discount (for percentage only) */}
                {formData.type === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحد الأقصى للخصم (ر.س)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="غير محدود"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">سقف الخصم للنسبة المئوية</p>
                  </div>
                )}

                {/* Valid From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صالح من <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صالح حتى
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">اتركه فارغاً لعدم انتهاء الصلاحية</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    'إنشاء كود الخصم'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={submitting}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">إجمالي الأكواد</div>
            <div className="text-3xl font-bold text-gray-900">{promoCodes.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">الأكواد النشطة</div>
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">إجمالي الاستخدامات</div>
            <div className="text-3xl font-bold text-blue-600">{totalUsage}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            عرض الأكواد غير النشطة
          </label>
        </div>

        {/* Promo Codes Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">أكواد الخصم</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الكود
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    القيمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الاستخدام
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحد الأدنى
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الصلاحية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-gray-900">
                      {promo.code}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-sm text-gray-700">
                        {promo.type === 'PERCENTAGE' ? (
                          <>
                            <Percent className="w-4 h-4" />
                            نسبة مئوية
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            مبلغ ثابت
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `${promo.value} ر.س`}
                      {promo.maxDiscount && (
                        <span className="text-xs text-gray-500 block">
                          (حد أقصى: {promo.maxDiscount} ر.س)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {promo.usedCount}
                      {promo.maxUses && ` / ${promo.maxUses}`}
                      {!promo.maxUses && ' / غير محدود'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {promo.minPurchase ? `${promo.minPurchase} ر.س` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(promo.validFrom).toLocaleDateString('ar-SA')}
                      </div>
                      {promo.validUntil && (
                        <div className="text-xs text-gray-500">
                          حتى {new Date(promo.validUntil).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {promo.isActive ? (
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">نشط</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-gray-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">غير نشط</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {promo.isActive && (
                        <button
                          onClick={() => handleDeactivate(promo.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          تعطيل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {promoCodes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد أكواد خصم</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
