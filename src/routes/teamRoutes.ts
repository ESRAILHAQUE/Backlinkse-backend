import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getAllTeamMembers,
    inviteTeamMember,
    removeTeamMember,
} from '../controllers/teamController';

const router = Router();

// All team routes require authentication
router.use(authenticate);

router.get('/', getAllTeamMembers);
router.post('/invite', inviteTeamMember);
router.delete('/:id', removeTeamMember);

export default router;

