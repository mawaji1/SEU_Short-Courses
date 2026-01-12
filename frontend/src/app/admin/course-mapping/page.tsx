'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface CourseMapping {
  cohortId: string;
  cohortName: string;
  programName: string;
  blackboardCourseId: string | null;
  isMapped: boolean;
  startDate: string;
  status: string;
}

export default function CourseMappingPage() {
  const [mappings, setMappings] = useState<CourseMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [courseId, setCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blackboard/courses/mappings`,
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
      setMappings(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleMapCourse = async (cohortId: string, blackboardCourseId: string) => {
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blackboard/courses/map`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({
            cohortId,
            blackboardCourseId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في ربط الدورة');
      }

      setSuccess('تم ربط الدورة بنجاح');
      setSelectedCohort(null);
      setCourseId('');
      await fetchMappings();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء ربط الدورة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnmapCourse = async (cohortId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء ربط هذه الدورة؟')) {
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blackboard/courses/unmap/${cohortId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في إلغاء ربط الدورة');
      }

      setSuccess('تم إلغاء ربط الدورة بنجاح');
      await fetchMappings();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إلغاء ربط الدورة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitMapping = () => {
    if (!selectedCohort || !courseId.trim()) {
      setError('يرجى اختيار الدفعة وإدخال معرف الدورة');
      return;
    }
    handleMapCourse(selectedCohort, courseId.trim());
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ربط الدفعات بدورات Blackboard
          </h1>
          <p className="text-gray-600">
            قم بربط كل دفعة بدورة Blackboard المقابلة لها لتفعيل التسجيل التلقائي
          </p>
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

        {/* Mapping Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ربط دفعة جديدة</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر الدفعة
              </label>
              <select
                value={selectedCohort || ''}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={submitting}
              >
                <option value="">-- اختر الدفعة --</option>
                {mappings
                  .filter((m) => !m.isMapped)
                  .map((mapping) => (
                    <option key={mapping.cohortId} value={mapping.cohortId}>
                      {mapping.programName} - {mapping.cohortName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                معرف دورة Blackboard
              </label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="bb_course_12345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={submitting}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSubmitMapping}
                disabled={submitting || !selectedCohort || !courseId.trim()}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الربط...
                  </>
                ) : (
                  'ربط الدورة'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mappings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">جميع الدفعات</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    البرنامج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدفعة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ البدء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    معرف دورة Blackboard
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    حالة الربط
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mappings.map((mapping) => (
                  <tr key={mapping.cohortId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mapping.programName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {mapping.cohortName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(mapping.startDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          mapping.status === 'UPCOMING'
                            ? 'bg-blue-100 text-blue-800'
                            : mapping.status === 'OPEN'
                            ? 'bg-green-100 text-green-800'
                            : mapping.status === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {mapping.status === 'UPCOMING'
                          ? 'قادمة'
                          : mapping.status === 'OPEN'
                          ? 'مفتوحة'
                          : mapping.status === 'IN_PROGRESS'
                          ? 'جارية'
                          : mapping.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      {mapping.blackboardCourseId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mapping.isMapped ? (
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">مربوطة</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-yellow-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">غير مربوطة</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {mapping.isMapped && (
                        <button
                          onClick={() => handleUnmapCourse(mapping.cohortId)}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          إلغاء الربط
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mappings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد دفعات متاحة</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">إجمالي الدفعات</div>
            <div className="text-3xl font-bold text-gray-900">{mappings.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">الدفعات المربوطة</div>
            <div className="text-3xl font-bold text-green-600">
              {mappings.filter((m) => m.isMapped).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">الدفعات غير المربوطة</div>
            <div className="text-3xl font-bold text-yellow-600">
              {mappings.filter((m) => !m.isMapped).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
