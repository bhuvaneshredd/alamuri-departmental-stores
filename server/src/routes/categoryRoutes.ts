// Category Routes
import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { categorySchema } from '../validators';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin Category Routes
router.post('/', authenticateJWT, requireRole('ADMIN'), validateBody(categorySchema), createCategory);
router.patch('/:id', authenticateJWT, requireRole('ADMIN'), validateBody(categorySchema.partial()), updateCategory);
router.delete('/:id', authenticateJWT, requireRole('ADMIN'), deleteCategory);

export default router;