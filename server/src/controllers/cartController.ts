import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateOrderPricing } from '../services/pricingService';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { couponCode } = req.query;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { category: true } } } } },
      });
    }

    if (cart.items.length === 0) {
      return successResponse(res, 'Cart is empty.', {
        cartId: cart.id,
        items: [],
        pricing: {
          subtotal: 0,
          mrpTotal: 0,
          totalProductSavings: 0,
          deliveryFee: 0,
          isFreeDelivery: false,
          freeDeliveryThreshold: 299,
          amountNeededForFreeDelivery: 299,
          tax: 0,
          taxPercentage: 5,
          couponDiscount: 0,
          couponCode: null,
          grandTotal: 0,
          totalSavings: 0,
        },
      });
    }

    const calculationInput = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      const pricing = await calculateOrderPricing(
        calculationInput,
        couponCode as string | undefined,
        userId
      );

      return successResponse(res, 'Cart retrieved.', {
        cartId: cart.id,
        items: cart.items,
        pricing,
      });
    } catch (pricingErr: any) {
      return successResponse(res, 'Cart retrieved with warnings.', {
        cartId: cart.id,
        items: cart.items,
        error: pricingErr.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isAvailable) {
      return errorResponse(res, 'Product is currently unavailable.', 400);
    }

    if (product.stockQuantity < quantity) {
      return errorResponse(
        res,
        `Only ${product.stockQuantity} units available for ${product.name}.`,
        400
      );
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stockQuantity < newQuantity) {
        return errorResponse(
          res,
          `Cannot add more. Maximum available stock is ${product.stockQuantity}.`,
          400
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return errorResponse(res, 'Cart not found.', 404);

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        OR: [{ id }, { productId: id }],
      },
      include: { product: true },
    });

    if (!cartItem) return errorResponse(res, 'Item not found in cart.', 404);

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItem.id } });
    } else {
      if (cartItem.product.stockQuantity < quantity) {
        return errorResponse(
          res,
          `Only ${cartItem.product.stockQuantity} units available.`,
          400
        );
      }

      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
      });
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return errorResponse(res, 'Cart not found.', 404);

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        OR: [{ id }, { productId: id }],
      },
    });

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return successResponse(res, 'Cart cleared successfully.');
  } catch (error) {
    next(error);
  }
};