"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { RadioPaymentSelector, TabbyCheckoutWidget, TamaraWidget } from '@/components/payment';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Registration {
    id: string;
    status: string;
    cohort: {
        nameAr: string;
        program: {
            titleAr: string;
            price: number;
        };
    };
}

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const registrationId = params.registrationId as string;

    const [registration, setRegistration] = useState<Registration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRegistration() {
            try {
                const authData = localStorage.getItem('seu_auth');
                if (!authData) {
                    router.push('/login');
                    return;
                }

                const auth = JSON.parse(authData);
                const token = auth.accessToken;

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/registrations/${registrationId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setRegistration(data);
                } else {
                    setError('فشل تحميل بيانات التسجيل');
                }
            } catch (err: any) {
                console.error('Error loading registration:', err);
                setError(err.message || 'حدث خطأ في تحميل البيانات');
            } finally {
                setIsLoading(false);
            }
        }

        if (registrationId) {
            fetchRegistration();
        }
    }, [registrationId, router]);

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">جاري تحميل بيانات الدفع...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error && !registration) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">❌</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">حدث خطأ</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={() => router.push('/dashboard')}>
                            العودة للوحة التحكم
                        </Button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!registration) {
        return null;
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm p-8"
                    >
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                تم حجز مقعدك بنجاح!
                            </h2>
                            <p className="text-gray-600">
                                يرجى إكمال الدفع لتأكيد التسجيل
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                            <div className="text-3xl font-bold text-primary mb-2 text-center">
                                {new Intl.NumberFormat('ar-SA', {
                                    style: 'currency',
                                    currency: 'SAR',
                                    minimumFractionDigits: 0,
                                }).format(registration.cohort.program.price)}
                            </div>
                            <p className="text-gray-900 font-medium mb-1 text-center">{registration.cohort.program.titleAr}</p>
                            <p className="text-sm text-gray-500 text-center">{registration.cohort.nameAr}</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-700 text-center">{error}</p>
                            </div>
                        )}

                        {/* Radio Button Payment Selector */}
                        <RadioPaymentSelector
                            registrationId={registrationId}
                            amount={registration.cohort.program.price}
                            currency="SAR"
                            language="ar"
                            onSuccess={(paymentId) => {
                                router.push(`/payment/success?id=${paymentId}`);
                            }}
                            onError={(error) => {
                                setError(error);
                            }}
                        />
                    </motion.div>
                </div>
            </main>
            <Footer />
        </>
    );
}
