import Razorpay from 'razorpay';
import { config } from './index';

export const razorpayInstance = config.razorpay.keyId && config.razorpay.keySecret
  ? new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    })
  : null;

export const isRazorpayConfigured = (): boolean => {
  return !!(config.razorpay.keyId && config.razorpay.keySecret && !config.razorpay.keyId.includes('SAMPLE'));
};
