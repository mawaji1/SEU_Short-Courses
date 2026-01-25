'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Globe,
  Moon,
  Sun,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  courseUpdates: boolean;
  newMessages: boolean;
  promotions: boolean;
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    courseUpdates: true,
    newMessages: true,
    promotions: false,
  });
  const [language, setLanguage] = useState('ar');
  const [theme, setTheme] = useState('light');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Settings className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-600">تخصيص تجربتك في المنصة</p>
        </div>
      </motion.div>

      {/* Success Message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700"
        >
          <CheckCircle className="h-5 w-5" />
          <span>تم حفظ الإعدادات بنجاح</span>
        </motion.div>
      )}

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-900">الإشعارات</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">إشعارات البريد الإلكتروني</p>
              <p className="text-sm text-gray-500">استلام الإشعارات عبر البريد الإلكتروني</p>
            </div>
            <button
              onClick={() => toggleNotification('emailNotifications')}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                notifications.emailNotifications ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  notifications.emailNotifications ? 'right-1' : 'right-6'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">تحديثات الدورات</p>
              <p className="text-sm text-gray-500">إشعارات عند إضافة محتوى جديد</p>
            </div>
            <button
              onClick={() => toggleNotification('courseUpdates')}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                notifications.courseUpdates ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  notifications.courseUpdates ? 'right-1' : 'right-6'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">الرسائل الجديدة</p>
              <p className="text-sm text-gray-500">إشعارات عند استلام رسالة من المدرب</p>
            </div>
            <button
              onClick={() => toggleNotification('newMessages')}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                notifications.newMessages ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  notifications.newMessages ? 'right-1' : 'right-6'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">العروض والتخفيضات</p>
              <p className="text-sm text-gray-500">إشعارات عن العروض والبرامج الجديدة</p>
            </div>
            <button
              onClick={() => toggleNotification('promotions')}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                notifications.promotions ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  notifications.promotions ? 'right-1' : 'right-6'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Language & Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-900">اللغة والمظهر</h2>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-3 font-medium text-gray-900">لغة الواجهة</p>
            <div className="flex gap-3">
              <button
                onClick={() => setLanguage('ar')}
                className={`flex-1 rounded-xl border-2 px-4 py-3 font-medium transition-colors ${
                  language === 'ar'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 rounded-xl border-2 px-4 py-3 font-medium transition-colors ${
                  language === 'en'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-3 font-medium text-gray-900">المظهر</p>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-medium transition-colors ${
                  theme === 'light'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Sun className="h-5 w-5" />
                فاتح
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-medium transition-colors ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <Moon className="h-5 w-5" />
                داكن
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              * الوضع الداكن غير متاح حالياً
            </p>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-primary-dark hover:shadow-xl disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ الإعدادات'
          )}
        </button>
      </motion.div>
    </div>
  );
}
