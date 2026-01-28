'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertCircle } from 'lucide-react';
import BNPLOptions from './BNPLOptions';

interface PaymentOptionsProps {
  registrationId: string;
  amount: number;
  currency?: string;
  description: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

/**
 * Unified Payment Options Component
 * Shows all available payment methods: Card + BNPL (Tabby/Tamara)
 * Used in both checkout page and standalone payment page for consistency
 *
 * MIGRATION NOTE: Card payments (Moyasar) removed - HyperPay implementation pending (D-I01)
 * Card option is shown as disabled until HyperPay is integrated
 */
export default function PaymentOptions({
  registrationId,
  amount,
  currency = 'SAR',
  description,
  onSuccess,
  onError,
}: PaymentOptionsProps) {
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Card Payment Section - Temporarily Unavailable */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">الدفع ببطاقة الائتمان</h3>
        <div className="p-4 border-2 border-gray-200 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <CreditCard className="w-6 h-6" />
            <div className="text-center">
              <p className="font-medium">غير متاح حالياً</p>
              <p className="text-sm text-gray-400">
                سيتوفر قريباً - يرجى استخدام تابي أو تمارا
              </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              قريباً
            </span>
          </div>
        </div>
      </div>

      {/* BNPL Payment Options */}
      <BNPLOptions
        registrationId={registrationId}
        amount={amount}
        onCheckoutStart={() => setIsCreatingPayment(true)}
      />

      {/* Info Text */}
      <p className="text-sm text-gray-500 text-center">
        متاح حالياً: تقسيط عبر Tabby و Tamara
      </p>
    </div>
  );
}
