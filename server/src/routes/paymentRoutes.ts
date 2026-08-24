// Payment Routes
import { Router } from 'express';
import { initiatePayment, verifyPayment } from '../controllers/paymentController';
import { authenticateJWT } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { verifyPaymentSchema } from '../validators';

const router = Router();

router.use(authenticateJWT);

router.post('/initiate', initiatePayment);
router.post('/verify', validateBody(verifyPaymentSchema), verifyPayment);

export default router;