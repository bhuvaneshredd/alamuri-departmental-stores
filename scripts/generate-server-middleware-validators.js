const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', { encoding: 'utf8' });
  console.log('Created: ' + filePath);
}

// 1. Validators
writeFile('server/src/validators/index.ts', `
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
`);

// 2. Auth Middleware
writeFile('server/src/middleware/auth.ts', `
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { errorResponse } from '../utils/apiResponse';
import prisma from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'Account is disabled or does not exist', 401);
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired session. Please log in again.', 401);
  }
};

export const requireRole = (role: 'ADMIN' | 'CUSTOMER') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access forbidden: Insufficient permissions', 403);
    }
    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isActive: true },
      });
      if (user && user.isActive) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }
  next();
};
`);

// 3. Validation Middleware
writeFile('server/src/middleware/validate.ts', `
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { errorResponse } from '../utils/apiResponse';

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return errorResponse(res, 'Validation failed', 422, formattedErrors);
      }
      return errorResponse(res, 'Invalid request data', 400);
    }
  };
};

export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return errorResponse(res, 'Invalid query parameters', 422, formattedErrors);
      }
      return errorResponse(res, 'Invalid query parameters', 400);
    }
  };
};
`);

// 4. Global Error Handler Middleware
writeFile('server/src/middleware/errorHandler.ts', `
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Safe sanitized logging
  console.error('[Global Error Handler]:', {
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle Prisma unique constraint error
  if (err.code === 'P2002') {
    const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field';
    return errorResponse(res, \`A record with this \${target} already exists.\`, 409);
  }

  // Handle Prisma not found
  if (err.code === 'P2025') {
    return errorResponse(res, 'The requested resource was not found.', 404);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid session token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Session token has expired. Please login again.', 401);
  }

  // Default internal server error - never expose raw internals to client
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred on the server. Please try again later.'
    : err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};
`);

// 5. Rate Limiter Middleware
writeFile('server/src/middleware/rateLimiter.ts', `
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit login/register attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});
`);

console.log('Finished writing middleware and validators.');
