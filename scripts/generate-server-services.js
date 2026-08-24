const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', { encoding: 'utf8' });
  console.log('Created: ' + filePath);
}

// 1. Geo Service
writeFile('server/src/services/geoService.ts', `
import prisma from '../config/prisma';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface DeliveryValidationResult {
  isDeliverable: boolean;
  distanceKm: number;
  maxRadiusKm: number;
  estimatedMinutes: number;
  storeLocation: GeoLocation;
  message: string;
}

/**
 * Calculates the great-circle distance between two coordinates in kilometers
 * using the Haversine formula.
 */
export const calculateHaversineDistance = (
  coord1: GeoLocation,
  coord2: GeoLocation
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Validates whether a customer coordinate is within the store's delivery radius
 */
export const validateDeliveryLocation = async (
  customerLocation: GeoLocation
): Promise<DeliveryValidationResult> => {
  let settings = await prisma.storeSetting.findFirst();
  
  if (!settings) {
    settings = await prisma.storeSetting.create({
      data: {
        id: 'default-store-setting',
        storeName: 'QuickStore',
        storeLatitude: 12.9716,
        storeLongitude: 77.5946,
        maxDeliveryRadiusKm: 7.5,
        estimatedDeliveryMinutes: 15,
      },
    });
  }

  const storeLocation: GeoLocation = {
    latitude: settings.storeLatitude,
    longitude: settings.storeLongitude,
  };

  const distanceKm = calculateHaversineDistance(storeLocation, customerLocation);
  const isDeliverable = distanceKm <= settings.maxDeliveryRadiusKm;

  // Estimate delivery time: base 10 mins + 2 mins per km
  const estimatedMinutes = Math.min(
    Math.max(10, Math.round(10 + distanceKm * 2)),
    45
  );

  return {
    isDeliverable,
    distanceKm,
    maxRadiusKm: settings.maxDeliveryRadiusKm,
    estimatedMinutes,
    storeLocation,
    message: isDeliverable
      ? \`Delivering to your location in ~\${estimatedMinutes} mins (\${distanceKm} km away)\`
      : \`Sorry, your location is \${distanceKm} km away, which exceeds our maximum delivery radius of \${settings.maxDeliveryRadiusKm} km.\`,
  };
};
`);

