// Admin Routes
import { Router } from 'express';
import {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatusAdmin,
  getCustomersList,
  toggleCustomerStatus,
  getLowStockInventory,
} from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateOrderStatusSchema } from '../validators';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatusAdmin);
router.get('/customers', getCustomersList);
router.patch('/customers/:id/toggle-status', toggleCustomerStatus);
router.get('/inventory/low-stock', getLowStockInventory);

export default router;