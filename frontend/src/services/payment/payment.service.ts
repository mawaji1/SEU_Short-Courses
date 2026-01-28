/**
 * Payment Service
 * 
 * Frontend API client for payment operations
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PaymentResponse {
    id: string;
    registrationId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    providerPaymentId: string | null;
    providerTransactionId: string | null;
    paidAt: string | null;
    createdAt: string;
    registration: {
        id: string;
        cohortId: string;
        status: string;
        cohort: {
            id: string;
            nameAr: string;
            nameEn: string;
            startDate: string;
            endDate: string;
            program: {
                id: string;
                titleAr: string;
                titleEn: string;
                slug: string;
                price: number;
            };
        };
    };
}

export interface CreatePaymentRequest {
    registrationId: string;
    amount: number;
    currency?: string;
}

export interface CreatePaymentResponse {
    paymentId: string;
    providerPaymentId: string;  // Will be HyperPay payment ID when implemented
    amount: number;
    currency: string;
    publishableKey: string;
}

/**
 * Create payment for a registration
 */
export async function createPayment(
    data: CreatePaymentRequest,
    token: string,
): Promise<CreatePaymentResponse> {
    const response = await fetch(`${API_BASE}/api/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل إنشاء عملية الدفع');
    }

    return response.json();
}

/**
 * Get payment details
 */
export async function getPayment(
    paymentId: string,
    token: string,
): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE}/api/payments/${paymentId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل تحميل بيانات الدفع');
    }

    return response.json();
}

/**
 * Confirm payment after provider callback
 * TODO: Update when HyperPay is implemented
 */
export async function confirmPayment(providerPaymentId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/api/payments/${providerPaymentId}/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل تأكيد الدفع');
    }

    return response.json();
}

/**
 * Refund payment
 */
export async function refundPayment(
    paymentId: string,
    token: string,
    reason?: string,
): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/payments/${paymentId}/refund`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل استرداد المبلغ');
    }

    return response.json();
}
