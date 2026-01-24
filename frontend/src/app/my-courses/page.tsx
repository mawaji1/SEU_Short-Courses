"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    Clock,
    Award,
    Loader2,
    AlertCircle,
    PlayCircle,
    Calendar,
    TrendingUp,
    BookOpen,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth";

interface Enrollment {
    id: string;
    status: string;
    progress: number;
    completionStatus: string | null;
    completionPercentage: number | null;
    certificateEligible: boolean;
    cohort: {
        id: string;
        nameAr: string;
        nameEn: string;
        startDate: string;
        endDate: string;
        status: string;
        program: {
            id: string;
            titleAr: string;
            titleEn: string;
            descriptionAr: string;
            slug: string;
            type: string;
            certificateEnabled: boolean;
        };
        instructor: {
            nameAr: string;
            nameEn: string;
        } | null;
    };
    certificate: {
        id: string;
        number: string;
        verificationCode: string;
        status: string;
    } | null;
}

export default function MyCoursesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEnrollments = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/my-courses`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setEnrollments(data);
                } else {
                    if (response.status === 401) {
                        // Unauthorized - redirect to login
                        router.push('/login?redirect=/my-courses');
                        return;
                    }
                    setEnrollments([]);
                }
            } catch (err: any) {
                console.error('Error loading enrollments:', err);
                setError(err.message || "حدث خطأ في تحميل البيانات");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            loadEnrollments();
        } else {
            setIsLoading(false);
        }
    }, [user, router]);

    const getStatusBadge = (enrollment: Enrollment) => {
        const status = enrollment.status;

        if (status === "COMPLETED") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    مكتمل
                </span>
            );
        }

        if (status === "FAILED") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                    <XCircle className="w-4 h-4" />
                    غير مكتمل
                </span>
            );
        }

        if (status === "IN_PROGRESS" || status === "ENROLLED") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    قيد الدراسة
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                {status}
            </span>
        );
    };

    const getCompletionMessage = (enrollment: Enrollment) => {
        const attendanceThreshold = enrollment.cohort.program.certificateEnabled
            ? 80
            : 100;
        const currentAttendance = enrollment.completionPercentage || enrollment.progress;

        if (enrollment.status === "COMPLETED" && enrollment.certificateEligible) {
            return {
                type: 'success' as const,
                icon: <CheckCircle2 className="w-5 h-5" />,
                message: 'مؤهل للحصول على الشهادة',
                color: 'text-green-700 bg-green-50'
            };
        }

        if (enrollment.status === "COMPLETED" && !enrollment.certificateEligible) {
            return {
                type: 'warning' as const,
                icon: <AlertTriangle className="w-5 h-5" />,
                message: `أكملت البرنامج لكن نسبة الحضور (${currentAttendance}%) أقل من المطلوب (${attendanceThreshold}%)`,
                color: 'text-amber-700 bg-amber-50'
            };
        }

        if (enrollment.status === "FAILED") {
            return {
                type: 'error' as const,
                icon: <XCircle className="w-5 h-5" />,
                message: `لم يتم إكمال البرنامج - نسبة الحضور: ${currentAttendance}% (المطلوب: ${attendanceThreshold}%)`,
                color: 'text-red-700 bg-red-50'
            };
        }

        if (enrollment.certificateEligible) {
            return {
                type: 'success' as const,
                icon: <CheckCircle2 className="w-5 h-5" />,
                message: `حضورك ممتاز! نسبة الحضور: ${currentAttendance}%`,
                color: 'text-green-700 bg-green-50'
            };
        }

        return {
            type: 'info' as const,
            icon: <TrendingUp className="w-5 h-5" />,
            message: `نسبة الحضور: ${currentAttendance}% - المطلوب للشهادة: ${attendanceThreshold}%`,
            color: 'text-blue-700 bg-blue-50'
        };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">جاري تحميل البرامج التدريبية...</p>
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

    // Calculate statistics
    const activeEnrollments = enrollments.filter(e => e.status === "IN_PROGRESS" || e.status === "ENROLLED");
    const completedEnrollments = enrollments.filter(e => e.status === "COMPLETED");
    const certificatesEarned = enrollments.filter(e => e.certificate && e.certificate.status === "ISSUED").length;

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
                                    برامجي التدريبية
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-lg text-gray-200"
                                >
                                    تابع تقدمك واستمر في التعلم
                                </motion.p>
                            </div>
                            <div className="hidden md:block">
                                <Button
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10"
                                    asChild
                                >
                                    <Link href="/programs">
                                        استكشف برامج جديدة
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                    </Link>
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
                                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-7 h-7 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{activeEnrollments.length}</p>
                                    <p className="text-gray-600">برامج نشطة</p>
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
                                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="w-7 h-7 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{completedEnrollments.length}</p>
                                    <p className="text-gray-600">برامج مكتملة</p>
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
                                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Award className="w-7 h-7 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{certificatesEarned}</p>
                                    <p className="text-gray-600">شهادات</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* My Courses */}
                <section className="container mx-auto px-4 py-12">
                    {enrollments.length === 0 ? (
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
                            {enrollments.map((enrollment, index) => (
                                <motion.div
                                    key={enrollment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/my-courses/${enrollment.id}`)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <GraduationCap className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {enrollment.cohort.program.titleAr}
                                                        </h3>
                                                        {getStatusBadge(enrollment)}
                                                    </div>
                                                    <p className="text-gray-600 mb-3">
                                                        {enrollment.cohort.nameAr}
                                                    </p>

                                                    {/* Progress Bar */}
                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-600">التقدم</span>
                                                            <span className="text-sm font-medium text-primary">
                                                                {enrollment.completionPercentage || enrollment.progress}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all"
                                                                style={{
                                                                    width: `${enrollment.completionPercentage || enrollment.progress}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Completion Status Message */}
                                                    {(() => {
                                                        const completionMsg = getCompletionMessage(enrollment);
                                                        return (
                                                            <div className={`mb-3 p-3 rounded-lg ${completionMsg.color}`}>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    {completionMsg.icon}
                                                                    <span className="font-medium">{completionMsg.message}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            يبدأ: {formatDate(enrollment.cohort.startDate)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            ينتهي: {formatDate(enrollment.cohort.endDate)}
                                                        </span>
                                                        {enrollment.cohort.instructor && (
                                                            <span className="flex items-center gap-1.5">
                                                                <BookOpen className="w-4 h-4" />
                                                                {enrollment.cohort.instructor.nameAr}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {enrollment.status === "IN_PROGRESS" || enrollment.status === "ENROLLED" ? (
                                                <Button className="gap-2">
                                                    <PlayCircle className="w-4 h-4" />
                                                    متابعة التعلم
                                                </Button>
                                            ) : enrollment.certificate ? (
                                                <Button variant="outline" className="gap-2">
                                                    <Award className="w-4 h-4" />
                                                    عرض الشهادة
                                                </Button>
                                            ) : null}
                                            <Button variant="outline" asChild>
                                                <Link href={`/my-courses/${enrollment.id}`}>
                                                    التفاصيل
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </ProtectedRoute>
    );
}
