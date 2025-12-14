import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { Project } from '../models/Project';
import { Activity } from '../models/Activity';

/**
 * Get all projects for user
 * GET /api/v1/projects
 */
export const getAllProjects = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        const projects = await Project.find({ userId }).sort({ createdAt: -1 }).lean();

        // Get stats
        const totalProjects = projects.length;
        const activeProjects = projects.filter((p) => p.status === 'Active').length;
        const totalLinksBuilt = projects.reduce((sum, p) => sum + p.linksBuilt, 0);
        const avgProgress =
            projects.length > 0
                ? Math.round(
                      (projects.reduce((sum, p) => sum + p.linksBuilt / p.targetLinks, 0) /
                          projects.length) *
                          100
                  )
                : 0;

        sendSuccess(res, 'Projects retrieved successfully', {
            projects,
            stats: {
                totalProjects,
                activeProjects,
                totalLinksBuilt,
                avgProgress,
            },
        });
    }
);

/**
 * Get single project by ID
 * GET /api/v1/projects/:id
 */
export const getProjectById = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        const project = await Project.findOne({ _id: id, userId }).lean();

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        sendSuccess(res, 'Project retrieved successfully', { project });
    }
);

/**
 * Create new project
 * POST /api/v1/projects
 */
export const createProject = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { name, domain, targetLinks } = req.body;

        if (!name || !domain || !targetLinks) {
            throw new AppError('Name, domain, and targetLinks are required', 400);
        }

        const project = await Project.create({
            userId,
            name,
            domain,
            targetLinks,
            status: 'Active',
        });

        // Create activity
        await Activity.create({
            userId,
            action: 'New project created',
            site: domain,
            projectId: project._id,
        });

        sendSuccess(res, 'Project created successfully', { project }, 201);
    }
);

/**
 * Update project
 * PATCH /api/v1/projects/:id
 */
export const updateProject = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;
        const { name, domain, status, targetLinks } = req.body;

        const project = await Project.findOneAndUpdate(
            { _id: id, userId },
            {
                ...(name && { name }),
                ...(domain && { domain }),
                ...(status && { status }),
                ...(targetLinks && { targetLinks }),
                lastActivity: new Date(),
            },
            { new: true, runValidators: true }
        ).lean();

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        sendSuccess(res, 'Project updated successfully', { project });
    }
);

/**
 * Delete project
 * DELETE /api/v1/projects/:id
 */
export const deleteProject = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        const project = await Project.findOneAndDelete({ _id: id, userId });

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        sendSuccess(res, 'Project deleted successfully');
    }
);

