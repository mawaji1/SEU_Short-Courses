/**
 * BNPL (Buy Now Pay Later) Service
 * Handles Tabby and Tamara payment integration
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export enum BNPLProvider {
  TABBY = 'TABBY',
  TAMARA = 'TAMARA',
}

export interface BNPLEligibility {
  eligible: boolean;
  provider: BNPLProvider;
  minAmount?: number;
  maxAmount?: number;
  reason?: string;
}

export interface InstallmentPlan {
  provider: string;
  installments: number;
  installmentAmount: number;
  frequency: string;
  totalAmount: number;
  fees: number;
  description: string;
}

/**
 * Check BNPL eligibility for a registration
 */
export async function checkBNPLEligibility(
  registrationId: string,
  token: string,
): Promise<BNPLEligibility[]> {
  try {
    const response = await fetch(
      `${API_BASE}/api/payments/bnpl/eligibility/${registrationId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('فشل التحقق من الأهلية');
    }

    return await response.json();
  } catch (error) {
    console.error('BNPL eligibility check failed:', error);
    return [];
  }
}

/**
 * Create BNPL checkout session
 */
export async function createBNPLCheckout(
  registrationId: string,
  provider: BNPLProvider,
  token: string,
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/payments/bnpl/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        registrationId,
        provider,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'فشل إنشاء جلسة الدفع',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('BNPL checkout creation failed:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء إنشاء جلسة الدفع',
    };
  }
}

/**
 * Get installment plan details
 */
export async function getInstallmentPlan(
  amount: number,
  provider: BNPLProvider,
): Promise<InstallmentPlan | null> {
  try {
    const response = await fetch(
      `${API_BASE}/api/payments/bnpl/installment-plan?amount=${amount}&provider=${provider}`,
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get installment plan:', error);
    return null;
  }
}
