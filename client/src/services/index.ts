import api from './api';
import {
  ApiResponse,
  User,
  Product,
  Category,
  Cart,
  Address,
  Order,
  Coupon,
  StoreSetting,
  Notification,
} from '../types';

export const authService = {
  register: (data: any) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),
  login: (data: any) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),
  adminLogin: (data: any) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/admin-login', data),
  getMe: () => api.get<ApiResponse<User & { addresses: Address[] }>>('/auth/me'),
  updateProfile: (data: any) => api.patch<ApiResponse<User>>('/auth/profile', data),
  changePassword: (data: any) => api.post<ApiResponse<void>>('/auth/change-password', data),
};

export const productService = {
  getProducts: (params?: any) => api.get<ApiResponse<Product[]>>('/products', { params }),
  search: (q: string, limit = 8) => api.get<ApiResponse<{ suggestions: string[]; products: Product[] }>>('/products/search', { params: { q, limit } }),
  getBySlug: (slug: string) => api.get<ApiResponse<{ product: Product; relatedProducts: Product[] }>>(`/products/${slug}`),
  getFeatured: () => api.get<ApiResponse<Product[]>>('/products/featured'),
  getDeals: () => api.get<ApiResponse<Product[]>>('/products/deals'),
  getRecommendations: () => api.get<ApiResponse<Product[]>>('/products/recommendations'),
};

export const categoryService = {
  getCategories: (includeInactive = false) => api.get<ApiResponse<Category[]>>('/categories', { params: { includeInactive } }),
  getBySlug: (slug: string) => api.get<ApiResponse<Category & { products: Product[] }>>(`/categories/${slug}`),
};

export const cartService = {
  getCart: (couponCode?: string) => api.get<ApiResponse<Cart>>('/cart', { params: { couponCode } }),
  addItem: (productId: string, quantity = 1) => api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity }),
  updateQuantity: (id: string, quantity: number) => api.patch<ApiResponse<Cart>>(`/cart/items/${id}`, { quantity }),
  removeItem: (id: string) => api.delete<ApiResponse<Cart>>(`/cart/items/${id}`),
  clearCart: () => api.delete<ApiResponse<void>>('/cart/clear'),
};

export const addressService = {
  getAddresses: () => api.get<ApiResponse<Address[]>>('/addresses'),
  createAddress: (data: any) => api.post<ApiResponse<Address>>('/addresses', data),
  updateAddress: (id: string, data: any) => api.patch<ApiResponse<Address>>(`/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete<ApiResponse<void>>(`/addresses/${id}`),
  validateDelivery: (data: { latitude?: number; longitude?: number; addressId?: string }) =>
    api.post<ApiResponse<{ isDeliverable: boolean; distanceKm: number; maxRadiusKm: number; estimatedMinutes: number; message: string }>>('/addresses/validate-delivery', data),
};

export const orderService = {
  createOrder: (data: { addressId: string; paymentMethod: string; deliveryNotes?: string; couponCode?: string }) =>
    api.post<ApiResponse<Order>>('/orders', data),
  getOrders: () => api.get<ApiResponse<Order[]>>('/orders'),
  getOrderById: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`),
  cancelOrder: (id: string, reason?: string) => api.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason }),
  reorder: (id: string) => api.post<ApiResponse<{ addedCount: number; skippedItems: string[] }>>(`/orders/${id}/reorder`),
};

export const paymentService = {
  initiatePayment: (couponCode?: string) => api.post<ApiResponse<{ razorpayOrderId: string; amount: number; currency: string; grandTotal: number; isMock: boolean }>>('/payments/initiate', { couponCode }),
  verifyPayment: (data: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    api.post<ApiResponse<Order>>('/payments/verify', data),
};

export const couponService = {
  getPublicCoupons: () => api.get<ApiResponse<Coupon[]>>('/coupons/public'),
  validateCoupon: (code: string, subtotal: number) => api.post<ApiResponse<{ code: string; discountAmount: number; discountType: string; discountValue: number }>>('/coupons/validate', { code, subtotal }),
};

export const adminService = {
  getDashboardStats: () => api.get<ApiResponse<any>>('/admin/dashboard'),
  getOrders: (params?: any) => api.get<ApiResponse<Order[]>>('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string, comment?: string) => api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status, comment }),
  getCustomers: (params?: any) => api.get<ApiResponse<any[]>>('/admin/customers', { params }),
  toggleCustomerStatus: (id: string) => api.patch<ApiResponse<any>>(`/admin/customers/${id}/toggle-status`),
  getLowStockInventory: () => api.get<ApiResponse<Product[]>>('/admin/inventory/low-stock'),
  createProduct: (data: any) => api.post<ApiResponse<Product>>('/products', data),
  updateProduct: (id: string, data: any) => api.patch<ApiResponse<Product>>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete<ApiResponse<void>>(`/products/${id}`),
  createCategory: (data: any) => api.post<ApiResponse<Category>>('/categories', data),
  updateCategory: (id: string, data: any) => api.patch<ApiResponse<Category>>(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete<ApiResponse<void>>(`/categories/${id}`),
  getAllCoupons: () => api.get<ApiResponse<Coupon[]>>('/coupons/admin'),
  createCoupon: (data: any) => api.post<ApiResponse<Coupon>>('/coupons/admin', data),
  updateCoupon: (id: string, data: any) => api.patch<ApiResponse<Coupon>>(`/coupons/admin/${id}`, data),
  deleteCoupon: (id: string) => api.delete<ApiResponse<void>>(`/coupons/admin/${id}`),
  updateSettings: (data: any) => api.patch<ApiResponse<StoreSetting>>('/settings', data),
  toggleStoreStatus: () => api.patch<ApiResponse<StoreSetting>>('/settings/toggle-status'),
};

export const settingsService = {
  getStoreSettings: () => api.get<ApiResponse<StoreSetting>>('/settings'),
};

export const notificationService = {
  getNotifications: () => api.get<ApiResponse<Notification[]>>('/notifications'),
  markRead: (id: string) => api.patch<ApiResponse<void>>(`/notifications/${id}/read`),
};