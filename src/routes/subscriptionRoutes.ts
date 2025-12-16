import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getCurrentSubscription,
    getAllSubscriptions,
    getAllSubscriptionsAdmin,
    createSubscription,
    cancelSubscription,
    cancelSubscriptionAdmin,
} from '../controllers/subscriptionController';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

router.get('/current', getCurrentSubscription);
router.get('/', getAllSubscriptions);
router.get('/admin/all', authorizeRoles('admin', 'moderator'), getAllSubscriptionsAdmin);
router.post('/', createSubscription);
router.patch('/:id/cancel', cancelSubscription);
router.patch('/:id/cancel-admin', authorizeRoles('admin', 'moderator'), cancelSubscriptionAdmin);

export default router;

