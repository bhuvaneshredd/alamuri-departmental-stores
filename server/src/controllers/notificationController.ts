import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { successResponse } from '../utils/apiResponse';

export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return successResponse(res, 'Notifications retrieved.', notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return successResponse(res, 'All notifications marked as read.');
    }

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    return successResponse(res, 'Notification marked as read.');
  } catch (error) {
    next(error);
  }
};