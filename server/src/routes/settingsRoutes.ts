// Settings Routes
import { Router } from 'express';
import {
  getStoreSettings,
  updateStoreSettings,
  toggleStoreStatus,
} from '../controllers/settingsController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateStoreSettingsSchema } from '../validators';

const router = Router();

// Public store configuration
router.get('/', getStoreSettings);

// Admin store settings management
router.patch('/', authenticateJWT, requireRole('ADMIN'), validateBody(updateStoreSettingsSchema), updateStoreSettings);
router.patch('/toggle-status', authenticateJWT, requireRole('ADMIN'), toggleStoreStatus);

export default router;