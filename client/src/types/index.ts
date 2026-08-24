export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  profileImage?: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  displayOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  categoryId: string;
  category?: Category;
  price: number;
  mrp: number;
  discount: number;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  image?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  pricing?: PricingBreakdown;
  error?: string;
}

export interface PricingBreakdown {
  items?: Array<{
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

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  unit?: string | null;
  price: number;
  mrp: number;
  quantity: number;
  total: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  comment?: string | null;
  createdAt: string;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PACKING'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'ONLINE_RAZORPAY' | 'CASH_ON_DELIVERY';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'COD';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  couponCode?: string | null;
  addressSnapshot: string; // JSON string
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  deliveryDistanceKm?: number | null;
  deliveryNotes?: string | null;
  cancelReason?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number | null;
  startDate: string;
  expiryDate: string;
  usageLimit?: number | null;
  perCustomerLimit: number;
  usedCount: number;
  isActive: boolean;
  _count?: {
    usages: number;
  };
}

export interface StoreSetting {
  id: string;
  storeName: string;
  storeLogo?: string | null;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  storeLatitude: number;
  storeLongitude: number;
  maxDeliveryRadiusKm: number;
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  codEnabled: boolean;
  maxCodAmount: number;
  onlinePaymentEnabled: boolean;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  estimatedDeliveryMinutes: number;
  taxPercentage: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  metadata?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}