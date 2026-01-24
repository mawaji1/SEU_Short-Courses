'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Shield, Ban, CheckCircle, Loader2, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        setError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('فشل في جلب المستخدمين');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedUser.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (!response.ok) {
        throw new Error('فشل في تغيير الدور');
      }

      setSuccess('تم تغيير دور المستخدم بنجاح');
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تغيير الدور');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      setError('');
      setSuccess('');

      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        },
      );

      if (!response.ok) {
        throw new Error('فشل في تغيير حالة المستخدم');
      }

      setSuccess(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !filterRole || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    OPERATIONS: 'bg-blue-100 text-blue-700',
    FINANCE: 'bg-green-100 text-green-700',
    CORPORATE_COORDINATOR: 'bg-purple-100 text-purple-700',
    INSTRUCTOR: 'bg-orange-100 text-orange-700',
    PROGRAM_MANAGER: 'bg-teal-100 text-teal-700',
    LEARNER: 'bg-gray-100 text-gray-700',
  };

  const roleLabels: Record<string, string> = {
    ADMIN: 'مدير',
    OPERATIONS: 'عمليات',
    FINANCE: 'مالية',
    CORPORATE_COORDINATOR: 'منسق الشركة',
    INSTRUCTOR: 'مدرب',
    PROGRAM_MANAGER: 'مدير البرنامج',
    LEARNER: 'متدرب',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-600">عرض وإدارة جميع مستخدمي النظام</p>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <select
            value={filterRole || ''}
            onChange={(e) => setFilterRole(e.target.value || null)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
          >
            <option value="">جميع الأدوار</option>
            <option value="ADMIN">مدير</option>
            <option value="OPERATIONS">عمليات</option>
            <option value="FINANCE">مالية</option>
            <option value="CORPORATE_COORDINATOR">منسق الشركة</option>
            <option value="INSTRUCTOR">مدرب</option>
            <option value="PROGRAM_MANAGER">مدير البرنامج</option>
            <option value="LEARNER">متدرب</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">إجمالي المستخدمين</div>
          <div className="text-3xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">المدراء</div>
          <div className="text-3xl font-bold text-red-600">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">النشطون</div>
          <div className="text-3xl font-bold text-green-600">
            {users.filter((u) => u.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">المتدربون</div>
          <div className="text-3xl font-bold text-blue-600">
            {users.filter((u) => u.role === 'LEARNER').length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                المستخدم
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                البريد الإلكتروني
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الدور</th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                الحالة
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                تاريخ التسجيل
              </th>
              <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {roleLabels[user.role] || user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {user.isActive ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setNewRole(user.role);
                        setShowRoleModal(true);
                      }}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      title="تغيير الدور"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`p-2 rounded-lg ${user.isActive
                          ? 'hover:bg-red-50 text-red-600'
                          : 'hover:bg-green-50 text-green-600'
                        }`}
                      title={user.isActive ? 'تعطيل' : 'تفعيل'}
                    >
                      {user.isActive ? (
                        <Ban className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا يوجد مستخدمون</p>
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">تغيير دور المستخدم</h2>
              <button onClick={() => setShowRoleModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                المستخدم: {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                الدور الجديد
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
              >
                <option value="LEARNER">متدرب</option>
                <option value="CORPORATE_COORDINATOR">منسق الشركة</option>
                <option value="INSTRUCTOR">مدرب</option>
                <option value="PROGRAM_MANAGER">مدير البرنامج</option>
                <option value="OPERATIONS">عمليات</option>
                <option value="FINANCE">مالية</option>
                <option value="ADMIN">مدير</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleChangeRole}
                disabled={updating || newRole === selectedUser.role}
                className="flex-1"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تغيير الدور'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRoleModal(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
