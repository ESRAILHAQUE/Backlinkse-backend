import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getPublicTestimonials,
    getAllTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
} from '../controllers/testimonialController';

const router = Router();

// Public: visible testimonials
router.get('/', getPublicTestimonials);

// Admin / moderator: manage testimonials
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllTestimonials);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getTestimonialById);
router.post('/', authenticate, authorizeRoles('admin', 'moderator'), createTestimonial);
router.patch('/:id', authenticate, authorizeRoles('admin', 'moderator'), updateTestimonial);
router.delete('/:id', authenticate, authorizeRoles('admin', 'moderator'), deleteTestimonial);

export default router;

