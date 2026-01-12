'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { MoyasarPaymentForm } from './MoyasarPaymentForm';
import { createPayment } from '@/services/payment';
import { createBNPLCheckout, BNPLProvider } from '@/services/payment/bnpl.service';

interface RadioPaymentSelectorProps {
  registrationId: string;
  amount: number;
  currency?: string;
  language?: 'ar' | 'en';
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

type PaymentMethod = 'card' | 'tabby' | 'tamara';

/**
 * Radio Button Payment Selector
 * Matches Tabby's official documentation pattern
 */
export function RadioPaymentSelector({
  registrationId,
  amount,
  currency = 'SAR',
  language = 'ar',
  onSuccess,
  onError,
}: RadioPaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string>('');

  const handlePlaceOrder = async () => {
    if (selectedMethod === 'card') {
      await handleCreateCardPayment();
    } else if (selectedMethod === 'tabby' || selectedMethod === 'tamara') {
      await handleBNPLCheckout(selectedMethod);
    }
  };

  const handleCreateCardPayment = async () => {
    setIsProcessing(true);
    
    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        onError?.('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const paymentData = await createPayment(
        { registrationId, amount, currency },
        auth.accessToken,
      );

      setPaymentId(paymentData.paymentId);
      setPublishableKey(paymentData.publishableKey);
    } catch (err: any) {
      onError?.(err.message || 'فشل إنشاء عملية الدفع');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBNPLCheckout = async (provider: 'tabby' | 'tamara') => {
    setIsProcessing(true);
    
    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        onError?.('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const bnplProvider = provider === 'tabby' ? BNPLProvider.TABBY : BNPLProvider.TAMARA;
      const checkoutData = await createBNPLCheckout(
        registrationId,
        bnplProvider,
        auth.accessToken,
      );

      if (checkoutData.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl;
      } else {
        throw new Error('لم يتم الحصول على رابط الدفع');
      }
    } catch (err: any) {
      onError?.(err.message || 'فشل إنشاء جلسة الدفع');
    } finally {
      setIsProcessing(false);
    }
  };

  // If card payment is created, show Moyasar form
  if (selectedMethod === 'card' && paymentId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setPaymentId(null);
            }}
            className="text-sm"
          >
            ← العودة لاختيار طريقة دفع أخرى
          </Button>
        </div>
        
        <MoyasarPaymentForm
          amount={amount}
          currency={currency}
          publishableKey={publishableKey}
          onSuccess={(moyasarPaymentId) => {
            onSuccess?.(paymentId);
          }}
          onError={(error) => {
            onError?.(error);
            setPaymentId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6">طريقة الدفع</h3>

      <div className="space-y-4 mb-8">
        {/* Card Payment Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment-method"
            value="card"
            checked={selectedMethod === 'card'}
            onChange={() => setSelectedMethod('card')}
            className="mt-1 w-5 h-5 text-primary"
          />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 mb-1">
                {language === 'ar' ? 'بطاقة الائتمان/الخصم المباشر' : 'Debit / Credit card'}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'ادفع باستخدام بطاقات ماستركارد/فيزا/أميكس' : 'Visa, Mastercard, Mada'}
              </div>
            </div>
          </div>
        </label>

        {/* Tabby Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'tabby' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment-method"
            value="tabby"
            checked={selectedMethod === 'tabby'}
            onChange={() => setSelectedMethod('tabby')}
            className="mt-1 w-5 h-5 text-primary"
          />
          <div className="flex items-center gap-3 flex-1">
            <img 
              src="/images/Tabby_Logo.png"
              alt="Tabby" 
              className="h-8 w-auto"
            />
            <div className="flex-1">
              <div className="font-bold text-gray-900 mb-1">
                {language === 'ar' ? 'ادفع لاحقًا عبر تابي' : 'Pay later with Tabby'}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'قسّمها على 4 دفعات بدون فوائد' : 'Split into 4 payments, no interest'}
              </div>
            </div>
          </div>
        </label>

        {/* Tamara Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'tamara' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment-method"
            value="tamara"
            checked={selectedMethod === 'tamara'}
            onChange={() => setSelectedMethod('tamara')}
            className="mt-1 w-5 h-5 text-primary"
          />
          <div className="flex items-center gap-3 flex-1">
            <img 
              src="/images/Tamara_Logo.png"
              alt="Tamara" 
              className="h-8 w-auto"
            />
            <div className="flex-1">
              <div className="font-bold text-gray-900 mb-1">
                {language === 'ar' ? 'ادفع لاحقًا عبر تمارا' : 'Pay Over time with Tamara'}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'قسّمها على 3 أو 4 دفعات بدون فوائد' : 'Split into 3 or 4 payments, no interest'}
              </div>
            </div>
          </div>
        </label>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handlePlaceOrder}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin ml-2" />
            جاري المعالجة...
          </>
        ) : (
          'إتمام الطلب'
        )}
      </Button>

      <p className="text-sm text-gray-500 text-center mt-4">
        جميع طرق الدفع آمنة ومشفرة
      </p>
    </div>
  );
}
