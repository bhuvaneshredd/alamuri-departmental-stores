// Main API Router Aggregator
import { Router } from 'express';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import addressRoutes from './addressRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';
import couponRoutes from './couponRoutes';
import adminRoutes from './adminRoutes';
import settingsRoutes from './settingsRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/addresses', addressRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationRoutes);

export default router;