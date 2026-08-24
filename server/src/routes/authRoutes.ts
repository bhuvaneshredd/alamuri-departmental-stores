// Auth Routes
import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/admin-login', authLimiter, validateBody(loginSchema), adminLogin);

router.get('/me', authenticateJWT, getMe);
router.patch('/profile', authenticateJWT, validateBody(updateProfileSchema), updateProfile);
router.post('/change-password', authenticateJWT, validateBody(changePasswordSchema), changePassword);

export default router;