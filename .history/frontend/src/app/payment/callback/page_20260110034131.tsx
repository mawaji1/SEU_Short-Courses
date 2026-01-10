"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { Loader2 } from 'lucide-react';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('id');
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    useEffect(() => {
        // Redirect based on payment status
        if (status === 'paid') {
            window.location.href = `/payment/success?id=${paymentId}`;
        } else {
            window.location.href = `/payment/failure?error=${message || 'فشلت عملية الدفع'}`;
        }
    }, [status, paymentId, message]);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">جاري معالجة الدفع...</p>
                </div>
            </main>
            <Footer />
        </>
    );
}
