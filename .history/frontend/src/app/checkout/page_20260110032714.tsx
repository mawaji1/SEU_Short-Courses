'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    Users,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Loader2,
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import {
    getProgramCohorts,
    validatePromoCode,
    initiateRegistration,
    CohortResponse,
    PromoCodeValidation,
} from '@/services/registration';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Program {
    id: string;
    titleAr: string;
    titleEn: string;
    slug: string;
    price: number;
    durationHours: number;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const programSlug = searchParams.get('program');

    // State
    const [program, setProgram] = useState<Program | null>(null);
    const [cohorts, setCohorts] = useState<CohortResponse[]>([]);
    const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState<PromoCodeValidation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Fetch program and cohorts on mount
    useEffect(() => {
        async function fetchData() {
            if (!programSlug) {
                setError('لم يتم تحديد البرنامج');
                setIsLoading(false);
                return;
            }

            try {
                // Fetch program by slug
                const programRes = await fetch(`${API_BASE}/api/catalog/programs/slug/${programSlug}`);
                if (!programRes.ok) {
                    throw new Error('Program not found');
                }
                const programData = await programRes.json();
                setProgram({
                    id: programData.id,
                    titleAr: programData.titleAr,
                    titleEn: programData.titleEn,
                    slug: programData.slug,
                    price: Number(programData.price),
                    durationHours: programData.durationHours,
                });

                // Fetch cohorts for this program
                const cohortsData = await getProgramCohorts(programData.id);
                setCohorts(cohortsData);

            } catch (err) {
                console.error('Error loading checkout data:', err);
                setError('حدث خطأ في تحميل البيانات');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [programSlug]);

    const selectedCohortData = cohorts.find(c => c.id === selectedCohort);
    const originalPrice = program?.price || 0;
    const finalPrice = promoResult?.isValid ? promoResult.finalPrice : originalPrice;

    const handleValidatePromo = async () => {
        if (!promoCode.trim() || !program) return;

        setIsValidatingPromo(true);
        try {
            const result = await validatePromoCode(promoCode, originalPrice, program.id);
            setPromoResult(result);
        } catch (err) {
            setPromoResult({
                isValid: false,
                discountAmount: 0,
                finalPrice: originalPrice,
                error: 'حدث خطأ في التحقق من كود الخصم',
            });
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCohort) {
            setError('الرجاء اختيار موعد البرنامج');
            return;
        }

        // Validate cohortId format
        console.log('Selected cohort ID:', selectedCohort);
        if (!selectedCohort || selectedCohort === 'null' || selectedCohort === 'undefined') {
            setError('معرف الموعد غير صالح');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        
        try {
            // Get auth token from localStorage
            const authData = localStorage.getItem('seu_auth');
            if (!authData) {
                window.location.href = `/login?redirect=/checkout?program=${programSlug}`;
                return;
            }

            const auth = JSON.parse(authData);
            const token = auth.accessToken;
            
            if (!token) {
                window.location.href = `/login?redirect=/checkout?program=${programSlug}`;
                return;
            }

            console.log('Initiating registration for cohort:', selectedCohort);
            console.log('Using token:', token.substring(0, 20) + '...');
            const registration = await initiateRegistration(selectedCohort, token);
            console.log('Registration initiated:', registration);
            setStep(2);
        } catch (err: any) {
            console.error('Registration error:', err);
            // If unauthorized, redirect to login
            if (err.message === 'Unauthorized' || err.message?.includes('Unauthorized')) {
                localStorage.removeItem('seu_auth');
                window.location.href = `/login?redirect=/checkout?program=${programSlug}`;
                return;
            }
            setError(err.message || 'حدث خطأ في التسجيل');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        );
    }

    // Error state
    if (error || !program) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {error || 'البرنامج غير موجود'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        يرجى التأكد من صحة الرابط والمحاولة مرة أخرى
                    </p>
                    <Link href="/programs">
                        <Button>تصفح البرامج</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-bl from-primary via-primary-dark to-primary pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            التسجيل في البرنامج
                        </h1>
                        <p className="text-white/80">
                            {program.titleAr}
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                    {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                                </div>
                                <span className="font-medium">اختيار الموعد</span>
                            </div>
                            <div className="w-16 h-0.5 bg-gray-200" />
                            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                    {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
                                </div>
                                <span className="font-medium">الدفع</span>
                            </div>
                            <div className="w-16 h-0.5 bg-gray-200" />
                            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                    3
                                </div>
                                <span className="font-medium">التأكيد</span>
                            </div>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Left: Cohort Selection */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                                        اختر موعد البرنامج
                                    </h2>

                                    {cohorts.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>لا توجد مواعيد متاحة حالياً</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {cohorts.map((cohort) => (
                                                <motion.div
                                                    key={cohort.id}
                                                    whileHover={{ scale: cohort.status !== 'FULL' ? 1.01 : 1 }}
                                                    onClick={() => cohort.status !== 'FULL' && setSelectedCohort(cohort.id)}
                                                    className={`
                                                        p-4 rounded-xl border-2 cursor-pointer transition-all
                                                        ${selectedCohort === cohort.id
                                                            ? 'border-primary bg-primary/5'
                                                            : cohort.status === 'FULL'
                                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                                                : 'border-gray-200 hover:border-primary/50'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {cohort.nameAr}
                                                            </h3>
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {formatDate(cohort.startDate)}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {program.durationHours} ساعة
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-left">
                                                            {cohort.status === 'FULL' ? (
                                                                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                                                                    مكتمل
                                                                </span>
                                                            ) : (
                                                                <div>
                                                                    <span className="flex items-center gap-1 text-sm text-gray-600">
                                                                        <Users className="w-4 h-4" />
                                                                        {cohort.availableSeats} مقعد متاح
                                                                    </span>
                                                                    {selectedCohort === cohort.id && (
                                                                        <CheckCircle className="w-5 h-5 text-primary mt-2 mr-auto" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Promo Code */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        كود الخصم
                                    </h2>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="أدخل كود الخصم"
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                        <Button
                                            onClick={handleValidatePromo}
                                            disabled={!promoCode.trim() || isValidatingPromo}
                                            variant="outline"
                                        >
                                            {isValidatingPromo ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'تطبيق'
                                            )}
                                        </Button>
                                    </div>
                                    {promoResult && (
                                        <div className={`mt-3 p-3 rounded-lg ${promoResult.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {promoResult.isValid ? (
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    تم تطبيق الخصم: {promoResult.discountAmount.toLocaleString()} ر.س
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {promoResult.error}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Order Summary */}
                            <div className="md:col-span-1">
                                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        ملخص الطلب
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-2xl">
                                                📚
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {program.titleAr}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {program.durationHours} ساعة تدريبية
                                                </p>
                                            </div>
                                        </div>

                                        {selectedCohortData && (
                                            <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                                <p className="text-gray-600">الموعد المختار:</p>
                                                <p className="font-medium text-gray-900">
                                                    {selectedCohortData.nameAr}
                                                </p>
                                            </div>
                                        )}

                                        <div className="border-t pt-4 space-y-2">
                                            <div className="flex justify-between text-gray-600">
                                                <span>سعر البرنامج</span>
                                                <span>{originalPrice.toLocaleString()} ر.س</span>
                                            </div>
                                            {promoResult?.isValid && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>الخصم</span>
                                                    <span>- {promoResult.discountAmount.toLocaleString()} ر.س</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                                                <span>المجموع</span>
                                                <span>{finalPrice.toLocaleString()} ر.س</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!selectedCohort || isSubmitting}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    متابعة للدفع
                                                    <ArrowRight className="w-5 h-5 mr-2" />
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-xs text-center text-gray-500">
                                            بالمتابعة، أنت توافق على <Link href="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                تم حجز مقعدك بنجاح!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                يرجى إكمال الدفع خلال 15 دقيقة للتأكيد
                            </p>

                            <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-md mx-auto">
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {finalPrice.toLocaleString()} ر.س
                                </div>
                                <p className="text-gray-600">{program.titleAr}</p>
                                <p className="text-sm text-gray-500">{selectedCohortData?.nameAr}</p>
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button size="lg">
                                    الدفع الآن
                                </Button>
                                <Button variant="outline" size="lg">
                                    الدفع لاحقاً
                                </Button>
                            </div>

                            <p className="text-sm text-gray-500 mt-4">
                                متاح: الدفع بالبطاقة أو تقسيط عبر Tabby و Tamara
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
