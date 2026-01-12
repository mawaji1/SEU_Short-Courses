'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Loader2, Shield, User, Calendar } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterResource, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      
      // Build query params
      const params = new URLSearchParams();
      if (filterAction) params.append('action', filterAction);
      if (filterResource) params.append('resource', filterResource);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', '100');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/audit/logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في جلب السجلات');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const actionLabels: Record<string, string> = {
    CREATE: 'إنشاء',
    UPDATE: 'تحديث',
    DELETE: 'حذف',
    LOGIN: 'تسجيل دخول',
    LOGOUT: 'تسجيل خروج',
    APPROVE: 'موافقة',
    REJECT: 'رفض',
    ASSIGN: 'تعيين',
    UNASSIGN: 'إلغاء تعيين',
  };

  const resourceLabels: Record<string, string> = {
    USER: 'مستخدم',
    PROGRAM: 'برنامج',
    COHORT: 'دفعة',
    ENROLLMENT: 'تسجيل',
    CERTIFICATE: 'شهادة',
    PAYMENT: 'دفعة مالية',
    PROMO_CODE: 'كود خصم',
  };

  const actionColors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-purple-100 text-purple-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
    APPROVE: 'bg-green-100 text-green-700',
    REJECT: 'bg-red-100 text-red-700',
    ASSIGN: 'bg-blue-100 text-blue-700',
    UNASSIGN: 'bg-orange-100 text-orange-700',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">سجل التدقيق</h1>
          <p className="text-gray-600">تتبع جميع إجراءات المدراء والمستخدمين</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-5 h-5" />
          تصدير
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">إجمالي الإجراءات</div>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">اليوم</div>
          <div className="text-3xl font-bold text-blue-600">
            {logs.filter((l) => {
              const today = new Date().toDateString();
              return new Date(l.createdAt).toDateString() === today;
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">عمليات الإنشاء</div>
          <div className="text-3xl font-bold text-green-600">
            {logs.filter((l) => l.action === 'CREATE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">عمليات الحذف</div>
          <div className="text-3xl font-bold text-red-600">
            {logs.filter((l) => l.action === 'DELETE').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value="">جميع الإجراءات</option>
            <option value="CREATE">إنشاء</option>
            <option value="UPDATE">تحديث</option>
            <option value="DELETE">حذف</option>
            <option value="LOGIN">تسجيل دخول</option>
            <option value="APPROVE">موافقة</option>
            <option value="REJECT">رفض</option>
          </select>

          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value="">جميع الموارد</option>
            <option value="USER">مستخدم</option>
            <option value="PROGRAM">برنامج</option>
            <option value="COHORT">دفعة</option>
            <option value="ENROLLMENT">تسجيل</option>
            <option value="CERTIFICATE">شهادة</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
            placeholder="من تاريخ"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
            placeholder="إلى تاريخ"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                التاريخ والوقت
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                المستخدم
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                الإجراء
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                المورد
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                التفاصيل
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(log.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {log.user.firstName} {log.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{log.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      actionColors[log.action] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {actionLabels[log.action] || log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">
                    {resourceLabels[log.resource] || log.resource}
                    {log.resourceId && (
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {log.resourceId.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {log.details || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-500 font-mono">
                    {log.ipAddress || '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد سجلات</p>
          </div>
        )}
      </div>
    </div>
  );
}
