import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getPublicFAQs,
    getAllFAQs,
    getFAQById,
    createFAQ,
    updateFAQ,
    deleteFAQ,
} from '../controllers/faqController';

const router = Router();

// Public: visible FAQs
router.get('/', getPublicFAQs);

// Admin / moderator: manage FAQs
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllFAQs);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getFAQById);
router.post('/', authenticate, authorizeRoles('admin', 'moderator'), createFAQ);
router.patch('/:id', authenticate, authorizeRoles('admin', 'moderator'), updateFAQ);
router.delete('/:id', authenticate, authorizeRoles('admin', 'moderator'), deleteFAQ);

export default router;

