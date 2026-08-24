// Cart Routes
import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController';
import { authenticateJWT } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { cartItemSchema, updateCartItemSchema } from '../validators';

const router = Router();

router.use(authenticateJWT);

router.get('/', getCart);
router.post('/items', validateBody(cartItemSchema), addItemToCart);
router.patch('/items/:id', validateBody(updateCartItemSchema), updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/clear', clearCart);

export default router;