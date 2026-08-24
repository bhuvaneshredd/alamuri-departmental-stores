import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const validateCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user?.userId;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return errorResponse(res, 'Invalid or expired coupon code.', 400);
    }

    const now = new Date();
    if (coupon.startDate > now || coupon.expiryDate < now) {
      return errorResponse(res, 'Coupon has expired.', 400);
    }

    if (subtotal < coupon.minimumOrderAmount) {
      return errorResponse(
        res,
        `Minimum cart amount of ₹${coupon.minimumOrderAmount} required for this coupon.`,
        400
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse(res, 'Coupon usage limit has been reached.', 400);
    }

    if (userId && coupon.perCustomerLimit) {
      const usageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (usageCount >= coupon.perCustomerLimit) {
        return errorResponse(res, 'You have already used this coupon maximum allowed times.', 400);
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return successResponse(res, 'Coupon applied successfully!', {
      code: coupon.code,
      discountAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        expiryDate: { gte: now },
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        minimumOrderAmount: true,
        maximumDiscount: true,
        expiryDate: true,
      },
      orderBy: { discountValue: 'desc' },
    });

    return successResponse(res, 'Available offers.', coupons);
  } catch (error) {
    next(error);
  }
};

export const getAllCouponsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { usages: true } },
      },
    });
    return successResponse(res, 'Coupons fetched.', coupons);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const existing = await prisma.coupon.findUnique({
      where: { code: body.code.toUpperCase().trim() },
    });

    if (existing) {
      return errorResponse(res, 'Coupon code already exists.', 409);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase().trim(),
        discountType: body.discountType,
        discountValue: Number(body.discountValue),
        minimumOrderAmount: Number(body.minimumOrderAmount) || 0,
        maximumDiscount: body.maximumDiscount ? Number(body.maximumDiscount) : null,
        startDate: new Date(body.startDate),
        expiryDate: new Date(body.expiryDate),
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        perCustomerLimit: Number(body.perCustomerLimit) || 1,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    return successResponse(res, 'Coupon created successfully.', coupon, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code && { code: body.code.toUpperCase().trim() }),
        ...(body.discountType && { discountType: body.discountType }),
        ...(body.discountValue !== undefined && { discountValue: Number(body.discountValue) }),
        ...(body.minimumOrderAmount !== undefined && { minimumOrderAmount: Number(body.minimumOrderAmount) }),
        ...(body.maximumDiscount !== undefined && { maximumDiscount: body.maximumDiscount ? Number(body.maximumDiscount) : null }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.expiryDate && { expiryDate: new Date(body.expiryDate) }),
        ...(body.usageLimit !== undefined && { usageLimit: body.usageLimit ? Number(body.usageLimit) : null }),
        ...(body.perCustomerLimit !== undefined && { perCustomerLimit: Number(body.perCustomerLimit) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return successResponse(res, 'Coupon updated successfully.', coupon);
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    return successResponse(res, 'Coupon deleted successfully.');
  } catch (error) {
    next(error);
  }
};