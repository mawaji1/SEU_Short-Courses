'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { MoyasarPaymentForm } from './MoyasarPaymentForm';
import BNPLOptions from './BNPLOptions';
import { createPayment } from '@/services/payment';

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
 * Shows all available payment methods: Card (Moyasar) + BNPL (Tabby/Tamara)
 * Used in both checkout page and standalone payment page for consistency
 */
export default function PaymentOptions({
  registrationId,
  amount,
  currency = 'SAR',
  description,
  onSuccess,
  onError,
}: PaymentOptionsProps) {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string>('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const handleCreateCardPayment = async () => {
    setIsCreatingPayment(true);
    onError('');

    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        onError('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const token = auth.accessToken;

      const paymentData = await createPayment(
        {
          registrationId,
          amount,
          currency,
        },
        token,
      );

      setPaymentId(paymentData.paymentId);
      setPublishableKey(paymentData.publishableKey);
    } catch (err: any) {
      console.error('Payment creation error:', err);
      onError(err.message || 'فشل إنشاء عملية الدفع');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Card Payment Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">الدفع ببطاقة الائتمان</h3>
        {!paymentId ? (
          <Button
            size="lg"
            className="w-full"
            onClick={handleCreateCardPayment}
            disabled={isCreatingPayment}
          >
            {isCreatingPayment ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري التحضير...
              </>
            ) : (
              'الدفع ببطاقة الائتمان'
            )}
          </Button>
        ) : (
          <MoyasarPaymentForm
            amount={amount}
            currency={currency}
            publishableKey={publishableKey}
            onSuccess={(moyasarPaymentId) => {
              onSuccess(paymentId);
            }}
            onError={(error) => {
              onError(error);
              setPaymentId(null);
            }}
          />
        )}
      </div>

      {/* BNPL Payment Options */}
      {!paymentId && (
        <BNPLOptions
          registrationId={registrationId}
          amount={amount}
          onCheckoutStart={() => setIsCreatingPayment(true)}
        />
      )}

      {/* Info Text */}
      <p className="text-sm text-gray-500 text-center">
        متاح: الدفع بالبطاقة أو تقسيط عبر Tabby و Tamara
      </p>
    </div>
  );
}
