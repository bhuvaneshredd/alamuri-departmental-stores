import { z } from 'zod';

// Auth Validators
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be a valid 10-digit Indian number').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional().or(z.literal('')),
  profileImage: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Address Validators
export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  house: z.string().min(1, 'Flat / House number is required'),
  street: z.string().min(2, 'Street / Building name is required'),
  area: z.string().min(2, 'Area / Locality is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
  landmark: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  addressType: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
  isDefault: z.boolean().default(false),
});

// Category Validators
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Product Validators
export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  mrp: z.number().positive('MRP must be greater than 0'),
  unit: z.string().min(1, 'Unit/Weight (e.g. 500g, 1L) is required'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  image: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updateProductSchema = productSchema.partial();

// Cart Validators
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be 0 or more'),
});

// Order Validators
export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.enum(['ONLINE_RAZORPAY', 'CASH_ON_DELIVERY']),
  deliveryNotes: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PLACED',
    'CONFIRMED',
    'PACKING',
    'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  comment: z.string().optional(),
});

// Coupon Validators
export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  discountValue: z.number().positive('Discount value must be positive'),
  minimumOrderAmount: z.number().min(0).default(0),
  maximumDiscount: z.number().positive().optional().nullable(),
  startDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()),
  usageLimit: z.number().int().positive().optional().nullable(),
  perCustomerLimit: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
});

// Store Settings Validators
export const updateStoreSettingsSchema = z.object({
  storeName: z.string().min(2).optional(),
  storeLogo: z.string().optional().nullable(),
  storePhone: z.string().min(10).optional(),
  storeEmail: z.string().email().optional(),
  storeAddress: z.string().min(5).optional(),
  storeLatitude: z.number().optional(),
  storeLongitude: z.number().optional(),
  maxDeliveryRadiusKm: z.number().positive().optional(),
  minOrderAmount: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  freeDeliveryThreshold: z.number().min(0).optional(),
  codEnabled: z.boolean().optional(),
  maxCodAmount: z.number().positive().optional(),
  onlinePaymentEnabled: z.boolean().optional(),
  isOpen: z.boolean().optional(),
  openingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  closingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  estimatedDeliveryMinutes: z.number().int().positive().optional(),
  taxPercentage: z.number().min(0).max(100).optional(),
});