// 2. Pricing Service
writeFile('server/src/services/pricingService.ts', `
import prisma from '../config/prisma';

export interface CartCalculationInputItem {
  productId: string;
  quantity: number;
}

export interface PriceBreakdown {
  items: Array<{
    productId: string;
    productName: string;
    productImage: string | null;
    unit: string;
    price: number;
    mrp: number;
    quantity: number;
    total: number;
    mrpTotal: number;
    savings: number;
  }>;
  subtotal: number;
  mrpTotal: number;
  totalProductSavings: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  tax: number;
  taxPercentage: number;
  couponDiscount: number;
  couponCode: string | null;
  grandTotal: number;
  totalSavings: number;
}

export const calculateOrderPricing = async (
  rawItems: CartCalculationInputItem[],
  couponCode?: string | null,
  userId?: string
): Promise<PriceBreakdown> => {
  if (!rawItems || rawItems.length === 0) {
    throw new Error('Cart is empty');
  }

  const productIds = rawItems.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isAvailable: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  let mrpTotal = 0;
  const calculatedItems = [];

  for (const item of rawItems) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(\`Product with ID \${item.productId} is unavailable or out of stock.\`);
    }
    if (product.stockQuantity < item.quantity) {
      throw new Error(\`Only \${product.stockQuantity} units available for \${product.name}.\`);
    }

    const itemTotal = Math.round(product.price * item.quantity * 100) / 100;
    const itemMrpTotal = Math.round(product.mrp * item.quantity * 100) / 100;
    const itemSavings = Math.max(0, itemMrpTotal - itemTotal);

    subtotal += itemTotal;
    mrpTotal += itemMrpTotal;

    calculatedItems.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      unit: product.unit,
      price: product.price,
      mrp: product.mrp,
      quantity: item.quantity,
      total: itemTotal,
      mrpTotal: itemMrpTotal,
      savings: itemSavings,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  mrpTotal = Math.round(mrpTotal * 100) / 100;
  const totalProductSavings = Math.max(0, mrpTotal - subtotal);

  // Store Settings for delivery fee & taxes
  const settings = await prisma.storeSetting.findFirst() || {
    minOrderAmount: 99,
    deliveryFee: 25,
    freeDeliveryThreshold: 299,
    taxPercentage: 5,
  };

  if (subtotal < settings.minOrderAmount) {
    throw new Error(\`Minimum order amount is ₹\${settings.minOrderAmount}. Current subtotal: ₹\${subtotal}.\`);
  }

  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;
  const amountNeededForFreeDelivery = isFreeDelivery
    ? 0
    : Math.max(0, Math.round((settings.freeDeliveryThreshold - subtotal) * 100) / 100);

  // Tax calculation
  const tax = Math.round((subtotal * (settings.taxPercentage / 100)) * 100) / 100;

  // Coupon Discount
  let couponDiscount = 0;
  let appliedCouponCode: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });

    const now = new Date();
    if (
      coupon &&
      coupon.isActive &&
      coupon.startDate <= now &&
      coupon.expiryDate >= now &&
      subtotal >= coupon.minimumOrderAmount
    ) {
      // Check usage limits
      let allowed = true;
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        allowed = false;
      }
      if (allowed && userId && coupon.perCustomerLimit) {
        const userUsageCount = await prisma.couponUsage.count({
          where: { couponId: coupon.id, userId },
        });
        if (userUsageCount >= coupon.perCustomerLimit) {
          allowed = false;
        }
      }

      if (allowed) {
        if (coupon.discountType === 'PERCENTAGE') {
          couponDiscount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maximumDiscount && couponDiscount > coupon.maximumDiscount) {
            couponDiscount = coupon.maximumDiscount;
          }
        } else {
          couponDiscount = Math.min(coupon.discountValue, subtotal);
        }
        couponDiscount = Math.round(couponDiscount * 100) / 100;
        appliedCouponCode = coupon.code;
      }
    }
  }

  const grandTotal = Math.max(
    0,
    Math.round((subtotal - couponDiscount + deliveryFee + tax) * 100) / 100
  );
  const totalSavings = Math.round((totalProductSavings + couponDiscount) * 100) / 100;

  return {
    items: calculatedItems,
    subtotal,
    mrpTotal,
    totalProductSavings,
    deliveryFee,
    isFreeDelivery,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    tax,
    taxPercentage: settings.taxPercentage,
    couponDiscount,
    couponCode: appliedCouponCode,
    grandTotal,
    totalSavings,
  };
};
`);

// 3. Inventory Service
writeFile('server/src/services/inventoryService.ts', `
import prisma from '../config/prisma';

export const decrementStock = async (
  items: Array<{ productId: string; quantity: number }>,
  tx: any = prisma
) => {
  for (const item of items) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, stockQuantity: true },
    });

    if (!product) {
      throw new Error(\`Product \${item.productId} not found during stock deduction.\`);
    }

    if (product.stockQuantity < item.quantity) {
      throw new Error(\`Insufficient stock for product \${product.name}. Available: \${product.stockQuantity}, Requested: \${item.quantity}.\`);
    }

    await tx.product.update({
      where: { id: item.productId },
      data: {
        stockQuantity: {
          decrement: item.quantity,
        },
      },
    });
  }
};

export const restoreStock = async (
  items: Array<{ productId: string | null; quantity: number }>,
  tx: any = prisma
) => {
  for (const item of items) {
    if (!item.productId) continue;
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stockQuantity: {
          increment: item.quantity,
        },
      },
    });
  }
};
`);

// 4. Razorpay Service
writeFile('server/src/services/razorpayService.ts', `
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
      throw new Error(\`Failed to create Razorpay order: \${error.message || 'Gateway error'}\`);
    }
  }

  // Graceful test/sandbox fallback when live API keys are placeholders
  const mockOrderId = \`order_mock_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}\`;
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
    .update(\`\${razorpayOrderId}|\${razorpayPaymentId}\`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};
`);

