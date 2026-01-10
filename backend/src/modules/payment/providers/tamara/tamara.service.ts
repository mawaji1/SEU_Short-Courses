import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import {
  BNPLCheckoutRequest,
  BNPLCheckoutResponse,
  BNPLRefundRequest,
  BNPLRefundResponse,
  TamaraCheckoutSession,
} from '../../interfaces/bnpl.interface';

/**
 * Tamara Payment Service
 * Handles Tamara Buy Now Pay Later integration
 * 
 * Tamara offers Pay in 3 or Pay in 4 installments
 */
@Injectable()
export class TamaraService {
  private readonly logger = new Logger(TamaraService.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly notificationToken: string;

  constructor() {
    // Sandbox: https://api-sandbox.tamara.co
    // Production: https://api.tamara.co
    this.apiUrl = process.env.TAMARA_API_URL || 'https://api-sandbox.tamara.co';
    this.apiToken = process.env.TAMARA_API_TOKEN || '';
    this.notificationToken = process.env.TAMARA_NOTIFICATION_TOKEN || '';
  }

  /**
   * Check if amount is eligible for Tamara
   * Tamara typically requires minimum 100 SAR
   */
  isEligible(amount: number): boolean {
    const minAmount = parseFloat(process.env.TAMARA_MIN_AMOUNT || '100');
    const maxAmount = parseFloat(process.env.TAMARA_MAX_AMOUNT || '10000');
    
    return amount >= minAmount && amount <= maxAmount;
  }

  /**
   * Create Tamara checkout session
   */
  async createCheckout(request: BNPLCheckoutRequest): Promise<BNPLCheckoutResponse> {
    try {
      const session: TamaraCheckoutSession = {
        order_id: request.registrationId,
        total_amount: {
          amount: request.amount,
          currency: request.currency,
        },
        description: request.description,
        country_code: 'SA',
        payment_type: 'PAY_BY_INSTALMENTS',
        instalments: 4, // Default to 4 installments
        consumer: {
          email: request.customer.email,
          phone_number: request.customer.phone,
          first_name: request.customer.firstName,
          last_name: request.customer.lastName,
        },
        items: [
          {
            name: request.description,
            quantity: 1,
            unit_price: {
              amount: request.amount,
              currency: request.currency,
            },
            type: 'Digital',
          },
        ],
        merchant_url: {
          success: request.successUrl,
          failure: request.failureUrl,
          cancel: request.cancelUrl,
          notification: `${process.env.BACKEND_URL}/api/payments/webhook/tamara`,
        },
      };

      const response = await axios.post(
        `${this.apiUrl}/checkout`,
        session,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Tamara checkout session created: ${response.data.order_id}`);

      return {
        success: true,
        checkoutUrl: response.data.checkout_url,
        sessionId: response.data.order_id,
      };
    } catch (error) {
      this.logger.error('Tamara checkout creation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل إنشاء جلسة الدفع مع Tamara',
      };
    }
  }

  /**
   * Retrieve order details from Tamara
   */
  async getOrderDetails(orderId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/merchants/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Tamara order details:', error);
      throw new BadRequestException('فشل الحصول على تفاصيل الطلب');
    }
  }

  /**
   * Authorize order (confirm the order after customer approval)
   */
  async authorizeOrder(orderId: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/orders/${orderId}/authorise`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Tamara order authorized: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Tamara order authorization failed:', error);
      throw new BadRequestException('فشل تأكيد الطلب');
    }
  }

  /**
   * Capture payment (after service delivery)
   */
  async capturePayment(orderId: string, amount: number): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payments/capture`,
        {
          order_id: orderId,
          total_amount: {
            amount: amount,
            currency: 'SAR',
          },
          shipping_info: {
            shipped_at: new Date().toISOString(),
            shipping_company: 'Digital Delivery',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Tamara payment captured: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Tamara payment capture failed:', error);
      throw new BadRequestException('فشل تأكيد الدفع');
    }
  }

  /**
   * Refund a Tamara payment
   */
  async refundPayment(request: BNPLRefundRequest): Promise<BNPLRefundResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/payments/refund`,
        {
          order_id: request.sessionId,
          total_amount: {
            amount: request.amount,
            currency: 'SAR',
          },
          comment: request.reason || 'Customer request',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Tamara refund created: ${response.data.refund_id}`);

      return {
        success: true,
        refundId: response.data.refund_id,
      };
    } catch (error) {
      this.logger.error('Tamara refund failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل إرجاع المبلغ',
      };
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Tamara order cancelled: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Tamara order cancellation failed:', error);
      throw new BadRequestException('فشل إلغاء الطلب');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    // Implement Tamara webhook signature verification
    // This is a placeholder - implement according to Tamara's documentation
    return true;
  }
}
