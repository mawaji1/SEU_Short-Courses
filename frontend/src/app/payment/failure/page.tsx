"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

function PaymentFailureContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error') || 'حدث خطأ أثناء معالجة الدفع';

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
                        {/* Error Icon */}
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>

                        {/* Error Message */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            فشلت عملية الدفع
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            {error}
                        </p>

                        {/* Common Reasons */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-right">
                            <h3 className="font-bold text-gray-900 mb-3">الأسباب الشائعة</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-1">•</span>
                                    <span>رصيد غير كافٍ في البطاقة</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-1">•</span>
                                    <span>بيانات البطاقة غير صحيحة</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-1">•</span>
                                    <span>البطاقة غير مفعلة للدفع الإلكتروني</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-1">•</span>
                                    <span>تجاوز حد الإنفاق اليومي</span>
                                </li>
                            </ul>
                        </div>

                        {/* Help Section */}
                        <div className="bg-blue-50 rounded-xl p-6 mb-8 text-right">
                            <h3 className="font-bold text-gray-900 mb-2">هل تحتاج مساعدة؟</h3>
                            <p className="text-sm text-gray-700">
                                تواصل مع فريق الدعم على البريد الإلكتروني:{' '}
                                <a href="mailto:support@seu.edu.sa" className="text-primary hover:underline">
                                    support@seu.edu.sa
                                </a>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="gap-2" onClick={() => window.history.back()}>
                                <RefreshCw className="w-5 h-5" />
                                إعادة المحاولة
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2">
                                <Link href="/dashboard">
                                    لوحة التحكم
                                    <ArrowLeft className="w-5 h-5" />
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

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <PaymentFailureContent />
        </Suspense>
    );
}
