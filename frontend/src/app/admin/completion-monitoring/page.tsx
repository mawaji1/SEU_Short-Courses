'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Clock, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';

interface CompletionStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  averageProgress: number;
  completionRate: number;
}

interface CohortWithStats {
  id: string;
  nameAr: string;
  programName: string;
  startDate: string;
  status: string;
  stats: CompletionStats;
}

export default function CompletionMonitoringPage() {
  const [cohorts, setCohorts] = useState<CohortWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      
      // Get all cohorts
      const cohortsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cohorts`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!cohortsResponse.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const cohortsData = await cohortsResponse.json();

      // Get completion stats for each cohort
      const cohortsWithStats = await Promise.all(
        cohortsData.map(async (cohort: any) => {
          try {
            const statsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/blackboard/completion/stats/cohort/${cohort.id}`,
              {
                headers: {
                  Authorization: `Bearer ${auth.accessToken}`,
                },
              },
            );

            const stats = statsResponse.ok
              ? await statsResponse.json()
              : {
                  total: 0,
                  completed: 0,
                  inProgress: 0,
                  notStarted: 0,
                  averageProgress: 0,
                  completionRate: 0,
                };

            return {
              id: cohort.id,
              nameAr: cohort.nameAr,
              programName: cohort.program?.titleAr || 'غير محدد',
              startDate: cohort.startDate,
              status: cohort.status,
              stats,
            };
          } catch (err) {
            return {
              id: cohort.id,
              nameAr: cohort.nameAr,
              programName: cohort.program?.titleAr || 'غير محدد',
              startDate: cohort.startDate,
              status: cohort.status,
              stats: {
                total: 0,
                completed: 0,
                inProgress: 0,
                notStarted: 0,
                averageProgress: 0,
                completionRate: 0,
              },
            };
          }
        }),
      );

      setCohorts(cohortsWithStats);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCohort = async (cohortId: string) => {
    try {
      setSyncing(cohortId);
      setError('');
      setSuccess('');

      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);

      // Get all enrollments for this cohort
      const enrollmentsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments?cohortId=${cohortId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!enrollmentsResponse.ok) {
        throw new Error('فشل في جلب التسجيلات');
      }

      const enrollments = await enrollmentsResponse.json();
      const enrollmentIds = enrollments.map((e: any) => e.id);

      if (enrollmentIds.length === 0) {
        setSuccess('لا توجد تسجيلات لمزامنتها');
        return;
      }

      // Bulk sync completion
      const syncResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blackboard/completion/sync/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({ enrollmentIds }),
        },
      );

      if (!syncResponse.ok) {
        throw new Error('فشل في مزامنة حالة الإكمال');
      }

      const result = await syncResponse.json();
      setSuccess(`تمت المزامنة بنجاح: ${result.successful} ناجح، ${result.failed} فاشل`);
      
      // Refresh data
      await fetchCohorts();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء المزامنة');
    } finally {
      setSyncing(null);
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

  const totalEnrollments = cohorts.reduce((sum, c) => sum + c.stats.total, 0);
  const totalCompleted = cohorts.reduce((sum, c) => sum + c.stats.completed, 0);
  const overallCompletionRate =
    totalEnrollments > 0 ? Math.round((totalCompleted / totalEnrollments) * 100) : 0;
  const totalInProgress = cohorts.reduce((sum, c) => sum + c.stats.inProgress, 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مراقبة إكمال الدورات</h1>
          <p className="text-gray-600">
            تتبع تقدم المتعلمين ومعدلات إكمال الدورات من Blackboard
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">إجمالي التسجيلات</div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalEnrollments}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">المكتملة</div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{totalCompleted}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">قيد التقدم</div>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">{totalInProgress}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">معدل الإكمال</div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{overallCompletionRate}%</div>
          </div>
        </div>

        {/* Cohorts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">الدفعات</h2>
            <Button onClick={fetchCohorts} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    البرنامج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الدفعة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجمالي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    مكتمل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    قيد التقدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    لم يبدأ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    متوسط التقدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    معدل الإكمال
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cohorts.map((cohort) => (
                  <tr key={cohort.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cohort.programName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{cohort.nameAr}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          cohort.status === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-800'
                            : cohort.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {cohort.status === 'IN_PROGRESS'
                          ? 'جارية'
                          : cohort.status === 'COMPLETED'
                          ? 'مكتملة'
                          : cohort.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{cohort.stats.total}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {cohort.stats.completed}
                    </td>
                    <td className="px-6 py-4 text-sm text-yellow-600">
                      {cohort.stats.inProgress}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cohort.stats.notStarted}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${cohort.stats.averageProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {cohort.stats.averageProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-bold ${
                          cohort.stats.completionRate >= 80
                            ? 'text-green-600'
                            : cohort.stats.completionRate >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {cohort.stats.completionRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        onClick={() => handleSyncCohort(cohort.id)}
                        disabled={syncing === cohort.id}
                        size="sm"
                        variant="outline"
                      >
                        {syncing === cohort.id ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري المزامنة...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 ml-2" />
                            مزامنة
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cohorts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد دفعات متاحة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
