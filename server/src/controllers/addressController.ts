import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { validateDeliveryLocation } from '../services/geoService';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return successResponse(res, 'Addresses retrieved.', addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const body = req.body;

    const existingCount = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = body.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        fullName: body.fullName.trim(),
        phone: body.phone.trim(),
        house: body.house.trim(),
        street: body.street.trim(),
        area: body.area.trim(),
        city: body.city.trim(),
        state: body.state.trim(),
        pincode: body.pincode.trim(),
        landmark: body.landmark?.trim() || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        addressType: body.addressType || 'HOME',
        isDefault: shouldBeDefault,
      },
    });

    return successResponse(res, 'Address added successfully.', address, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) return errorResponse(res, 'Address not found.', 404);

    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(body.fullName && { fullName: body.fullName.trim() }),
        ...(body.phone && { phone: body.phone.trim() }),
        ...(body.house && { house: body.house.trim() }),
        ...(body.street && { street: body.street.trim() }),
        ...(body.area && { area: body.area.trim() }),
        ...(body.city && { city: body.city.trim() }),
        ...(body.state && { state: body.state.trim() }),
        ...(body.pincode && { pincode: body.pincode.trim() }),
        ...(body.landmark !== undefined && { landmark: body.landmark?.trim() || null }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.addressType && { addressType: body.addressType }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      },
    });

    return successResponse(res, 'Address updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) return errorResponse(res, 'Address not found.', 404);

    await prisma.address.delete({ where: { id } });

    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return successResponse(res, 'Address deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const validateAddressDelivery = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude, addressId } = req.body;

    let lat = latitude;
    let lng = longitude;

    if (addressId) {
      const addr = await prisma.address.findUnique({ where: { id: addressId } });
      if (addr && addr.latitude && addr.longitude) {
        lat = addr.latitude;
        lng = addr.longitude;
      }
    }

    if (lat === undefined || lng === undefined) {
      const settings = await prisma.storeSetting.findFirst();
      lat = settings?.storeLatitude || 12.9716;
      lng = settings?.storeLongitude || 77.5946;
    }

    const result = await validateDeliveryLocation({ latitude: lat, longitude: lng });
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};