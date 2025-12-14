import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getCurrentSubscription,
    getAllSubscriptions,
    createSubscription,
    cancelSubscription,
} from '../controllers/subscriptionController';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

router.get('/current', getCurrentSubscription);
router.get('/', getAllSubscriptions);
router.post('/', createSubscription);
router.patch('/:id/cancel', cancelSubscription);

export default router;

