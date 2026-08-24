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
      throw new Error(`Product with ID ${item.productId} is unavailable or out of stock.`);
    }
    if (product.stockQuantity < item.quantity) {
      throw new Error(`Only ${product.stockQuantity} units available for ${product.name}.`);
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
  const settings = (await prisma.storeSetting.findFirst()) || {
    minOrderAmount: 0,
    deliveryFee: 25,
    freeDeliveryThreshold: 299,
    taxPercentage: 5,
  };

  if (settings.minOrderAmount > 0 && subtotal < settings.minOrderAmount) {
    throw new Error(`Minimum order value is ₹${settings.minOrderAmount}. Please add ₹${(settings.minOrderAmount - subtotal).toFixed(0)} more.`);
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
