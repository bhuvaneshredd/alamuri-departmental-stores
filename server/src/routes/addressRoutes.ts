// Address Routes
import { Router } from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  validateAddressDelivery,
} from '../controllers/addressController';
import { authenticateJWT } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { addressSchema } from '../validators';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAddresses);
router.post('/', validateBody(addressSchema), createAddress);
router.patch('/:id', validateBody(addressSchema.partial()), updateAddress);
router.delete('/:id', deleteAddress);
router.post('/validate-delivery', validateAddressDelivery);

export default router;