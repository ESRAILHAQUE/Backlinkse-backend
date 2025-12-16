import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getDashboardStats,
    getRecentActivity,
    getCampaignProgress,
    getAdminDashboardStats,
    getAdminRecentActivity,
} from '../controllers/dashboardController';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/campaign-progress', getCampaignProgress);

// Admin dashboard routes
router.get('/admin/stats', authorizeRoles('admin', 'moderator'), getAdminDashboardStats);
router.get('/admin/activity', authorizeRoles('admin', 'moderator'), getAdminRecentActivity);

export default router;

