import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService';
import { calculateOrderPricing } from '../services/pricingService';
import { notificationDispatcher } from '../services/notificationService';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const initiatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { couponCode } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Cart is empty.', 400);
    }

    const pricing = await calculateOrderPricing(
      cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      couponCode,
      userId
    );

    const tempReceipt = `temp_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder(tempReceipt, pricing.grandTotal);

    return successResponse(res, 'Payment initiated.', {
      razorpayOrderId: razorpayOrder.razorpayOrderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      grandTotal: pricing.grandTotal,
      isMock: razorpayOrder.isMock,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return errorResponse(res, 'Payment signature verification failed. Potential tampering detected.', 400);
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        statusHistory: {
          create: {
            status: 'CONFIRMED',
            comment: `Payment verified via Razorpay (${razorpayPaymentId}).`,
          },
        },
      },
      include: { items: true, statusHistory: true },
    });

    await notificationDispatcher.sendOrderStatusNotification(userId, order.orderNumber, 'CONFIRMED');

    return successResponse(res, 'Payment verified and order confirmed!', updatedOrder);
  } catch (error) {
    next(error);
  }
};