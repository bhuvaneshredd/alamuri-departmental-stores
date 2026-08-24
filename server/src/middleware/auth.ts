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
      role: user.role as 'CUSTOMER' | 'ADMIN',
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
          role: user.role as 'CUSTOMER' | 'ADMIN',
        };
      }
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }
  next();
};