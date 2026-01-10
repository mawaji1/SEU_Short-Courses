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
    <div className="space-y-4">
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold mb-4">💳 قسّط مشترياتك بدون فوائد</h3>
        
        {/* Tabby Option */}
        {tabbyPlan && (
          <div className="mb-4 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="12" fontWeight="bold">Tabby</text>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Tabby - قسّمها على 4 دفعات</p>
                  <p className="text-sm text-gray-600">{tabbyPlan.description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">كل دفعة:</span>
                <span className="text-2xl font-bold text-purple-600">
                  {tabbyPlan.installmentAmount.toFixed(2)} ريال
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {tabbyPlan.installments} دفعات × {tabbyPlan.installmentAmount.toFixed(2)} ريال {tabbyPlan.frequency}
              </p>
              <p className="text-xs text-green-600 font-semibold mt-1">بدون فوائد أو رسوم إضافية</p>
            </div>

            <button
              onClick={() => handleBNPLCheckout(BNPLProvider.TABBY)}
              disabled={processingProvider !== null}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingProvider === BNPLProvider.TABBY ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري التحويل...
                </span>
              ) : (
                'ادفع مع Tabby'
              )}
            </button>
          </div>
        )}

        {/* Tamara Option */}
        {tamaraPlan && (
          <div className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="10" fontWeight="bold">Tamara</text>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Tamara - قسّمها على {tamaraPlan.installments} دفعات</p>
                  <p className="text-sm text-gray-600">{tamaraPlan.description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">كل دفعة:</span>
                <span className="text-2xl font-bold text-green-600">
                  {tamaraPlan.installmentAmount.toFixed(2)} ريال
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {tamaraPlan.installments} دفعات × {tamaraPlan.installmentAmount.toFixed(2)} ريال {tamaraPlan.frequency}
              </p>
              <p className="text-xs text-green-600 font-semibold mt-1">بدون فوائد أو رسوم إضافية</p>
            </div>

            <button
              onClick={() => handleBNPLCheckout(BNPLProvider.TAMARA)}
              disabled={processingProvider !== null}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingProvider === BNPLProvider.TAMARA ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري التحويل...
                </span>
              ) : (
                'ادفع مع Tamara'
              )}
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>ملاحظة:</strong> سيتم تحويلك إلى صفحة الدفع الآمنة لإكمال عملية التقسيط. 
          لا توجد فوائد أو رسوم إضافية.
        </p>
      </div>
    </div>
  );
}
