import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getDashboardStats,
    getRecentActivity,
    getCampaignProgress,
} from '../controllers/dashboardController';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/campaign-progress', getCampaignProgress);

export default router;

