import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getPublicCaseStudies,
    getAllCaseStudies,
    getCaseStudyById,
    createCaseStudy,
    updateCaseStudy,
    deleteCaseStudy,
} from '../controllers/caseStudyController';

const router = Router();

// Public: published case studies
router.get('/', getPublicCaseStudies);

// Admin / moderator: manage case studies
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllCaseStudies);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getCaseStudyById);
router.post('/', authenticate, authorizeRoles('admin', 'moderator'), createCaseStudy);
router.patch('/:id', authenticate, authorizeRoles('admin', 'moderator'), updateCaseStudy);
router.delete('/:id', authenticate, authorizeRoles('admin', 'moderator'), deleteCaseStudy);

export default router;

