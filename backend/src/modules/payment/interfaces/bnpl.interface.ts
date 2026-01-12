/**
 * BNPL (Buy Now Pay Later) Interfaces
 * For Tabby and Tamara integrations
 */

export enum BNPLProvider {
  TABBY = 'TABBY',
  TAMARA = 'TAMARA',
}

export interface BNPLEligibilityCheck {
  eligible: boolean;
  provider: BNPLProvider;
  minAmount?: number;
  maxAmount?: number;
  reason?: string;
}

export interface BNPLCheckoutRequest {
  provider: BNPLProvider;
  registrationId: string;
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
}

export interface BNPLCheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  paymentId?: string; // Tabby payment ID for verification
  error?: string;
}

export interface BNPLWebhookPayload {
  provider: BNPLProvider;
  sessionId: string;
  status: 'approved' | 'rejected' | 'expired' | 'cancelled';
  amount: number;
  currency: string;
  metadata?: any;
}

export interface BNPLRefundRequest {
  provider: BNPLProvider;
  sessionId: string;
  amount: number;
  reason?: string;
}

export interface BNPLRefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
}

// Tabby-specific interfaces
export interface TabbyCheckoutSession {
  id: string;
  payment: {
    amount: string;
    currency: string;
    description: string;
  };
  lang?: string; // Language: 'ar' or 'en'
  buyer: {
    email: string;
    phone: string;
    name: string;
  };
  order: {
    reference_id: string;
    items: Array<{
      title: string;
      quantity: number;
      unit_price: string;
      category: string;
    }>;
  };
  merchant_urls: {
    success: string;
    cancel: string;
    failure: string;
  };
}

// Tamara-specific interfaces
export interface TamaraCheckoutSession {
  order_id: string;
  total_amount: {
    amount: number;
    currency: string;
  };
  description: string;
  country_code: string;
  payment_type: 'PAY_BY_INSTALMENTS';
  instalments: number;
  consumer: {
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit_price: {
      amount: number;
      currency: string;
    };
    type: string;
  }>;
  merchant_url: {
    success: string;
    failure: string;
    cancel: string;
    notification: string;
  };
}
