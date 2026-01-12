'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Check } from 'lucide-react';
import { MoyasarPaymentForm } from './MoyasarPaymentForm';
import { createPayment } from '@/services/payment';
import { createBNPLCheckout, BNPLProvider } from '@/services/payment/bnpl.service';

interface UnifiedPaymentSelectorProps {
  registrationId: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

type PaymentMethod = 'card' | 'tabby' | 'tamara' | null;

/**
 * Unified Payment Method Selector
 * Allows user to choose between Card, Tabby, or Tamara
 * Then shows the appropriate payment interface
 */
export function UnifiedPaymentSelector({
  registrationId,
  amount,
  currency = 'SAR',
  onSuccess,
  onError,
}: UnifiedPaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string>('');

  const handleMethodSelect = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    
    if (method === 'card') {
      // Create Moyasar payment
      await handleCreateCardPayment();
    } else if (method === 'tabby' || method === 'tamara') {
      // Redirect to BNPL checkout
      await handleBNPLCheckout(method);
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
      setSelectedMethod(null);
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
      setSelectedMethod(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // If card payment is created, show Moyasar form
  if (selectedMethod === 'card' && paymentId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedMethod(null);
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
            setSelectedMethod(null);
          }}
        />
      </div>
    );
  }

  // Show payment method selection
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
        اختر طريقة الدفع
      </h3>

      <div className="grid gap-4">
        {/* Card Payment Option */}
        <button
          onClick={() => handleMethodSelect('card')}
          disabled={isProcessing}
          className={`relative p-6 border-2 rounded-xl text-right transition-all hover:border-primary hover:shadow-md ${
            selectedMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">الدفع ببطاقة الائتمان</h4>
                  <p className="text-sm text-gray-500">Visa, Mastercard, Mada</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mr-15">
                ادفع الآن بالكامل باستخدام بطاقتك الائتمانية أو بطاقة مدى
              </p>
            </div>
            {selectedMethod === 'card' && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(amount)}
            </div>
          </div>
        </button>

        {/* Tabby Option */}
        <button
          onClick={() => handleMethodSelect('tabby')}
          disabled={isProcessing}
          className={`relative p-6 border-2 rounded-xl text-right transition-all hover:border-accent hover:shadow-md ${
            selectedMethod === 'tabby' ? 'border-accent bg-accent/5' : 'border-gray-200'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-20 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center px-2">
                  <img 
                    src="https://checkout.tabby.ai/tabby-logo.svg" 
                    alt="Tabby" 
                    className="h-6 w-auto"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">التقسيط مع Tabby</h4>
                  <p className="text-sm text-gray-500">قسّمها على 4 دفعات بدون فوائد</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mr-15">
                ادفع على 4 دفعات كل أسبوعين، بدون فوائد أو رسوم إضافية
              </p>
            </div>
            {selectedMethod === 'tabby' && (
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(amount / 4)}
              </span>
              <span className="text-sm text-gray-500">× 4 دفعات</span>
            </div>
          </div>
        </button>

        {/* Tamara Option */}
        <button
          onClick={() => handleMethodSelect('tamara')}
          disabled={isProcessing}
          className={`relative p-6 border-2 rounded-xl text-right transition-all hover:border-green-500 hover:shadow-md ${
            selectedMethod === 'tamara' ? 'border-green-500 bg-green-50' : 'border-gray-200'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-20 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center px-2">
                  <img 
                    src="https://cdn.tamara.co/assets/svg/tamara-logo.svg" 
                    alt="Tamara" 
                    className="h-6 w-auto"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">التقسيط مع Tamara</h4>
                  <p className="text-sm text-gray-500">قسّمها على 3 أو 4 دفعات بدون فوائد</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mr-15">
                ادفع على 3 دفعات شهرياً، بدون فوائد أو رسوم إضافية
              </p>
            </div>
            {selectedMethod === 'tamara' && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(amount / 3)}
              </span>
              <span className="text-sm text-gray-500">× 3 دفعات</span>
            </div>
          </div>
        </button>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>جاري التحضير...</span>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        جميع طرق الدفع آمنة ومشفرة
      </p>
    </div>
  );
}
