"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Phone,
    Lock,
    ArrowRight,
    Loader2,
    CheckCircle,
    AlertCircle,
    Edit2,
    Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth";
import { authService } from "@/services/auth";

export default function ProfilePage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();

    // Profile edit state
    const [isEditMode, setIsEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
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
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/profile`,
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
                throw new Error(data.message || "فشل تحديث الملف الشخصي");
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
        } catch (err: any) {
            setProfileError(err.message || "حدث خطأ");
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("كلمات المرور غير متطابقة");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
            return;
        }

        setPasswordLoading(true);

        try {
            const token = authService.getAccessToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/change-password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword: passwordData.currentPassword,
                        newPassword: passwordData.newPassword,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "فشل تغيير كلمة المرور");
            }

            setPasswordSuccess(true);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess(false);
            }, 3000);
        } catch (err: any) {
            setPasswordError(err.message || "حدث خطأ");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <Header />
            <main className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Back to Dashboard */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-8"
                    >
                        <ArrowRight className="w-4 h-4" />
                        العودة للوحة التحكم
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Profile Header */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                                    <span className="text-4xl text-white font-bold">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                        {user?.firstName} {user?.lastName}
                                    </h1>
                                    <p className="text-gray-600">{user?.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {user?.emailVerified ? (
                                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                البريد مُفعّل
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                                                <AlertCircle className="w-4 h-4" />
                                                البريد غير مُفعّل
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">المعلومات الشخصية</h2>
                                {!isEditMode && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2"
                                        onClick={() => {
                                            setIsEditMode(true);
                                            setProfileData({
                                                firstName: user?.firstName || "",
                                                lastName: user?.lastName || "",
                                                phone: user?.phone || "",
                                            });
                                        }}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        تعديل
                                    </Button>
                                )}
                            </div>

                            {profileSuccess && (
                                <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">تم تحديث الملف الشخصي بنجاح</span>
                                </div>
                            )}

                            {isEditMode ? (
                                /* Edit Mode */
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                الاسم الأول
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                اسم العائلة
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الجوال
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                            placeholder="05xxxxxxxx"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            البريد الإلكتروني (غير قابل للتعديل)
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>

                                    {profileError && (
                                        <div className="p-3 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-sm">{profileError}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button type="submit" disabled={profileLoading}>
                                            {profileLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                                    جاري الحفظ...
                                                </>
                                            ) : (
                                                "حفظ التغييرات"
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditMode(false);
                                                setProfileError(null);
                                            }}
                                        >
                                            إلغاء
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                /* View Mode */
                                <div className="grid gap-6">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">الاسم الكامل</p>
                                            <p className="font-medium text-gray-900">
                                                {user?.firstName} {user?.lastName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                                            <p className="font-medium text-gray-900">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">رقم الجوال</p>
                                            <p className="font-medium text-gray-900">{user?.phone || "غير محدد"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Security Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-gray-900">الأمان</h2>
                            </div>

                            {!showPasswordForm ? (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">كلمة المرور</p>
                                            <p className="text-sm text-gray-500">••••••••</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPasswordForm(true)}
                                    >
                                        تغيير
                                    </Button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-gray-50 rounded-xl p-6"
                                >
                                    {passwordSuccess ? (
                                        <div className="text-center py-4">
                                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                            <p className="text-green-700 font-medium">
                                                تم تغيير كلمة المرور بنجاح
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                                    required
                                                />
                                            </div>

                                            {passwordError && (
                                                <div className="p-3 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                    <span className="text-sm">{passwordError}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 pt-2">
                                                <Button type="submit" disabled={passwordLoading}>
                                                    {passwordLoading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                                            جاري الحفظ...
                                                        </>
                                                    ) : (
                                                        "حفظ كلمة المرور"
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowPasswordForm(false);
                                                        setPasswordError(null);
                                                        setPasswordData({
                                                            currentPassword: "",
                                                            newPassword: "",
                                                            confirmPassword: "",
                                                        });
                                                    }}
                                                >
                                                    إلغاء
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </ProtectedRoute>
    );
}
