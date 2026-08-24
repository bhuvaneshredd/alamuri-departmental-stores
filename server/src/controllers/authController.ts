import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(phone ? [{ phone: phone.trim() }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return errorResponse(res, 'An account with this email already exists.', 409);
      }
      return errorResponse(res, 'An account with this phone number already exists.', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
      },
    });

    // Create empty cart for customer
    await prisma.cart.create({
      data: { userId: user.id },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    return successResponse(
      res,
      'Registration successful. Welcome to QuickStore!',
      { user, token },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };

    return successResponse(res, 'Login successful.', { user: userProfile, token });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.role !== 'ADMIN' || !user.isActive) {
      return errorResponse(res, 'Access denied. Invalid administrator credentials.', 403);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    };

    return successResponse(res, 'Admin authenticated successfully.', { user: userProfile, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    return successResponse(res, 'Profile retrieved successfully.', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, profileImage } = req.body;

    if (phone) {
      const existing = await prisma.user.findFirst({
        where: {
          phone: phone.trim(),
          NOT: { id: req.user!.userId },
        },
      });
      if (existing) {
        return errorResponse(res, 'Phone number is already associated with another account.', 409);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(profileImage !== undefined && { profileImage }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    return successResponse(res, 'Profile updated successfully.', updatedUser);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) return errorResponse(res, 'User not found.', 404);

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect current password.', 400);
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return successResponse(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};