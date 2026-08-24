import crypto from 'crypto';
import { razorpayInstance, isRazorpayConfigured } from '../config/razorpay';
import { config } from '../config';

export interface CreateRazorpayOrderResult {
  razorpayOrderId: string;
  amount: number; // in paise
  currency: string;
  isMock: boolean;
}

export const createRazorpayOrder = async (
  orderNumber: string,
  amountInINR: number
): Promise<CreateRazorpayOrderResult> => {
  const amountInPaise = Math.round(amountInINR * 100);

  if (isRazorpayConfigured() && razorpayInstance) {
    try {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          store: 'QuickStore',
          orderNumber,
        },
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);
      return {
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        isMock: false,
      };
    } catch (error: any) {
      console.error('Razorpay API error:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message || 'Gateway error'}`);
    }
  }

  // Graceful test/sandbox fallback when live API keys are placeholders
  const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    razorpayOrderId: mockOrderId,
    amount: amountInPaise,
    currency: 'INR',
    isMock: true,
  };
};

export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  // Allow test signature in development / mock mode
  if (razorpayOrderId.startsWith('order_mock_') || !isRazorpayConfigured()) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};
