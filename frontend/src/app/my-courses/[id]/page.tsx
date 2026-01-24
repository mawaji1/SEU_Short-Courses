"use client";

import { use } from "react";
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
    ChevronDown,
    ChevronUp,
    User,
    Download,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Copy,
    ExternalLink,
    FileText,
    File,
    Video,
    Link as LinkIcon,
    Presentation,
    Mail,
    ClipboardCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth";

interface CourseMaterial {
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    type: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENT' | 'PRESENTATION' | 'OTHER';
    fileUrl: string | null;
    externalLink: string | null;
    fileSize: number | null;
    uploadedAt: string;
}

interface CourseDetail {
    id: string;
    status: string;
    progress: number;
    completionStatus: string | null;
    completionPercentage: number | null;
    certificateEligible: boolean;
    cohort: {
        id: string;
        nameAr: string;
        startDate: string;
        endDate: string;
        status: string;
        program: {
            id: string;
            titleAr: string;
            titleEn: string;
            descriptionAr: string;
            type: string;
            durationHours: number | null;
            certificateEnabled: boolean;
            certificateAttendanceThreshold: number;
        };
        instructor: {
            nameAr: string;
            titleAr: string | null;
            bioAr: string | null;
            imageUrl: string | null;
        } | null;
    };
    curriculum: {
        id: string;
        titleAr: string;
        descriptionAr: string | null;
        durationHours: number | null;
        sortOrder: number;
        sessions: {
            id: string;
            titleAr: string;
            descriptionAr: string | null;
            durationMinutes: number | null;
            sortOrder: number;
        }[];
    }[];
    certificate: {
        id: string;
        number: string;
        pdfUrl: string | null;
        verificationCode: string;
        status: string;
    } | null;
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [copiedCode, setCopiedCode] = useState(false);

    useEffect(() => {
        const loadCourseDetail = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/${resolvedParams.id}/details`,
                    {
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setCourseDetail(data);
                    // Expand first module by default
                    if (data.curriculum && data.curriculum.length > 0) {
                        setExpandedModules(new Set([data.curriculum[0].id]));
                    }
                } else if (response.status === 404) {
                    setError("البرنامج غير موجود");
                } else if (response.status === 403) {
                    setError("ليس لديك صلاحية لعرض هذا البرنامج");
                } else {
                    setError("حدث خطأ في تحميل البيانات");
                }
            } catch (err: any) {
                console.error('Error loading course detail:', err);
                setError(err.message || "حدث خطأ في تحميل البيانات");
            } finally {
                setIsLoading(false);
            }
        };

        if (user && resolvedParams.id) {
            loadCourseDetail();
        }
    }, [user, resolvedParams.id, router]);

    useEffect(() => {
        const loadMaterials = async () => {
            if (!resolvedParams.id) return;

            try {
                setIsLoadingMaterials(true);
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/enrollments/${resolvedParams.id}/materials`,
                    {
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setMaterials(data);
                }
            } catch (err) {
                console.error('Error loading materials:', err);
            } finally {
                setIsLoadingMaterials(false);
            }
        };

