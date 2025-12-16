import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getActiveGlobalSettings,
    getAllGlobalSettings,
    getGlobalSettingsById,
    createGlobalSettings,
    updateGlobalSettings,
    updateActiveGlobalSettings,
    deleteGlobalSettings,
} from '../controllers/globalSettingsController';

const router = Router();

// Public route to get active global settings
router.get('/', getActiveGlobalSettings);

// Route to update active global settings (requires auth but allows any authenticated user)
router.patch('/', authenticate, updateActiveGlobalSettings);

// Admin routes
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllGlobalSettings);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getGlobalSettingsById);
router.post('/admin', authenticate, authorizeRoles('admin'), createGlobalSettings);
router.patch('/admin/:id', authenticate, authorizeRoles('admin'), updateGlobalSettings);
router.delete('/admin/:id', authenticate, authorizeRoles('admin'), deleteGlobalSettings);

export default router;