// 5. Image Service
writeFile('server/src/services/imageService.ts', `
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';

export const uploadImage = async (
  fileBase64OrPath: string,
  folder: string = 'quickstore'
): Promise<string> => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(fileBase64OrPath, {
        folder,
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', format: 'webp' }],
      });
      return result.secure_url;
    } catch (error: any) {
      console.error('Cloudinary upload failed:', error);
      // If upload fails, return the path/URL if it's already a URL
      if (fileBase64OrPath.startsWith('http')) return fileBase64OrPath;
      throw new Error(\`Image upload failed: \${error.message}\`);
    }
  }

  // Fallback if Cloudinary is not configured: return the provided URL/placeholder
  return fileBase64OrPath;
};
`);

// 6. Notification Service
writeFile('server/src/services/notificationService.ts', `
import prisma from '../config/prisma';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'ORDER_UPDATE' | 'OFFER' | 'SYSTEM';
  metadata?: Record<string, any>;
}

export interface INotificationChannel {
  send(payload: NotificationPayload): Promise<void>;
}

// In-app Database Channel
export class DatabaseNotificationChannel implements INotificationChannel {
  async send(payload: NotificationPayload): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Failed to create DB notification:', error);
    }
  }
}

// Extensible SMS Channel Adapter (e.g. Twilio / Fast2SMS)
export class SmsNotificationChannel implements INotificationChannel {
  async send(payload: NotificationPayload): Promise<void> {
    // Log SMS delivery trigger (ready for Twilio / Fast2SMS API key integration)
    console.log(\`[SMS Notification Adapter] Sent to User \${payload.userId}: \${payload.title} - \${payload.message}\`);
  }
}

// Extensible WhatsApp Channel Adapter (e.g. WhatsApp Cloud API / Gupshup)
export class WhatsAppNotificationChannel implements INotificationChannel {
  async send(payload: NotificationPayload): Promise<void> {
    console.log(\`[WhatsApp Notification Adapter] Sent to User \${payload.userId}: \${payload.title}\`);
  }
}

export class NotificationDispatcher {
  private channels: INotificationChannel[] = [
    new DatabaseNotificationChannel(),
    new SmsNotificationChannel(),
    new WhatsAppNotificationChannel(),
  ];

  async dispatch(payload: NotificationPayload): Promise<void> {
    await Promise.allSettled(this.channels.map((channel) => channel.send(payload)));
  }

  async sendOrderStatusNotification(
    userId: string,
    orderNumber: string,
    status: string
  ): Promise<void> {
    const statusMessages: Record<string, { title: string; message: string }> = {
      PLACED: {
        title: 'Order Placed Successfully! 🛒',
        message: \`Your order #\${orderNumber} has been placed and received by our store.\`,
      },
      CONFIRMED: {
        title: 'Order Confirmed! ✅',
        message: \`Store has accepted order #\${orderNumber}. Preparing items now.\`,
      },
      PACKING: {
        title: 'Packing Your Items 📦',
        message: \`Order #\${orderNumber} is being packed fresh at the store.\`,
      },
      READY_FOR_DELIVERY: {
        title: 'Order Packed & Ready 🛵',
        message: \`Order #\${orderNumber} is ready for dispatch.\`,
      },
      OUT_FOR_DELIVERY: {
        title: 'Out for Delivery! ⚡',
        message: \`Our delivery partner is on the way with your order #\${orderNumber}.\`,
      },
      DELIVERED: {
        title: 'Order Delivered! 🎉',
        message: \`Order #\${orderNumber} was delivered successfully. Enjoy your groceries!\`,
      },
      CANCELLED: {
        title: 'Order Cancelled ❌',
        message: \`Order #\${orderNumber} has been cancelled.\`,
      },
    };

    const notification = statusMessages[status] || {
      title: 'Order Status Update',
      message: \`Order #\${orderNumber} status changed to \${status}.\`,
    };

    await this.dispatch({
      userId,
      title: notification.title,
      message: notification.message,
      type: 'ORDER_UPDATE',
      metadata: { orderNumber, status },
    });
  }
}

export const notificationDispatcher = new NotificationDispatcher();
`);

console.log('Finished writing server services.');
