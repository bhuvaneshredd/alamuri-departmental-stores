import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await prisma.storeSetting.findFirst();

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: {
          id: 'default-store-setting',
          storeName: 'QuickStore',
          storePhone: '+91 98765 43210',
          storeEmail: 'support@quickstore.in',
          storeAddress: 'Shop 4, Green Avenue, Indiranagar, Bengaluru, Karnataka 560038',
          storeLatitude: 12.9716,
          storeLongitude: 77.5946,
          maxDeliveryRadiusKm: 7.5,
          minOrderAmount: 99,
          deliveryFee: 25,
          freeDeliveryThreshold: 299,
          codEnabled: true,
          maxCodAmount: 2000,
          onlinePaymentEnabled: true,
          isOpen: true,
          openingTime: '06:00',
          closingTime: '23:00',
          estimatedDeliveryMinutes: 15,
          taxPercentage: 5,
        },
      });
    }

    return successResponse(res, 'Store settings retrieved.', settings);
  } catch (error) {
    next(error);
  }
};

export const updateStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    let settings = await prisma.storeSetting.findFirst();

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: { id: 'default-store-setting' },
      });
    }

    const updated = await prisma.storeSetting.update({
      where: { id: settings.id },
      data: {
        ...(body.storeName && { storeName: body.storeName.trim() }),
        ...(body.storeLogo !== undefined && { storeLogo: body.storeLogo }),
        ...(body.storePhone && { storePhone: body.storePhone.trim() }),
        ...(body.storeEmail && { storeEmail: body.storeEmail.trim() }),
        ...(body.storeAddress && { storeAddress: body.storeAddress.trim() }),
        ...(body.storeLatitude !== undefined && { storeLatitude: Number(body.storeLatitude) }),
        ...(body.storeLongitude !== undefined && { storeLongitude: Number(body.storeLongitude) }),
        ...(body.maxDeliveryRadiusKm !== undefined && { maxDeliveryRadiusKm: Number(body.maxDeliveryRadiusKm) }),
        ...(body.minOrderAmount !== undefined && { minOrderAmount: Number(body.minOrderAmount) }),
        ...(body.deliveryFee !== undefined && { deliveryFee: Number(body.deliveryFee) }),
        ...(body.freeDeliveryThreshold !== undefined && { freeDeliveryThreshold: Number(body.freeDeliveryThreshold) }),
        ...(body.codEnabled !== undefined && { codEnabled: Boolean(body.codEnabled) }),
        ...(body.maxCodAmount !== undefined && { maxCodAmount: Number(body.maxCodAmount) }),
        ...(body.onlinePaymentEnabled !== undefined && { onlinePaymentEnabled: Boolean(body.onlinePaymentEnabled) }),
        ...(body.isOpen !== undefined && { isOpen: Boolean(body.isOpen) }),
        ...(body.openingTime && { openingTime: body.openingTime }),
        ...(body.closingTime && { closingTime: body.closingTime }),
        ...(body.estimatedDeliveryMinutes !== undefined && { estimatedDeliveryMinutes: Number(body.estimatedDeliveryMinutes) }),
        ...(body.taxPercentage !== undefined && { taxPercentage: Number(body.taxPercentage) }),
      },
    });

    return successResponse(res, 'Store settings updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

export const toggleStoreStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await prisma.storeSetting.findFirst();
    if (!settings) {
      settings = await prisma.storeSetting.create({ data: { id: 'default-store-setting' } });
    }

    const updated = await prisma.storeSetting.update({
      where: { id: settings.id },
      data: { isOpen: !settings.isOpen },
    });

    return successResponse(
      res,
      `Store is now ${updated.isOpen ? 'OPEN' : 'CLOSED'}.`,
      updated
    );
  } catch (error) {
    next(error);
  }
};