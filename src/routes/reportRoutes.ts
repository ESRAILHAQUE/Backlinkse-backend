import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getAllReports,
    getReportById,
    createReport,
    updateReport,
} from '../controllers/reportController';

const router = Router();

// All report routes require authentication
router.use(authenticate);

router.get('/', getAllReports);
router.get('/:id', getReportById);
router.post('/', createReport);
router.patch('/:id', updateReport);

export default router;

