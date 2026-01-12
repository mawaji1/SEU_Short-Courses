'use client';

import { useState, useEffect } from 'react';
import { BNPLProvider, BNPLEligibility, InstallmentPlan, checkBNPLEligibility, getInstallmentPlan, createBNPLCheckout } from '@/services/payment/bnpl.service';

interface BNPLOptionsProps {
  registrationId: string;
  amount: number;
  onCheckoutStart?: () => void;
}

export default function BNPLOptions({ registrationId, amount, onCheckoutStart }: BNPLOptionsProps) {
  const [eligibility, setEligibility] = useState<BNPLEligibility[]>([]);
  const [tabbyPlan, setTabbyPlan] = useState<InstallmentPlan | null>(null);
  const [tamaraPlan, setTamaraPlan] = useState<InstallmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingProvider, setProcessingProvider] = useState<BNPLProvider | null>(null);

  useEffect(() => {
    loadBNPLOptions();
  }, [registrationId, amount]);

  const loadBNPLOptions = async () => {
    try {
      const authData = localStorage.getItem('seu_auth');
      if (!authData) return;

      const auth = JSON.parse(authData);

      // Check eligibility
      const eligibilityData = await checkBNPLEligibility(registrationId, auth.accessToken);
      setEligibility(eligibilityData);

      // Load installment plans for eligible providers
      const tabbyEligible = eligibilityData.find(e => e.provider === BNPLProvider.TABBY && e.eligible);
      const tamaraEligible = eligibilityData.find(e => e.provider === BNPLProvider.TAMARA && e.eligible);

      if (tabbyEligible) {
        const plan = await getInstallmentPlan(amount, BNPLProvider.TABBY);
        setTabbyPlan(plan);
      }

      if (tamaraEligible) {
        const plan = await getInstallmentPlan(amount, BNPLProvider.TAMARA);
        setTamaraPlan(plan);
      }
    } catch (error) {
      console.error('Failed to load BNPL options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBNPLCheckout = async (provider: BNPLProvider) => {
    try {
      setProcessingProvider(provider);
      onCheckoutStart?.();

      const authData = localStorage.getItem('seu_auth');
      if (!authData) {
        alert('يرجى تسجيل الدخول أولاً');
        return;
      }

      const auth = JSON.parse(authData);
      const result = await createBNPLCheckout(registrationId, provider, auth.accessToken);

      if (result.success && result.checkoutUrl) {
        // Redirect to BNPL provider checkout
        window.location.href = result.checkoutUrl;
      } else {
        alert(result.error || 'فشل إنشاء جلسة الدفع');
        setProcessingProvider(null);
      }
    } catch (error) {
      console.error('BNPL checkout failed:', error);
      alert('حدث خطأ أثناء إنشاء جلسة الدفع');
      setProcessingProvider(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">جاري التحقق من خيارات التقسيط...</p>
      </div>
    );
  }

  const hasEligibleOptions = eligibility.some(e => e.eligible);

  if (!hasEligibleOptions) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-base font-semibold mb-3 text-gray-700">أو قسّط الدفع بدون فوائد</h3>
        
        {/* Tabby Option */}
        {tabbyPlan && (
          <button
            onClick={() => handleBNPLCheckout(BNPLProvider.TABBY)}
            disabled={processingProvider !== null}
            className="w-full mb-3 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-right"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 px-3 py-1 rounded text-purple-700 font-bold text-sm">
                  tabby
                </div>
                <div>
                  <p className="font-semibold text-gray-900">قسّمها على 4 دفعات</p>
                  <p className="text-sm text-gray-600">{tabbyPlan.installmentAmount.toFixed(2)} ريال كل أسبوعين</p>
                </div>
              </div>
              {processingProvider === BNPLProvider.TABBY && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              )}
            </div>
          </button>
        )}

        {/* Tamara Option */}
        {tamaraPlan && (
          <button
            onClick={() => handleBNPLCheckout(BNPLProvider.TAMARA)}
            disabled={processingProvider !== null}
            className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-right"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 px-3 py-1 rounded text-green-700 font-bold text-sm">
                  tamara
                </div>
                <div>
                  <p className="font-semibold text-gray-900">قسّمها على {tamaraPlan.installments} دفعات</p>
                  <p className="text-sm text-gray-600">{tamaraPlan.installmentAmount.toFixed(2)} ريال شهرياً</p>
                </div>
              </div>
              {processingProvider === BNPLProvider.TAMARA && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