        if (user && resolvedParams.id) {
            loadMaterials();
        }
    }, [user, resolvedParams.id]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const copyVerificationCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const getMaterialIcon = (type: string) => {
        switch (type) {
            case 'PDF':
                return <FileText className="w-5 h-5 text-red-600" />;
            case 'VIDEO':
                return <Video className="w-5 h-5 text-purple-600" />;
            case 'LINK':
                return <LinkIcon className="w-5 h-5 text-blue-600" />;
            case 'PRESENTATION':
                return <Presentation className="w-5 h-5 text-orange-600" />;
            case 'DOCUMENT':
            case 'OTHER':
            default:
                return <File className="w-5 h-5 text-gray-600" />;
        }
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">جاري تحميل البرنامج...</p>
                    </div>
                </main>
                <Footer />
            </ProtectedRoute>
        );
    }

    if (error || !courseDetail) {
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
                        <Button onClick={() => router.push('/my-courses')}>
                            العودة للبرامج
                        </Button>
                    </div>
                </main>
                <Footer />
            </ProtectedRoute>
        );
    }

    const totalSessions = courseDetail.curriculum.reduce(
        (sum, module) => sum + module.sessions.length,
        0
    );

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
                            <span className="text-gray-900 font-medium">
                                {courseDetail.cohort.program.titleAr}
                            </span>
                        </nav>
                    </div>
                </section>

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                        {courseDetail.cohort.program.titleAr}
                                    </h1>
                                    <p className="text-lg text-gray-200 mb-6">
                                        {courseDetail.cohort.nameAr}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                                            <Calendar className="w-4 h-4" />
                                            يبدأ: {formatDate(courseDetail.cohort.startDate)}
                                        </span>
                                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                                            <Calendar className="w-4 h-4" />
                                            ينتهي: {formatDate(courseDetail.cohort.endDate)}
                                        </span>
                                        {courseDetail.cohort.program.durationHours && (
                                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                                                <Clock className="w-4 h-4" />
                                                {courseDetail.cohort.program.durationHours} ساعة
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Progress Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                            >
                                <div className="text-center">
                                    <div className="text-6xl font-bold mb-2">
                                        {courseDetail.completionPercentage || courseDetail.progress}%
                                    </div>
                                    <div className="text-gray-200 mb-4">نسبة الإنجاز</div>
                                    <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                                        <div
                                            className="bg-white h-3 rounded-full transition-all"
                                            style={{
                                                width: `${courseDetail.completionPercentage || courseDetail.progress}%`
                                            }}
                                        />
                                    </div>
                                    {courseDetail.certificateEligible ? (
                                        <div className="flex items-center justify-center gap-2 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-green-300" />
                                            <span>مؤهل للحصول على الشهادة</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-200">
                                            متطلبات الشهادة: {courseDetail.cohort.program.certificateAttendanceThreshold}%
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="bg-gray-50 border-y border-gray-200">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`/my-courses/${resolvedParams.id}/attendance`}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg border border-gray-300 hover:border-blue-500 transition-all"
                            >
                                <ClipboardCheck className="w-4 h-4" />
                                <span className="text-sm font-medium">سجل الحضور</span>
                            </Link>
                            <Link
                                href={`/my-courses/${resolvedParams.id}/messages`}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg border border-gray-300 hover:border-blue-500 transition-all"
                            >
                                <Mail className="w-4 h-4" />
                                <span className="text-sm font-medium">رسائل المدرب</span>
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            {/* Completion Status Alert */}
                            {courseDetail.status === "COMPLETED" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl shadow-lg p-6 ${
                                        courseDetail.certificateEligible
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                            : 'bg-gradient-to-r from-amber-500 to-orange-600'
                                    } text-white`}
                                >
                                    <div className="flex items-start gap-4">
                                        {courseDetail.certificateEligible ? (
                                            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
                                        ) : (
                                            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">
                                                {courseDetail.certificateEligible
                                                    ? 'تهانينا! أكملت البرنامج بنجاح'
                                                    : 'البرنامج مكتمل'}
                                            </h3>
                                            <p className="text-white/90">
                                                {courseDetail.certificateEligible
                                                    ? `أنت مؤهل للحصول على الشهادة. نسبة حضورك: ${courseDetail.completionPercentage || courseDetail.progress}%`
                                                    : `أكملت البرنامج، لكن نسبة الحضور (${courseDetail.completionPercentage || courseDetail.progress}%) أقل من المطلوب (${courseDetail.cohort.program.certificateAttendanceThreshold}%) للحصول على الشهادة.`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {courseDetail.status === "FAILED" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white"
                                >
                                    <div className="flex items-start gap-4">
                                        <XCircle className="w-8 h-8 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">لم يتم إكمال البرنامج</h3>
                                            <p className="text-white/90">
                                                نسبة الحضور: {courseDetail.completionPercentage || courseDetail.progress}%
                                                (المطلوب: {courseDetail.cohort.program.certificateAttendanceThreshold}%)
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {(courseDetail.status === "IN_PROGRESS" || courseDetail.status === "ENROLLED") && courseDetail.certificateEligible && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white"
                                >
                                    <div className="flex items-start gap-4">
                                        <Info className="w-8 h-8 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">حضورك ممتاز!</h3>
                                            <p className="text-white/90">
                                                نسبة حضورك الحالية: {courseDetail.completionPercentage || courseDetail.progress}%
                                                - أنت على المسار الصحيح للحصول على الشهادة. استمر!
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* About */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">نظرة عامة</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {courseDetail.cohort.program.descriptionAr}
                                </p>
                            </motion.div>

                            {/* Upcoming Sessions */}
                            {(courseDetail.status === "IN_PROGRESS" || courseDetail.status === "ENROLLED") && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg p-6"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <PlayCircle className="w-6 h-6 text-primary" />
                                        الجلسات القادمة
                                    </h2>

                                    <div className="space-y-3">
                                        {courseDetail.curriculum.slice(0, 2).map((module) =>
                                            module.sessions.slice(0, 2).map((session, idx) => {
                                                const now = new Date();
                                                const cohortStart = new Date(courseDetail.cohort.startDate);
                                                const cohortEnd = new Date(courseDetail.cohort.endDate);
                                                const isActive = now >= cohortStart && now <= cohortEnd;

                                                return (
                                                    <div
                                                        key={session.id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 mb-1">
                                                                    {session.titleAr}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {module.titleAr}
                                                                </p>
                                                                {session.descriptionAr && (
                                                                    <p className="text-sm text-gray-500 line-clamp-2">
                                                                        {session.descriptionAr}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                                    {session.durationMinutes && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {session.durationMinutes} دقيقة
                                                                        </span>
                                                                    )}
                                                                    <span className={`px-2 py-0.5 rounded-full ${
                                                                        isActive
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                        {isActive ? 'جلسة نشطة' : 'قادمة'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    disabled
                                                                    className="gap-2"
                                                                    title="سيتم تفعيل الانضمام عند ربط Zoom"
                                                                >
                                                                    <PlayCircle className="w-4 h-4" />
                                                                    انضم للجلسة
                                                                </Button>
                                                                <p className="text-xs text-gray-400 mt-1 text-center">
                                                                    قريباً
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ).flat()}
                                    </div>

                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-start gap-2">
                                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-blue-900 font-medium">ملاحظة</p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    روابط الانضمام للجلسات عبر Zoom ستكون متاحة قريباً. سيتم إرسال رابط الانضمام عبر البريد الإلكتروني قبل كل جلسة.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Curriculum */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">المنهج الدراسي</h2>
                                <div className="space-y-4">
                                    {courseDetail.curriculum.map((module, index) => (
                                        <div
                                            key={module.id}
                                            className="border border-gray-200 rounded-xl overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleModule(module.id)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-right"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">
                                                            {module.titleAr}
                                                        </h3>
                                                        {module.descriptionAr && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {module.descriptionAr}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-500">
                                                        {module.sessions.length} جلسة
                                                    </span>
                                                    {expandedModules.has(module.id) ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {expandedModules.has(module.id) && (
                                                <div className="border-t border-gray-200 bg-gray-50 p-4">
                                                    <div className="space-y-2">
                                                        {module.sessions.map((session, sessionIndex) => (
                                                            <div
                                                                key={session.id}
                                                                className="flex items-start gap-3 p-3 bg-white rounded-lg"
                                                            >
                                                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                                                                    {sessionIndex + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-gray-900">
                                                                        {session.titleAr}
                                                                    </h4>
                                                                    {session.descriptionAr && (
                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                            {session.descriptionAr}
                                                                        </p>
                                                                    )}
                                                                    {session.durationMinutes && (
                                                                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {session.durationMinutes} دقيقة
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Course Materials */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Download className="w-6 h-6 text-primary" />
                                    المواد التدريبية
                                </h2>

                                {isLoadingMaterials ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">جاري تحميل المواد...</p>
                                    </div>
                                ) : materials.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BookOpen className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600">لا توجد مواد متاحة حالياً</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            سيتم إضافة المواد التدريبية قريباً
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {materials.map((material) => (
                                            <div
                                                key={material.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getMaterialIcon(material.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 mb-1">
                                                            {material.titleAr}
                                                        </h4>
                                                        {material.descriptionAr && (
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {material.descriptionAr}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="px-2 py-0.5 rounded-full bg-gray-100">
                                                                {material.type}
                                                            </span>
                                                            {material.fileSize && (
                                                                <span>{formatFileSize(material.fileSize)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {material.type === 'LINK' && material.externalLink ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={material.externalLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <ExternalLink className="w-4 h-4 ml-1" />
                                                                    فتح
                                                                </a>
                                                            </Button>
                                                        ) : material.fileUrl ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={material.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download
                                                                >
                                                                    <Download className="w-4 h-4 ml-1" />
                                                                    تحميل
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled
                                                            >
                                                                غير متاح
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Instructor */}
                            {courseDetail.cohort.instructor && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-lg p-6"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">المدرب</h3>
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                                            {courseDetail.cohort.instructor.imageUrl ? (
                                                <img
                                                    src={courseDetail.cohort.instructor.imageUrl}
                                                    alt={courseDetail.cohort.instructor.nameAr}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-8 h-8 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                {courseDetail.cohort.instructor.nameAr}
                                            </h4>
                                            {courseDetail.cohort.instructor.titleAr && (
                                                <p className="text-sm text-gray-600">
                                                    {courseDetail.cohort.instructor.titleAr}
                                                </p>
                                            )}
                                            {courseDetail.cohort.instructor.bioAr && (
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                                                    {courseDetail.cohort.instructor.bioAr}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Progress Tracking */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-primary/20"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    تقدمي في البرنامج
                                </h3>
                                <div className="space-y-4">
                                    {/* Attendance Percentage */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">نسبة الحضور</span>
                                            <span className={`text-2xl font-bold ${
                                                (courseDetail.completionPercentage || courseDetail.progress) >= courseDetail.cohort.program.certificateAttendanceThreshold
                                                    ? 'text-green-600'
                                                    : 'text-amber-600'
                                            }`}>
                                                {courseDetail.completionPercentage || courseDetail.progress}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${
                                                    (courseDetail.completionPercentage || courseDetail.progress) >= courseDetail.cohort.program.certificateAttendanceThreshold
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                                        : 'bg-gradient-to-r from-amber-500 to-orange-600'
                                                }`}
                                                style={{
                                                    width: `${courseDetail.completionPercentage || courseDetail.progress}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            المطلوب للشهادة: {courseDetail.cohort.program.certificateAttendanceThreshold}%
                                        </p>
                                    </div>

                                    {/* Sessions Progress */}
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">الجلسات</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {Math.floor((courseDetail.progress / 100) * totalSessions)} / {totalSessions}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">تم الحضور</span>
                                                <span className="font-medium text-green-600">
                                                    {Math.floor((courseDetail.progress / 100) * totalSessions)} جلسة
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">المتبقي</span>
                                                <span className="font-medium text-blue-600">
                                                    {totalSessions - Math.floor((courseDetail.progress / 100) * totalSessions)} جلسة
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificate Eligibility */}
                                    <div className={`border-t pt-4 p-3 rounded-lg ${
                                        courseDetail.certificateEligible
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {courseDetail.certificateEligible ? (
                                                <>
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-green-900">
                                                            مؤهل للشهادة
                                                        </p>
                                                        <p className="text-xs text-green-700">
                                                            أنت تستوفي متطلبات الحصول على الشهادة
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            غير مؤهل بعد
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            حافظ على حضورك للحصول على الشهادة
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائيات</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">عدد الوحدات</span>
                                        <span className="font-bold text-gray-900">
                                            {courseDetail.curriculum.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">عدد الجلسات</span>
                                        <span className="font-bold text-gray-900">
                                            {totalSessions}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">نوع البرنامج</span>
                                        <span className="font-bold text-gray-900">
                                            {courseDetail.cohort.program.type}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Certificate */}
                            {courseDetail.certificate && courseDetail.certificate.status === "ISSUED" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <Award className="w-8 h-8" />
                                        <h3 className="text-lg font-bold">شهادة الإنجاز</h3>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        {/* Certificate Number */}
                                        <div className="bg-white/10 rounded-lg p-3">
                                            <p className="text-xs text-amber-100 mb-1">رقم الشهادة</p>
                                            <p className="font-mono font-medium">
                                                {courseDetail.certificate.number}
                                            </p>
                                        </div>

                                        {/* Verification Code */}
                                        <div className="bg-white/10 rounded-lg p-3">
                                            <p className="text-xs text-amber-100 mb-1">رمز التحقق</p>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-mono font-medium">
                                                    {courseDetail.certificate.verificationCode}
                                                </p>
                                                <button
                                                    onClick={() => copyVerificationCode(courseDetail.certificate!.verificationCode)}
                                                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                                    title="نسخ رمز التحقق"
                                                >
                                                    {copiedCode ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Download Button */}
                                        {courseDetail.certificate.pdfUrl ? (
                                            <Button
                                                variant="outline"
                                                className="w-full border-white/20 text-white hover:bg-white/10"
                                                asChild
                                            >
                                                <a
                                                    href={courseDetail.certificate.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                >
                                                    <Download className="w-4 h-4 ml-2" />
                                                    تحميل الشهادة (PDF)
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-white/20 text-white/50 cursor-not-allowed"
                                                disabled
                                            >
                                                <AlertCircle className="w-4 h-4 ml-2" />
                                                الشهادة قيد المعالجة
                                            </Button>
                                        )}

                                        {/* Verify Button */}
                                        <Button
                                            variant="outline"
                                            className="w-full border-white/20 text-white hover:bg-white/10"
                                            asChild
                                        >
                                            <Link
                                                href={`/verify-certificate/${courseDetail.certificate.verificationCode}`}
                                                target="_blank"
                                            >
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                                التحقق من الشهادة
                                            </Link>
                                        </Button>
                                    </div>

                                    <p className="text-xs text-amber-100 mt-4 text-center">
                                        يمكنك مشاركة رمز التحقق مع أي جهة للتأكد من صحة الشهادة
                                    </p>
                                </motion.div>
                            )}

                            {/* Not Eligible for Certificate */}
                            {courseDetail.status === "COMPLETED" && !courseDetail.certificate && courseDetail.cohort.program.certificateEnabled && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gray-100 rounded-2xl shadow-lg p-6"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertTriangle className="w-8 h-8 text-amber-600" />
                                        <h3 className="text-lg font-bold text-gray-900">الشهادة غير متوفرة</h3>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        لم تستوفِ متطلبات الحصول على الشهادة. نسبة الحضور المطلوبة: {courseDetail.cohort.program.certificateAttendanceThreshold}%
                                    </p>
                                </motion.div>
                            )}

                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <div className="space-y-3">
                                    {(courseDetail.status === "IN_PROGRESS" || courseDetail.status === "ENROLLED") && (
                                        <Button className="w-full gap-2" size="lg">
                                            <PlayCircle className="w-5 h-5" />
                                            متابعة التعلم
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push('/my-courses')}
                                    >
                                        العودة للبرامج
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </ProtectedRoute>
    );
}
