"use client";

import { Suspense } from 'react';

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function VerifyEmailPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isVerifying, setIsVerifying] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            verifyEmail();
        } else {
            setIsVerifying(false);
            setError("رابط التحقق غير صالح");
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            // TODO: Call API to verify email
            // await authService.verifyEmail(token!);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsSuccess(true);
            setIsVerifying(false);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message || "فشل التحقق من البريد الإلكتروني");
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-3 mb-8">
                    <Image
                        src="/images/seu-header-logo.svg"
                        alt="SEU"
                        width={100}
                        height={40}
                        className="h-10 w-auto"
                    />
                    <span className="text-lg font-bold text-primary">التعليم التنفيذي</span>
                </Link>

                <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                    {isVerifying ? (
                        /* Verifying State */
                        <>
                            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                جاري التحقق من بريدك الإلكتروني
                            </h2>
                            <p className="text-gray-600">
                                يرجى الانتظار...
                            </p>
                        </>
                    ) : isSuccess ? (
                        /* Success State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                تم التحقق بنجاح!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                تم تفعيل حسابك بنجاح. سيتم توجيهك لتسجيل الدخول...
                            </p>
                            <Button asChild size="lg">
                                <Link href="/login">
                                    تسجيل الدخول الآن
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        /* Error State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                فشل التحقق
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {error || "حدث خطأ أثناء التحقق من بريدك الإلكتروني"}
                            </p>
                            <div className="space-y-3">
                                <Button asChild size="lg" className="w-full">
                                    <Link href="/register">
                                        إنشاء حساب جديد
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full">
                                    <Link href="/login">
                                        تسجيل الدخول
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Help Text */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    لم تستلم رسالة التحقق؟{" "}
                    <Link href="/register" className="text-accent hover:underline">
                        إعادة الإرسال
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <VerifyEmailPageContent />
        </Suspense>
    );
}
