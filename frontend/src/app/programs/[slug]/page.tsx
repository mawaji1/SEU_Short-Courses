"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Clock, Users, Calendar, Award, ArrowLeft, ChevronDown, ChevronUp, Loader2, AlertCircle, Bell } from "lucide-react";
import { NotifyMeModal } from "@/components/program/NotifyMeModal";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { catalogService } from "@/services/catalog";
import { getProgramCohorts, CohortResponse } from "@/services/registration/registration.service";
import { checkExistingProgramRegistration, ExistingRegistrationCheck } from "@/services/registration/check-existing.service";
import { Program } from "@/services/catalog/types";
import { useAuth } from "@/contexts/AuthContext";
import { TabbyPromoWidget, TamaraWidget } from "@/components/payment";

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
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    const handleNotifyMe = () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/programs/${slug}`);
            return;
        }
        setShowNotifyModal(true);
    };

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

                // Check if user already has a registration for this program
                if (isAuthenticated) {
                    const authData = localStorage.getItem('seu_auth');
                    if (authData) {
                        const auth = JSON.parse(authData);
                        const existingCheck = await checkExistingProgramRegistration(programData.id, auth.accessToken);
                        setExistingRegistration(existingCheck);
                    }
                }
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

        // Check if user already has a registration
        if (existingRegistration?.hasRegistration) {
            const cohortName = existingRegistration.registration?.cohort.nameAr;
            const status = existingRegistration.registration?.status;
            
            if (status === 'CONFIRMED') {
                alert(`أنت مسجل بالفعل في هذا البرنامج (${cohortName})`);
            } else if (status === 'PENDING_PAYMENT') {
                // Redirect to payment page for existing registration
                router.push(`/payment/${existingRegistration.registration?.id}`);
            }
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
                                {program.durationHours && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        {program.durationHours} ساعة
                                    </div>
                                )}
                                {program.isFeatured && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-400">⭐</span>
                                        مميز
                                    </div>
                                )}
                                {/* Availability Badge */}
                                {program.availabilityStatus && (
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${
                                        program.availabilityStatus === 'AVAILABLE' ? 'bg-white text-green-600' :
                                        program.availabilityStatus === 'UPCOMING' ? 'bg-white text-blue-600' :
                                        program.availabilityStatus === 'COMING_SOON' ? 'bg-white text-purple-600' :
                                        'bg-white text-orange-600'
                                    }`}>
                                        {program.availabilityStatus === 'AVAILABLE' ? 'متاح للتسجيل' :
                                         program.availabilityStatus === 'UPCOMING' ? 'يبدأ قريباً' :
                                         program.availabilityStatus === 'COMING_SOON' ? 'قريباً' : 'مكتمل'}
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

                            {/* Curriculum */}
                            {program.modules && program.modules.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">محتوى البرنامج</h2>
                                    <div className="space-y-4">
                                        {program.modules.map((module: any, idx: number) => (
                                            <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900">
                                                            الوحدة {idx + 1}: {module.titleAr}
                                                        </h3>
                                                        {module.descriptionAr && (
                                                            <p className="text-sm text-gray-600 mt-2">{module.descriptionAr}</p>
                                                        )}
                                                    </div>
                                                    {module.durationHours && (
                                                    <span className="text-sm font-medium text-accent mr-4">
                                                        {module.durationHours} ساعة
                                                    </span>
                                                    )}
                                                </div>
                                                
                                                {module.sessions && module.sessions.length > 0 && (
                                                    <div className="px-6 py-4">
                                                        <ul className="space-y-3">
                                                            {module.sessions.map((session: any, sessionIdx: number) => (
                                                                <li key={session.id} className="flex items-start gap-3">
                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center justify-center mt-0.5">
                                                                        {sessionIdx + 1}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900">{session.titleAr}</p>
                                                                        {session.descriptionAr && (
                                                                            <p className="text-sm text-gray-500 mt-1">{session.descriptionAr}</p>
                                                                        )}
                                                                    </div>
                                                                    {session.durationMinutes && (
                                                                    <span className="text-sm text-gray-500 flex-shrink-0">
                                                                        {session.durationMinutes} دقيقة
                                                                    </span>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Notify Me Section - No Cohorts */}
                            {cohorts.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gradient-to-br from-[#32B7A8]/10 to-[#0083BE]/10 rounded-2xl p-6 border-2 border-[#32B7A8]/30"
                                >
                                    <div className="text-center">
                                        <Bell className="w-12 h-12 text-[#32B7A8] mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد دورات متاحة حالياً</h2>
                                        <p className="text-gray-600 mb-6">
                                            سجل اهتمامك وسنعلمك فور توفر دورة جديدة
                                        </p>
                                        <Button 
                                            size="lg"
                                            className="gap-2 bg-gradient-to-r from-[#32B7A8] to-[#0083BE] hover:opacity-90"
                                            onClick={handleNotifyMe}
                                        >
                                            <Bell className="w-5 h-5" />
                                            أعلمني عند التوفر
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Available Cohorts */}
                            {cohorts.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">مواعيد البرنامج</h2>
                                    <div className="space-y-4">
                                        {cohorts.map((cohort) => (
                                            <div key={cohort.id} className="p-4 border border-gray-200 rounded-xl hover:border-accent transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-bold text-gray-900">{cohort.nameAr}</h3>
                                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                                        متاح للتسجيل
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
                                                </div>
                                                <Button 
                                                    onClick={handleRegister}
                                                    className="w-full"
                                                >
                                                    سجل الآن
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

                                {/* BNPL Widgets */}
                                <div className="space-y-3 mb-6">
                                    <TabbyPromoWidget 
                                        price={parseFloat(program.price.toString())} 
                                        currency="SAR" 
                                        language="ar" 
                                        source="product" 
                                    />
                                    
                                    <TamaraWidget 
                                        price={parseFloat(program.price.toString())} 
                                        currency="SAR" 
                                        language="ar" 
                                        widgetType="product-widget" 
                                    />
                                </div>

                                <div className="space-y-3 mb-6">
                                    {program.durationHours && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">المدة</span>
                                        <span className="font-bold text-gray-900">{program.durationHours} ساعة</span>
                                    </div>
                                    )}
                                    {cohorts.length > 0 && (
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-600">عدد المواعيد</span>
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

                                {cohorts.length > 0 ? (
                                    <Button 
                                        size="lg" 
                                        className="w-full text-lg gap-2 mb-3"
                                        onClick={handleRegister}
                                    >
                                        سجل الآن
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                ) : (
                                    <Button 
                                        size="lg" 
                                        className="w-full text-lg gap-2 mb-3 bg-gradient-to-r from-[#32B7A8] to-[#0083BE] hover:opacity-90"
                                        onClick={handleNotifyMe}
                                    >
                                        <Bell className="w-5 h-5" />
                                        أعلمني عند التوفر
                                    </Button>
                                )}

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    متاح التقسيط عبر تابي وتمارا
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Notify Me Modal */}
            {showNotifyModal && program && (
                <NotifyMeModal
                    programId={program.id}
                    programTitle={program.titleAr}
                    onClose={() => setShowNotifyModal(false)}
                />
            )}
        </div>
    );
}
