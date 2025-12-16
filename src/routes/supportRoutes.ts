import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    getAllTickets,
    getTicketById,
    createTicket,
    updateTicket,
    getAllTicketsAdmin,
    getTicketByIdAdmin,
    updateTicketAdmin,
} from '../controllers/supportController';

const router = Router();

// All support routes require authentication
router.use(authenticate);

router.get('/', getAllTickets);
router.get('/admin/all', authorizeRoles('admin', 'moderator'), getAllTicketsAdmin);
router.get('/admin/:id', authorizeRoles('admin', 'moderator'), getTicketByIdAdmin);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.patch('/admin/:id', authorizeRoles('admin', 'moderator'), updateTicketAdmin);
router.patch('/:id', updateTicket);

export default router;

