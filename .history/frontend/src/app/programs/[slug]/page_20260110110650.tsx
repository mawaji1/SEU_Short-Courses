"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Clock, Users, Calendar, Award, ArrowLeft, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { catalogService } from "@/services/catalog";
import { getProgramCohorts, CohortResponse } from "@/services/registration/registration.service";
import { checkExistingProgramRegistration, ExistingRegistrationCheck } from "@/services/registration/check-existing.service";
import { Program } from "@/services/catalog/types";
import { useAuth } from "@/contexts/AuthContext";

export default function ProgramDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const slug = params.slug as string;

    const [program, setProgram] = useState<Program | null>(null);
    const [cohorts, setCohorts] = useState<CohortResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [existingRegistration, setExistingRegistration] = useState<ExistingRegistrationCheck | null>(null);

    useEffect(() => {
        loadProgramData();
    }, [slug]);

    const loadProgramData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const programData = await catalogService.getProgramBySlug(slug);
            setProgram(programData);

            if (programData.id) {
                const cohortsData = await getProgramCohorts(programData.id);
                setCohorts(cohortsData.filter(c => c.status === 'OPEN' || c.status === 'UPCOMING'));
            }
        } catch (err: any) {
            console.error('Error loading program:', err);
            setError(err.message || 'فشل تحميل البرنامج');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/programs/${slug}`);
            return;
        }
        router.push(`/checkout?program=${slug}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0,
        }).format(numPrice);
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">جاري تحميل البرنامج...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !program) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
                        <p className="text-gray-600 mb-6">{error || 'البرنامج غير موجود'}</p>
                        <Button asChild>
                            <Link href="/programs">العودة للبرامج</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
                            <Link href="/" className="hover:text-accent">الرئيسية</Link>
                            <span>/</span>
                            <Link href="/programs" className="hover:text-accent">البرامج</Link>
                            <span>/</span>
                            <span className="text-accent">{program.category?.nameAr || 'برنامج'}</span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <span className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium mb-4">
                                {program.category?.nameAr || 'برنامج'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">{program.titleAr}</h1>
                            <p className="text-xl text-gray-200 max-w-3xl mb-8">{program.shortDescriptionAr || program.descriptionAr}</p>

                            <div className="flex flex-wrap items-center gap-6 text-gray-200">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    {program.durationHours} ساعة
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {cohorts.reduce((sum, c) => sum + c.enrolledCount, 0)} متدرب
                                </div>
                                {program.isFeatured && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-400">⭐</span>
                                        مميز
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] py-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content */}
                        <div className="flex-1 space-y-8">
                            {/* Program Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">عن البرنامج</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {program.descriptionAr}
                                </p>
                            </motion.div>

                            {/* Available Cohorts */}
                            {cohorts.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">المواعيد المتاحة</h2>
                                    <div className="space-y-4">
                                        {cohorts.map((cohort) => (
                                            <div key={cohort.id} className="p-4 border border-gray-200 rounded-xl hover:border-accent transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-bold text-gray-900">{cohort.nameAr}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        cohort.availableSeats > 0 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {cohort.availableSeats > 0 
                                                            ? `${cohort.availableSeats} مقعد متاح` 
                                                            : 'مكتمل'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        يبدأ: {formatDate(cohort.startDate)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        ينتهي: {formatDate(cohort.endDate)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {cohort.enrolledCount}/{cohort.capacity}
                                                    </span>
                                                </div>
                                                <Button 
                                                    onClick={handleRegister}
                                                    disabled={cohort.availableSeats === 0}
                                                    className="w-full"
                                                >
                                                    {cohort.availableSeats > 0 ? 'سجل الآن' : 'انضم لقائمة الانتظار'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Instructor */}
                            {program.instructor && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">المدرب</h2>
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                                            {program.instructor.nameAr?.charAt(0) || 'م'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{program.instructor.nameAr}</h3>
                                            <p className="text-accent font-medium mb-2">{program.instructor.titleAr}</p>
                                            {program.instructor.bioAr && (
                                                <p className="text-gray-600">{program.instructor.bioAr}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar - Registration Card */}
                        <div className="lg:w-96">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                            >
                                <div className="text-center mb-6">
                                    <div className="text-4xl font-bold text-primary mb-2">
                                        {formatPrice(program.price)}
                                    </div>
                                    <p className="text-gray-500">شامل ضريبة القيمة المضافة</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">المدة</span>
                                        <span className="font-bold text-gray-900">{program.durationHours} ساعة</span>
                                    </div>
                                    {cohorts.length > 0 && (
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-600">المواعيد المتاحة</span>
                                            <span className="font-bold text-gray-900">{cohorts.length}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">اللغة</span>
                                        <span className="font-bold text-gray-900">العربية</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-gray-600">الشهادة</span>
                                        <span className="font-bold text-accent">معتمدة</span>
                                    </div>
                                </div>

                                <Button 
                                    size="lg" 
                                    className="w-full text-lg gap-2 mb-3"
                                    onClick={handleRegister}
                                >
                                    سجل الآن
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>

                                <Button size="lg" variant="outline" className="w-full">
                                    تحدث مع مستشار
                                </Button>

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    متاح التقسيط عبر تابي وتمارا
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
