"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Download, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPayment, PaymentResponse } from '@/services/payment';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const paymentId = searchParams.get('id');

    const [isLoading, setIsLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPaymentData();
    }, [paymentId, user]);

    const loadPaymentData = async () => {
        if (!paymentId) {
            setError('معرف الدفع غير موجود');
            setIsLoading(false);
            return;
        }

        if (!user) {
            // Wait for auth to load
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const data = await getPayment(paymentId, token);
            setPaymentData(data);
        } catch (err: any) {
            console.error('Error loading payment:', err);
            setError(err.message || 'فشل تحميل بيانات الدفع');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">جاري التحقق من الدفع...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !paymentData) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
                        <p className="text-gray-600 mb-6">{error || 'لم يتم العثور على بيانات الدفع'}</p>
                        <Button asChild>
                            <Link href="/dashboard">العودة للوحة التحكم</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-8 text-center"
                    >
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            تم الدفع بنجاح! 🎉
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            تم تأكيد تسجيلك في البرنامج التدريبي
                        </p>

                        {/* Payment Details */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-right">
                            <h2 className="font-bold text-gray-900 mb-4">تفاصيل التسجيل</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">البرنامج</span>
                                    <span className="font-medium text-gray-900">
                                        {paymentData.registration.cohort.program.titleAr}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">الموعد</span>
                                    <span className="font-medium text-gray-900">
                                        {paymentData.registration.cohort.nameAr}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">تاريخ البدء</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(paymentData.registration.cohort.startDate).toLocaleDateString('ar-SA', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 border-t">
                                    <span className="text-gray-600">المبلغ المدفوع</span>
                                    <span className="font-bold text-primary">
                                        {new Intl.NumberFormat('ar-SA', {
                                            style: 'currency',
                                            currency: paymentData.currency,
                                            minimumFractionDigits: 0,
                                        }).format(paymentData.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">رقم العملية</span>
                                    <span className="font-mono text-gray-700">{paymentData.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-50 rounded-xl p-6 mb-8 text-right">
                            <h3 className="font-bold text-gray-900 mb-3">الخطوات القادمة</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">✓</span>
                                    <span>ستصلك رسالة تأكيد على بريدك الإلكتروني</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">✓</span>
                                    <span>سيتم إنشاء حسابك على منصة Blackboard تلقائياً</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">✓</span>
                                    <span>يمكنك الوصول للمحتوى التدريبي من لوحة التحكم</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="gap-2">
                                <Link href="/dashboard">
                                    لوحة التحكم
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2">
                                <Link href="/programs">
                                    تصفح المزيد من البرامج
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </>
    );
}
