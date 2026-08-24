// Order Routes
import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  reorderItems,
} from '../controllers/orderController';
import { authenticateJWT } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createOrderSchema } from '../validators';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateBody(createOrderSchema), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/reorder', reorderItems);

export default router;