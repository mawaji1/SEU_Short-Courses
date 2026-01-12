"use client";

import { Suspense } from 'react';

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth";

function ResetPasswordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if no token
    useEffect(() => {
        if (!token) {
            router.push("/forgot-password");
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Password validation
        if (password !== confirmPassword) {
            setError("كلمات المرور غير متطابقة");
            return;
        }

        if (password.length < 8) {
            setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
            return;
        }

        // Check for password complexity
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber) {
            setError("كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم");
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword(token!, password);
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || "حدث خطأ. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-8">
                        <Image
                            src="/images/seu-header-logo.svg"
                            alt="SEU"
                            width={100}
                            height={40}
                            className="h-10 w-auto"
                        />
                        <span className="text-lg font-bold text-primary">التدريب الاحترافي</span>
                    </Link>

                    {!isSuccess ? (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">إعادة تعيين كلمة المرور</h1>
                            <p className="text-gray-600 mb-8">
                                أدخل كلمة المرور الجديدة
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        كلمة المرور الجديدة
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        تأكيد كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <Button type="submit" size="lg" className="w-full text-lg gap-2" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            جاري إعادة التعيين...
                                        </>
                                    ) : (
                                        <>
                                            إعادة تعيين كلمة المرور
                                            <ArrowLeft className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                تم إعادة تعيين كلمة المرور
                            </h2>
                            <p className="text-gray-600 mb-8">
                                يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
                            </p>
                            <Button asChild size="lg" className="gap-2">
                                <Link href="/login">
                                    تسجيل الدخول
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </Button>
                        </motion.div>
                    )}

                    {/* Back to Login */}
                    {!isSuccess && (
                        <p className="text-center text-gray-600 mt-8">
                            <Link href="/login" className="text-accent font-bold hover:underline inline-flex items-center gap-2">
                                <ArrowRight className="w-4 h-4" />
                                العودة لتسجيل الدخول
                            </Link>
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary items-center justify-center p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-white max-w-md"
                >
                    <div className="text-7xl mb-8">🔑</div>
                    <h2 className="text-3xl font-bold mb-4">كلمة مرور جديدة</h2>
                    <p className="text-xl text-gray-200">
                        اختر كلمة مرور قوية للحفاظ على أمان حسابك
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <ResetPasswordPageContent />
        </Suspense>
    );
}
