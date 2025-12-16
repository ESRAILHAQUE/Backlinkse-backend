import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getPublicBlogPosts,
    getAllBlogPosts,
    getBlogPostById,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
} from '../controllers/blogController';

const router = Router();

// Public: published blog posts
router.get('/', getPublicBlogPosts);

// Admin / moderator: manage blog posts
router.get('/admin/all', authenticate, authorizeRoles('admin', 'moderator'), getAllBlogPosts);
router.get('/admin/:id', authenticate, authorizeRoles('admin', 'moderator'), getBlogPostById);
router.post('/', authenticate, authorizeRoles('admin', 'moderator'), createBlogPost);
router.patch('/:id', authenticate, authorizeRoles('admin', 'moderator'), updateBlogPost);
router.delete('/:id', authenticate, authorizeRoles('admin', 'moderator'), deleteBlogPost);

export default router;

