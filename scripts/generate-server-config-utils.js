const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', { encoding: 'utf8' });
  console.log('Created: ' + filePath);
}

// 1. Config
writeFile('server/src/config/index.ts', `
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'quickstore_super_secret_jwt_key_development_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },
  adminInitial: {
    email: process.env.ADMIN_INITIAL_EMAIL || 'admin@quickstore.com',
    password: process.env.ADMIN_INITIAL_PASSWORD || 'Admin@123456',
  }
};
`);

writeFile('server/src/config/prisma.ts', `
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
`);

writeFile('server/src/config/razorpay.ts', `
import Razorpay from 'razorpay';
import { config } from './index';

export const razorpayInstance = config.razorpay.keyId && config.razorpay.keySecret
  ? new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    })
  : null;

export const isRazorpayConfigured = (): boolean => {
  return !!(config.razorpay.keyId && config.razorpay.keySecret && !config.razorpay.keyId.includes('SAMPLE'));
};
`);

writeFile('server/src/config/cloudinary.ts', `
import { v2 as cloudinary } from 'cloudinary';
import { config } from './index';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const isCloudinaryConfigured = (): boolean => {
  return !!(
    config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret &&
    !config.cloudinary.cloudName.includes('sample')
  );
};

export default cloudinary;
`);

// 2. Utils
writeFile('server/src/utils/apiResponse.ts', `
import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};
`);

writeFile('server/src/utils/jwt.ts', `
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
`);

writeFile('server/src/utils/password.ts', `
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
`);

writeFile('server/src/utils/slugify.ts', `
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\\s+/g, '-') // Replace spaces with -
    .replace(/[^\\w\\-]+/g, '') // Remove all non-word chars
    .replace(/\\-\\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};
`);

console.log('Finished writing config and utils.');
