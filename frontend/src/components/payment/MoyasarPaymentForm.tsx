"use client";

import { useEffect, useState } from 'react';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoyasarPaymentFormProps {
    amount: number;
    currency: string;
    publishableKey: string;
    onSuccess: (paymentId: string) => void;
    onError: (error: string) => void;
}

export function MoyasarPaymentForm({
    amount,
    currency,
    publishableKey,
    onSuccess,
    onError,
}: MoyasarPaymentFormProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Load Moyasar.js script
        const script = document.createElement('script');
        script.src = 'https://cdn.moyasar.com/mpf/1.12.0/moyasar.js';
        script.async = true;
        script.onload = () => {
            setIsLoading(false);
            initializeMoyasar();
        };
        document.body.appendChild(script);

        // Load Moyasar CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.moyasar.com/mpf/1.12.0/moyasar.css';
        document.head.appendChild(link);

        return () => {
            document.body.removeChild(script);
            document.head.removeChild(link);
        };
    }, []);

    const initializeMoyasar = () => {
        if (typeof window === 'undefined' || !(window as any).Moyasar) return;

        (window as any).Moyasar.init({
            element: '.moyasar-form',
            amount: Math.round(amount * 100), // Convert to halalas
            currency,
            description: 'دفع رسوم التسجيل',
            publishable_api_key: publishableKey,
            callback_url: `${window.location.origin}/payment/callback`,
            methods: ['creditcard'],
            on_completed: function (payment: any) {
                setIsProcessing(true);
                onSuccess(payment.id);
            },
            on_failure: function (error: any) {
                onError(error.message || 'فشلت عملية الدفع');
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">المبلغ الإجمالي</span>
                    <span className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                            minimumFractionDigits: 0,
                        }).format(amount)}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>الدفع آمن ومشفر بواسطة Moyasar</span>
                </div>
            </div>

            {/* Moyasar Form Container */}
            <div className="moyasar-form"></div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CreditCard className="w-5 h-5" />
                    <span>Visa, Mastercard, Mada</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="w-5 h-5" />
                    <span>PCI DSS Compliant</span>
                </div>
            </div>

            {isProcessing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">جاري معالجة الدفع...</p>
                        <p className="text-sm text-gray-500 mt-2">الرجاء عدم إغلاق هذه الصفحة</p>
                    </div>
                </div>
            )}
        </div>
    );
}
