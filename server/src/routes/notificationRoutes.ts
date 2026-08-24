// Notification Routes
import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
} from '../controllers/notificationController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;