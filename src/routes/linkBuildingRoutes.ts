import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getPublicPackages,
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage,
} from '../controllers/linkBuildingController';

const router = Router();

// Public route - no auth required
router.get('/public', getPublicPackages);

// Admin routes - require authentication and admin/moderator role
router.use(authenticate);
router.use(authorizeRoles('admin', 'moderator'));

router.get('/', getAllPackages);
router.post('/', createPackage);
router.patch('/:id', updatePackage);
router.delete('/:id', deletePackage);

export default router;

