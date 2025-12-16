import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getActiveLiveChat,
    getAllLiveChatSettings,
    getLiveChatById,
    createLiveChat,
    updateLiveChat,
    updateActiveLiveChat,
    deleteLiveChat,
} from '../controllers/liveChatController';

const router = Router();

// Public route to get active live chat settings
router.get('/', getActiveLiveChat);

// Route to update active live chat settings (requires auth but allows any authenticated user)
router.patch('/', authenticate, updateActiveLiveChat);

// Admin routes
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllLiveChatSettings);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getLiveChatById);
router.post('/admin', authenticate, authorizeRoles('admin'), createLiveChat);
router.patch('/admin/:id', authenticate, authorizeRoles('admin'), updateLiveChat);
router.delete('/admin/:id', authenticate, authorizeRoles('admin'), deleteLiveChat);

export default router;

