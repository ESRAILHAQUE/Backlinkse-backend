import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getAllPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
} from '../controllers/paymentController';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

router.get('/', getAllPaymentMethods);
router.post('/', addPaymentMethod);
router.patch('/:id/set-default', setDefaultPaymentMethod);
router.delete('/:id', deletePaymentMethod);

export default router;

