"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { authService } from "@/services/auth";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await authService.forgotPassword(email);
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || "حدث خطأ. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

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
                        <span className="text-lg font-bold text-primary">التعليم التنفيذي</span>
                    </Link>

                    {!isSuccess ? (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
                            <p className="text-gray-600 mb-8">
                                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        البريد الإلكتروني
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@email.com"
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
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            إرسال رابط إعادة التعيين
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
                                تحقق من بريدك الإلكتروني
                            </h2>
                            <p className="text-gray-600 mb-6">
                                إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة بإرشادات إعادة تعيين كلمة المرور
                            </p>
                            <p className="text-sm text-gray-500 mb-8">
                                لم تستلم الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsSuccess(false);
                                    setEmail("");
                                }}
                                className="gap-2"
                            >
                                <ArrowRight className="w-4 h-4" />
                                إرسال رابط جديد
                            </Button>
                        </motion.div>
                    )}

                    {/* Back to Login */}
                    <p className="text-center text-gray-600 mt-8">
                        <Link href="/login" className="text-accent font-bold hover:underline inline-flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            العودة لتسجيل الدخول
                        </Link>
                    </p>
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
                    <div className="text-7xl mb-8">🔐</div>
                    <h2 className="text-3xl font-bold mb-4">حماية حسابك</h2>
                    <p className="text-xl text-gray-200">
                        نحرص على أمان حسابك. ستتمكن من إعادة تعيين كلمة المرور بسهولة
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
