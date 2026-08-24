import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Safe sanitized logging
  console.error('[Global Error Handler]:', {
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle Prisma unique constraint error
  if (err.code === 'P2002') {
    const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field';
    return errorResponse(res, `A record with this ${target} already exists.`, 409);
  }

  // Handle Prisma not found
  if (err.code === 'P2025') {
    return errorResponse(res, 'The requested resource was not found.', 404);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid session token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Session token has expired. Please login again.', 401);
  }

  // Default internal server error - never expose raw internals to client
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred on the server. Please try again later.'
    : err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};
