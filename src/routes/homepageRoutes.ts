import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getPublicHomepageSections,
    getAllHomepageSections,
    getHomepageSectionById,
    createHomepageSection,
    updateHomepageSection,
    deleteHomepageSection,
} from '../controllers/homepageController';

const router = Router();

// Public: enabled homepage sections
router.get('/', getPublicHomepageSections);

// Admin / moderator: manage homepage sections
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllHomepageSections);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getHomepageSectionById);
router.post('/', authenticate, authorizeRoles('admin', 'moderator'), createHomepageSection);
router.patch('/:id', authenticate, authorizeRoles('admin', 'moderator'), updateHomepageSection);
router.delete('/:id', authenticate, authorizeRoles('admin', 'moderator'), deleteHomepageSection);

export default router;

