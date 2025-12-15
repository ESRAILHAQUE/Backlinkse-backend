import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getPublicServices,
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from '../controllers/serviceController';

const router = Router();

// Public: published services
router.get('/', getPublicServices);

// Admin / moderator: manage services
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllServices);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getServiceById);
router.post('/', authenticate, authorizeRoles('admin', 'moderator'), createService);
router.patch('/:id', authenticate, authorizeRoles('admin', 'moderator'), updateService);
router.delete('/:id', authenticate, authorizeRoles('admin', 'moderator'), deleteService);

export default router;

