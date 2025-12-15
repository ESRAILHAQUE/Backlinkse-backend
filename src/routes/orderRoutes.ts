import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
} from '../controllers/orderController';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id', authorizeRoles('admin', 'moderator'), updateOrder);

export default router;

