import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getAllTickets,
    getTicketById,
    createTicket,
    updateTicket,
} from '../controllers/supportController';

const router = Router();

// All support routes require authentication
router.use(authenticate);

router.get('/', getAllTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.patch('/:id', updateTicket);

export default router;

