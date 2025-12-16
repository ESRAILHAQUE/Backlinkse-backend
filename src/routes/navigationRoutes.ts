import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getActiveNavigation,
    getAllNavigations,
    getNavigationById,
    createNavigation,
    updateNavigation,
    updateActiveNavigation,
    deleteNavigation,
} from '../controllers/navigationController';

const router = Router();

// Public route to get active navigation
router.get('/', getActiveNavigation);

// Route to update active navigation (requires auth but allows any authenticated user)
router.patch('/', authenticate, updateActiveNavigation);

// Admin routes
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllNavigations);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getNavigationById);
router.post('/admin', authenticate, authorizeRoles('admin'), createNavigation);
router.patch('/admin/:id', authenticate, authorizeRoles('admin'), updateNavigation);
router.delete('/admin/:id', authenticate, authorizeRoles('admin'), deleteNavigation);

export default router;

