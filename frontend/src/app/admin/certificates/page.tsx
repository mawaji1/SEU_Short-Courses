'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Award, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';

interface Enrollment {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  cohort: {
    nameAr: string;
    program: {
      titleAr: string;
    };
  };
  status: string;
  completedAt: string | null;
  certificateEligible: boolean;
  certificate?: {
    id: string;
    number: string;
    issuedAt: string;
    status: string;
  };
}

export default function AdminCertificatesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEligibleEnrollments();
  }, []);

  const fetchEligibleEnrollments = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      
      // Fetch eligible enrollments for certificates
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/eligible-enrollments`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (enrollmentId: string) => {
    try {
      setGenerating(enrollmentId);
      setError('');
      setSuccess('');

      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({
            enrollmentId,
            locale: 'ar',
          }),
        },
      );

      if (!response.ok) {
        throw new Error('فشل في إنشاء الشهادة');
      }

      setSuccess('تم إنشاء الشهادة بنجاح');
      await fetchEligibleEnrollments();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الشهادة');
    } finally {
      setGenerating(null);
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

  const eligibleCount = enrollments.filter((e) => e.certificateEligible && !e.certificate).length;
  const issuedCount = enrollments.filter((e) => e.certificate).length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Award className="w-8 h-8 text-primary" />
              إدارة الشهادات
            </h1>
            <p className="text-gray-600">
              إصدار وإدارة شهادات إتمام البرامج التدريبية
            </p>
          </div>
          <Button onClick={fetchEligibleEnrollments} variant="outline">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">إجمالي المكتملة</div>
            <div className="text-3xl font-bold text-gray-900">{enrollments.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">مؤهلة للشهادة</div>
            <div className="text-3xl font-bold text-yellow-600">{eligibleCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">الشهادات الصادرة</div>
            <div className="text-3xl font-bold text-green-600">{issuedCount}</div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">التسجيلات المكتملة</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المتدرب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    البرنامج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الدفعة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    تاريخ الإكمال
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
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {enrollment.cohort.program.titleAr}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {enrollment.cohort.nameAr}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {enrollment.completedAt
                        ? new Date(enrollment.completedAt).toLocaleDateString('ar-SA')
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.certificate ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            صادرة
                          </span>
                        </div>
                      ) : enrollment.certificateEligible ? (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-600">
                            مؤهل
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            غير مؤهل
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.certificate ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-mono">
                            {enrollment.certificate.number}
                          </span>
                        </div>
                      ) : enrollment.certificateEligible ? (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateCertificate(enrollment.id)}
                          disabled={generating === enrollment.id}
                        >
                          {generating === enrollment.id ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              جاري الإنشاء...
                            </>
                          ) : (
                            <>
                              <Award className="w-4 h-4 ml-2" />
                              إصدار الشهادة
                            </>
                          )}
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {enrollments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد تسجيلات مكتملة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
