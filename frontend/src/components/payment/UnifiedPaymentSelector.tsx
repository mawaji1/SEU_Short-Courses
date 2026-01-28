'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Check, AlertCircle } from 'lucide-react';
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
 *
 * MIGRATION NOTE: Card payments (Moyasar) removed - HyperPay implementation pending (D-I01)
 * Card option is shown as "Coming Soon" until HyperPay is integrated
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

  const handleMethodSelect = async (method: PaymentMethod) => {
    if (method === 'card') {
      // Card payments temporarily unavailable
      onError?.('الدفع بالبطاقة غير متاح حالياً. يرجى استخدام تابي أو تمارا.');
      return;
    }

    setSelectedMethod(method);

    if (method === 'tabby' || method === 'tamara') {
      await handleBNPLCheckout(method);
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

  // Show payment method selection
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
        اختر طريقة الدفع
      </h3>

      <div className="grid gap-4">
        {/* Card Payment Option - Temporarily Unavailable */}
        <div
          className="relative p-6 border-2 rounded-xl text-right transition-all border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
        >
          <div className="absolute top-3 left-3">
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              قريباً
            </span>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-500">الدفع ببطاقة الائتمان</h4>
                  <p className="text-sm text-gray-400">Visa, Mastercard, Mada</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mr-15">
                غير متاح حالياً - يرجى استخدام تابي أو تمارا
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-2xl font-bold text-gray-400">
              {formatPrice(amount)}
            </div>
          </div>
        </div>

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
