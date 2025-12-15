import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getPublicPricing,
    getAllPricing,
    createPricing,
    updatePricing,
    deletePricing,
} from '../controllers/pricingController';

const router = Router();

// Public: active plans
router.get('/', getPublicPricing);

// Admin / moderator: manage plans
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllPricing);
router.post('/', authenticate, authorizeRoles('admin', 'moderator'), createPricing);
router.patch('/:id', authenticate, authorizeRoles('admin', 'moderator'), updatePricing);
router.delete('/:id', authenticate, authorizeRoles('admin', 'moderator'), deletePricing);

export default router;

