"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Calendar,
    Clock,
    Award,
    AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth";

interface AttendanceRecord {
    sessionId: string;
    sessionTitleAr: string;
    sessionTitleEn: string;
    moduleTitleAr: string;
    moduleTitleEn: string;
    sessionDate: string;
    status: 'ATTENDED' | 'ABSENT' | 'EXCUSED' | 'LATE';
    durationMinutes: number;
    attendedMinutes: number | null;
    attendancePercentage: number | null;
}

interface AttendanceSummary {
    totalSessions: number;
    attendedSessions: number;
    absentSessions: number;
    overallPercentage: number;
    certificateEligible: boolean;
    requiredPercentage: number;
    records: AttendanceRecord[];
}

export default function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAttendance = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/${resolvedParams.id}/attendance`,
                    {
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setAttendance(data);
                } else if (response.status === 404) {
                    setError("سجل الحضور غير موجود");
                } else {
                    setError("حدث خطأ في تحميل سجل الحضور");
                }
            } catch (err: any) {
                console.error('Error loading attendance:', err);
                setError(err.message || "حدث خطأ في تحميل البيانات");
            } finally {
                setIsLoading(false);
            }
        };

        if (user && resolvedParams.id) {
            loadAttendance();
        }
    }, [user, resolvedParams.id, router]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ATTENDED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        حضر
                    </span>
                );
            case 'ABSENT':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        غائب
                    </span>
                );
            case 'LATE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        متأخر
                    </span>
                );
            case 'EXCUSED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        معذور
                    </span>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">جاري تحميل سجل الحضور...</p>
                    </div>
                </main>
                <Footer />
            </ProtectedRoute>
        );
    }

    if (error || !attendance) {
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
                        <Button onClick={() => router.push(`/my-courses/${resolvedParams.id}`)}>
                            العودة للبرنامج
                        </Button>
                    </div>
                </main>
                <Footer />
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Header />
            <main className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <section className="bg-white border-b">
                    <div className="container mx-auto px-4 py-4">
                        <nav className="flex items-center gap-2 text-sm text-gray-600">
                            <Link href="/my-courses" className="hover:text-primary transition-colors">
                                برامجي التدريبية
                            </Link>
                            <ChevronLeft className="w-4 h-4" />
                            <Link
                                href={`/my-courses/${resolvedParams.id}`}
                                className="hover:text-primary transition-colors"
                            >
                                تفاصيل البرنامج
                            </Link>
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">سجل الحضور</span>
                        </nav>
                    </div>
                </section>

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-12">
                    <div className="container mx-auto px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-4xl font-bold mb-4"
                        >
                            سجل الحضور
                        </motion.h1>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-6 h-6 text-primary" />
                                <h3 className="font-bold text-gray-900">نسبة الحضور</h3>
                            </div>
                            <p className={`text-4xl font-bold ${
                                attendance.overallPercentage >= attendance.requiredPercentage
                                    ? 'text-green-600'
                                    : 'text-amber-600'
                            }`}>
                                {attendance.overallPercentage}%
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                المطلوب: {attendance.requiredPercentage}%
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <h3 className="font-bold text-gray-900">جلسات الحضور</h3>
                            </div>
                            <p className="text-4xl font-bold text-gray-900">
                                {attendance.attendedSessions}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                من {attendance.totalSessions} جلسة
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <XCircle className="w-6 h-6 text-red-600" />
                                <h3 className="font-bold text-gray-900">جلسات الغياب</h3>
                            </div>
                            <p className="text-4xl font-bold text-gray-900">
                                {attendance.absentSessions}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                من {attendance.totalSessions} جلسة
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`rounded-2xl shadow-lg p-6 ${
                                attendance.certificateEligible
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                    : 'bg-gradient-to-br from-amber-500 to-orange-600'
                            } text-white`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Award className="w-6 h-6" />
                                <h3 className="font-bold">حالة الشهادة</h3>
                            </div>
                            <p className="text-2xl font-bold">
                                {attendance.certificateEligible ? 'مؤهل' : 'غير مؤهل'}
                            </p>
                            <p className="text-sm opacity-90 mt-1">
                                {attendance.certificateEligible
                                    ? 'أنت مؤهل للحصول على الشهادة'
                                    : 'احضر المزيد من الجلسات'}
                            </p>
                        </motion.div>
                    </div>

                    {/* Attendance Records Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">سجل الحضور التفصيلي</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                جميع الجلسات مع حالة الحضور
                            </p>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الجلسة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الوحدة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            التاريخ
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المدة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {attendance.records.map((record) => (
                                        <tr key={record.sessionId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {record.sessionTitleAr}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {record.moduleTitleAr}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(record.sessionDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {record.durationMinutes} دقيقة
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(record.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {attendance.records.map((record) => (
                                <div key={record.sessionId} className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-1">
                                                {record.sessionTitleAr}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {record.moduleTitleAr}
                                            </p>
                                        </div>
                                        {getStatusBadge(record.status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(record.sessionDate)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {record.durationMinutes} دقيقة
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Info Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-blue-900 font-medium">ملاحظة</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    سجل الحضور يتم تحديثه تلقائياً من نظام إدارة التعلم (Blackboard).
                                    البيانات المعروضة هنا محسوبة بناءً على تقدمك العام في البرنامج.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Back Button */}
                    <div className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/my-courses/${resolvedParams.id}`)}
                        >
                            <ChevronLeft className="w-4 h-4 ml-2" />
                            العودة للبرنامج
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </ProtectedRoute>
    );
}
