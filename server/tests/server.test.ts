import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { calculateHaversineDistance } from '../src/services/geoService';
import { hashPassword, comparePassword } from '../src/utils/password';
import { generateToken, verifyToken } from '../src/utils/jwt';
import { slugify } from '../src/utils/slugify';
import { verifyRazorpaySignature } from '../src/services/razorpayService';

describe('QuickStore Core Business Logic Tests', () => {
  describe('Password Hashing & Verification', () => {
    it('should correctly hash and compare passwords', async () => {
      const rawPassword = 'SecurePassword@123';
      const hash = await hashPassword(rawPassword);
      expect(hash).not.toBe(rawPassword);

      const isValid = await comparePassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Generation & Verification', () => {
    it('should generate and verify JWT payload correctly', () => {
      const payload = {
        userId: 'user_12345',
        email: 'test@quickstore.com',
        role: 'CUSTOMER' as const,
      };

      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('Haversine Geolocation Distance & Delivery Radius', () => {
    const storeLocation = { latitude: 12.9716, longitude: 77.5946 }; // Store location (Bengaluru)

    it('should calculate accurate distance for nearby customer', () => {
      const nearCustomer = { latitude: 12.9784, longitude: 77.6408 }; // ~5 km away
      const distance = calculateHaversineDistance(storeLocation, nearCustomer);
      expect(distance).toBeGreaterThan(4);
      expect(distance).toBeLessThan(6);
    });

    it('should calculate distance for customer far outside radius', () => {
      const farCustomer = { latitude: 13.1986, longitude: 77.7066 }; // Airport ~27 km away
      const distance = calculateHaversineDistance(storeLocation, farCustomer);
      expect(distance).toBeGreaterThan(20);
    });
  });

  describe('Slugify Utility', () => {
    it('should generate clean URL-safe slugs', () => {
      expect(slugify('Fresh Farm Potatoes (Aloo) 1kg')).toBe('fresh-farm-potatoes-aloo-1kg');
      expect(slugify("Lay's India's Magic Masala! 50g")).toBe('lays-indias-magic-masala-50g');
    });
  });

  describe('Razorpay Signature Verification', () => {
    it('should handle mock orders gracefully in development mode', () => {
      const isMockValid = verifyRazorpaySignature(
        'order_mock_12345',
        'pay_12345',
        'mock_signature'
      );
      expect(isMockValid).toBe(true);
    });
  });
});