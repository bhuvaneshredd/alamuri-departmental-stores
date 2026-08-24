import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { notificationDispatcher } from '../services/notificationService';
import { restoreStock } from '../services/inventoryService';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todayOrdersCount,
      todayRevenueAgg,
      totalCustomers,
      totalProducts,
      lowStockCount,
      pendingOrdersCount,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfToday },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.product.count({
        where: {
          stockQuantity: { lte: 5 },
        },
      }),
      prisma.order.count({
        where: { status: { in: ['PLACED', 'CONFIRMED', 'PACKING'] } },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pastOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, total: true },
    });

    const revenueByDayMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(5, 10);
      revenueByDayMap[key] = 0;
    }

    pastOrders.forEach((o) => {
      const key = o.createdAt.toISOString().slice(5, 10);
      if (revenueByDayMap[key] !== undefined) {
        revenueByDayMap[key] += o.total;
      }
    });

    const salesTrend = Object.entries(revenueByDayMap).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));

    return successResponse(res, 'Dashboard metrics fetched.', {
      metrics: {
        todayOrders: todayOrdersCount,
        todayRevenue: todayRevenueAgg._sum.total || 0,
        totalCustomers,
        totalProducts,
        lowStockCount,
        pendingOrders: pendingOrdersCount,
      },
      salesTrend,
      ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count.status })),
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, paymentStatus, search, page = '1', limit = '25' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse(res, 'Admin orders list.', orders, 200, {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return errorResponse(res, 'Order not found.', 404);

    const validTransitions: Record<string, string[]> = {
      PLACED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PACKING', 'CANCELLED'],
      PACKING: ['READY_FOR_DELIVERY', 'CANCELLED'],
      READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return errorResponse(
        res,
        `Invalid status transition from ${order.status} to ${status}.`,
        400
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        await restoreStock(
          order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          tx
        );
      }

      const paymentStatus =
        status === 'DELIVERED' && order.paymentMethod === 'CASH_ON_DELIVERY'
          ? 'PAID'
          : order.paymentStatus;

      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          paymentStatus,
          statusHistory: {
            create: {
              status,
              comment: comment || `Status updated to ${status} by store admin.`,
            },
          },
        },
        include: { items: true, statusHistory: true, user: true },
      });

      return updated;
    });

    await notificationDispatcher.sendOrderStatusNotification(order.userId, order.orderNumber, status);

    return successResponse(res, `Order status updated to ${status}.`, updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const getCustomersList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const where: any = { role: 'CUSTOMER' };
    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    const formattedCustomers = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      isActive: c.isActive,
      createdAt: c.createdAt,
      totalOrders: c._count.orders,
      lifetimeSpend: c.orders.reduce((sum, o) => sum + o.total, 0),
    }));

    return successResponse(res, 'Customers list.', formattedCustomers, 200, {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCustomerStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user || user.role === 'ADMIN') {
      return errorResponse(res, 'Customer account not found.', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    return successResponse(
      res,
      `Customer account ${updated.isActive ? 'activated' : 'disabled'}.`,
      updated
    );
  } catch (error) {
    next(error);
  }
};

export const getLowStockInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stockQuantity: { lte: 10 },
      },
      include: { category: true },
      orderBy: { stockQuantity: 'asc' },
    });

    return successResponse(res, 'Low stock products retrieved.', products);
  } catch (error) {
    next(error);
  }
};