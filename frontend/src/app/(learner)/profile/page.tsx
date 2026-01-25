'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit2,
  Shield,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  // Profile edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل تحديث الملف الشخصي');
      }

      setProfileSuccess(true);
      setIsEditMode(false);

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل تغيير كلمة المرور');
      }

      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="bg-gradient-to-br from-primary via-primary to-primary-dark p-8">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-4xl font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="text-white">
              <h1 className="mb-1 text-3xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-white/80">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm text-white">
                    <CheckCircle className="h-4 w-4" />
                    البريد مُفعّل
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-sm text-white">
                    <AlertCircle className="h-4 w-4" />
                    البريد غير مُفعّل
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">المعلومات الشخصية</h2>
          {!isEditMode && (
            <button
              onClick={() => {
                setIsEditMode(true);
                setProfileData({
                  firstName: user?.firstName || '',
                  lastName: user?.lastName || '',
                  phone: user?.phone || '',
                });
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
            >
              <Edit2 className="h-4 w-4" />
              تعديل
            </button>
          )}
        </div>

        {profileSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">تم تحديث الملف الشخصي بنجاح</span>
          </div>
        )}

        {isEditMode ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  الاسم الأول
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  اسم العائلة
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                رقم الجوال
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="05xxxxxxxx"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                البريد الإلكتروني (غير قابل للتعديل)
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="h-12 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-500"
              />
            </div>

            {profileError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{profileError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(false);
                  setProfileError(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                إلغاء
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-6">
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">الاسم الكامل</p>
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">رقم الجوال</p>
                <p className="font-medium text-gray-900">{user?.phone || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">الأمان</h2>
        </div>

        {!showPasswordForm ? (
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900">كلمة المرور</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
            >
              تغيير
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl bg-gray-50 p-6"
          >
            {passwordSuccess ? (
              <div className="py-4 text-center">
                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
                <p className="font-medium text-green-700">
                  تم تغيير كلمة المرور بنجاح
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    كلمة المرور الحالية
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{passwordError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      'حفظ كلمة المرور'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordError(null);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
