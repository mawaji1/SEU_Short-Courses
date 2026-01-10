"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
    User,
    BookOpen,
    Clock,
    CalendarDays,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    Settings,
    LogOut,
    Loader2,
    GraduationCap,
    PlayCircle,
    Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth";

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // TODO: Fetch user registrations from API
                // const registrationsData = await getUserRegistrations();
                // setRegistrations(registrationsData);
                
                // For now, set empty array
                setRegistrations([]);
            } catch (err: any) {
                setError(err.message || "حدث خطأ في تحميل البيانات");
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        مؤكد
                    </span>
                );
            case "PENDING_PAYMENT":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        في انتظار الدفع
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        ملغي
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                        {status}
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoadingData) {
        return (
            <ProtectedRoute>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
                    </div>
                </main>
                <Footer />
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">حدث خطأ</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            إعادة المحاولة
                        </Button>
                    </div>
                </main>
                <Footer />
            </ProtectedRoute>
        );
    }

    const confirmedRegistrations = registrations.filter(r => r.status === "CONFIRMED");
    const pendingRegistrations = registrations.filter(r => r.status === "PENDING_PAYMENT");

    return (
        <ProtectedRoute>
            <Header />
            <main className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl md:text-4xl font-bold mb-2"
                                >
                                    مرحباً، {user?.firstName}! 👋
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-lg text-gray-200"
                                >
                                    استمر في رحلتك التدريبية
                                </motion.p>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10"
                                    onClick={() => router.push("/profile")}
                                >
                                    <Settings className="w-4 h-4 ml-2" />
                                    الإعدادات
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4 ml-2" />
                                    تسجيل الخروج
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Cards */}
                <section className="container mx-auto px-4 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{confirmedRegistrations.length}</p>
                                    <p className="text-gray-600">برامج مسجلة</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-7 h-7 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{pendingRegistrations.length}</p>
                                    <p className="text-gray-600">في انتظار الدفع</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Award className="w-7 h-7 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">0</p>
                                    <p className="text-gray-600">شهادات</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* My Programs */}
                <section className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">برامجي التدريبية</h2>
                        <Button asChild variant="outline">
                            <Link href="/programs">
                                تصفح البرامج
                                <ChevronLeft className="w-4 h-4 mr-2" />
                            </Link>
                        </Button>
                    </div>

                    {registrations.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-12 text-center"
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                لم تسجل في أي برنامج بعد
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                استكشف مجموعة البرامج التدريبية المتميزة وابدأ رحلتك في التعلم
                            </p>
                            <Button asChild size="lg">
                                <Link href="/programs">
                                    استكشف البرامج
                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6">
                            {registrations.map((registration, index) => (
                                <motion.div
                                    key={registration.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <GraduationCap className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {registration.cohort.program.titleAr}
                                                        </h3>
                                                        {getStatusBadge(registration.status)}
                                                    </div>
                                                    <p className="text-gray-600 mb-3">
                                                        {registration.cohort.nameAr}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <CalendarDays className="w-4 h-4" />
                                                            يبدأ: {formatDate(registration.cohort.startDate)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <CalendarDays className="w-4 h-4" />
                                                            ينتهي: {formatDate(registration.cohort.endDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {registration.status === "CONFIRMED" ? (
                                                <Button className="gap-2">
                                                    <PlayCircle className="w-4 h-4" />
                                                    ابدأ التعلم
                                                </Button>
                                            ) : registration.status === "PENDING_PAYMENT" ? (
                                                <Button asChild variant="default" className="bg-amber-600 hover:bg-amber-700">
                                                    <Link href={`/checkout?program=${registration.cohort.program.slug}`}>
                                                        إكمال الدفع
                                                    </Link>
                                                </Button>
                                            ) : null}
                                            <Button variant="outline" asChild>
                                                <Link href={`/programs/${registration.cohort.program.slug}`}>
                                                    عرض التفاصيل
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Quick Actions */}
                <section className="container mx-auto px-4 pb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">إجراءات سريعة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            href="/profile"
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <User className="w-6 h-6 text-primary group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">الملف الشخصي</h3>
                                    <p className="text-sm text-gray-600">إدارة بياناتك الشخصية</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/programs"
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                                    <BookOpen className="w-6 h-6 text-accent group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">البرامج التدريبية</h3>
                                    <p className="text-sm text-gray-600">استكشف المزيد من البرامج</p>
                                </div>
                            </div>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all group text-right w-full"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-colors">
                                    <LogOut className="w-6 h-6 text-red-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">تسجيل الخروج</h3>
                                    <p className="text-sm text-gray-600">الخروج من الحساب</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
