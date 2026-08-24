// Product Routes
import { Router } from 'express';
import {
  getProducts,
  searchProducts,
  getProductBySlug,
  getFeaturedProducts,
  getBestDeals,
  getRecommendations,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticateJWT, requireRole, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { productSchema, updateProductSchema } from '../validators';

const router = Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/deals', getBestDeals);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/:slug', getProductBySlug);

// Admin Product Routes
router.post('/', authenticateJWT, requireRole('ADMIN'), validateBody(productSchema), createProduct);
router.patch('/:id', authenticateJWT, requireRole('ADMIN'), validateBody(updateProductSchema), updateProduct);
router.delete('/:id', authenticateJWT, requireRole('ADMIN'), deleteProduct);

export default router;