import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
} from '../controllers/projectController';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;

