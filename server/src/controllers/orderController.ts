import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateOrderPricing } from '../services/pricingService';
import { validateDeliveryLocation } from '../services/geoService';
import { decrementStock, restoreStock } from '../services/inventoryService';
import { notificationDispatcher } from '../services/notificationService';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { addressId, paymentMethod, deliveryNotes, couponCode } = req.body;

    const storeSettings = await prisma.storeSetting.findFirst();
    if (storeSettings && !storeSettings.isOpen) {
      return errorResponse(res, 'Store is currently closed. You can place an order when we reopen.', 400);
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return errorResponse(res, 'Delivery address not found.', 404);
    }

    const customerCoord = {
      latitude: address.latitude || storeSettings?.storeLatitude || 12.9716,
      longitude: address.longitude || storeSettings?.storeLongitude || 77.5946,
    };
    const deliveryZone = await validateDeliveryLocation(customerCoord);
    if (!deliveryZone.isDeliverable) {
      return errorResponse(res, 'Sorry, we currently do not deliver to this location.', 400);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Your cart is empty.', 400);
    }

    const pricing = await calculateOrderPricing(
      cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      couponCode,
      userId
    );

    if (paymentMethod === 'CASH_ON_DELIVERY') {
      if (storeSettings && !storeSettings.codEnabled) {
        return errorResponse(res, 'Cash on Delivery is currently unavailable.', 400);
      }
      if (storeSettings && storeSettings.maxCodAmount && pricing.grandTotal > storeSettings.maxCodAmount) {
        return errorResponse(
          res,
          `Cash on Delivery is only available for orders up to ₹${storeSettings.maxCodAmount}.`,
          400
        );
      }
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `QS-${dateStr}-${randomSuffix}`;

    const order = await prisma.$transaction(async (tx) => {
      await decrementStock(
        cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        tx
      );

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PLACED',
          paymentMethod,
          paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'PENDING',
          subtotal: pricing.subtotal,
          discount: pricing.couponDiscount,
          deliveryFee: pricing.deliveryFee,
          tax: pricing.tax,
          total: pricing.grandTotal,
          couponCode: pricing.couponCode,
          addressSnapshot: JSON.stringify(address),
          deliveryLatitude: customerCoord.latitude,
          deliveryLongitude: customerCoord.longitude,
          deliveryDistanceKm: deliveryZone.distanceKm,
          deliveryNotes: deliveryNotes?.trim() || null,
          items: {
            create: pricing.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              unit: item.unit,
              price: item.price,
              mrp: item.mrp,
              quantity: item.quantity,
              total: item.total,
            })),
          },
          statusHistory: {
            create: {
              status: 'PLACED',
              comment: 'Order placed by customer.',
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      if (pricing.couponCode && pricing.couponDiscount > 0) {
        const coupon = await tx.coupon.findUnique({
          where: { code: pricing.couponCode },
        });
        if (coupon) {
          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId,
              orderId: newOrder.id,
              discountAmount: pricing.couponDiscount,
            },
          });
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    await notificationDispatcher.sendOrderStatusNotification(userId, order.orderNumber, 'PLACED');

    return successResponse(res, 'Order placed successfully.', order, 201);
  } catch (error: any) {
    if (error.message) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 'Orders retrieved.', orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        ...(req.user!.role !== 'ADMIN' ? { userId } : {}),
      },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    return successResponse(res, 'Order details fetched.', order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id,
        ...(req.user!.role !== 'ADMIN' ? { userId } : {}),
      },
      include: { items: true },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    const cancellableStatuses = ['PLACED', 'CONFIRMED', 'PACKING'];
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse(
        res,
        `Cannot cancel order because it is already ${order.status.toLowerCase().replace(/_/g, ' ')}.`,
        400
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await restoreStock(
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        tx
      );

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancelReason: reason || 'Cancelled by customer',
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus,
          statusHistory: {
            create: {
              status: 'CANCELLED',
              comment: reason || 'Cancelled by customer',
            },
          },
        },
        include: { items: true, statusHistory: true },
      });

      return updated;
    });

    await notificationDispatcher.sendOrderStatusNotification(order.userId, order.orderNumber, 'CANCELLED');

    return successResponse(res, 'Order cancelled successfully.', updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const reorderItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    let addedCount = 0;
    const skippedItems = [];

    for (const item of order.items) {
      if (!item.productId) continue;

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.isAvailable && product.stockQuantity > 0) {
        const qtyToAdd = Math.min(item.quantity, product.stockQuantity);
        await prisma.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: product.id,
            },
          },
          update: { quantity: qtyToAdd },
          create: {
            cartId: cart.id,
            productId: product.id,
            quantity: qtyToAdd,
          },
        });
        addedCount++;
      } else {
        skippedItems.push(item.productName);
      }
    }

    return successResponse(res, `${addedCount} items added to your cart.`, {
      addedCount,
      skippedItems,
    });
  } catch (error) {
    next(error);
  }
};