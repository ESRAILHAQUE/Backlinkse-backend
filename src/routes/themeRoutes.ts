import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getActiveTheme,
    getAllThemes,
    getThemeById,
    createTheme,
    updateTheme,
    updateActiveTheme,
    deleteTheme,
} from '../controllers/themeController';

const router = Router();

// Public route to get active theme
router.get('/', getActiveTheme);

// Route to update active theme (requires auth but allows any authenticated user)
router.patch('/', authenticate, updateActiveTheme);

// Admin routes
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllThemes);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getThemeById);
router.post('/admin', authenticate, authorizeRoles('admin'), createTheme);
router.patch('/admin/:id', authenticate, authorizeRoles('admin'), updateTheme);
router.delete('/admin/:id', authenticate, authorizeRoles('admin'), deleteTheme);

export default router;

