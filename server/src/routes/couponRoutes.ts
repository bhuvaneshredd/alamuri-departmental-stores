// Coupon Routes
import { Router } from 'express';
import {
  validateCoupon,
  getPublicCoupons,
  getAllCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController';
import { authenticateJWT, requireRole, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { couponSchema, applyCouponSchema } from '../validators';

const router = Router();

router.get('/public', getPublicCoupons);
router.post('/validate', optionalAuth, validateBody(applyCouponSchema), validateCoupon);

// Admin Coupon Routes
router.get('/admin', authenticateJWT, requireRole('ADMIN'), getAllCouponsAdmin);
router.post('/admin', authenticateJWT, requireRole('ADMIN'), validateBody(couponSchema), createCoupon);
router.patch('/admin/:id', authenticateJWT, requireRole('ADMIN'), validateBody(couponSchema.partial()), updateCoupon);
router.delete('/admin/:id', authenticateJWT, requireRole('ADMIN'), deleteCoupon);

export default router;