import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { Project } from '../models/Project';
import { Activity } from '../models/Activity';
import mongoose from 'mongoose';

/**
 * Ensure sample projects are seeded for a user
 * This seeds the database with sample static data from the reference page
 */
async function ensureSeeded(userId: mongoose.Types.ObjectId): Promise<void> {
    const existingProjects = await Project.countDocuments({ userId });

    if (existingProjects > 0) {
        return; // Already seeded
    }

    const now = new Date();
    const sampleProjects = [
        {
            userId,
            name: 'TechStartup.io',
            domain: 'techstartup.io',
            status: 'Active' as const,
            linksBuilt: 45,
            targetLinks: 100,
            startDate: new Date('2024-10-15'),
            lastActivity: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
            userId,
            name: 'HealthCare Plus',
            domain: 'healthcareplus.com',
            status: 'Active' as const,
            linksBuilt: 78,
            targetLinks: 150,
            startDate: new Date('2024-09-01'),
            lastActivity: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
            userId,
            name: 'E-Commerce Store',
            domain: 'myecomstore.com',
            status: 'Paused' as const,
            linksBuilt: 32,
            targetLinks: 50,
            startDate: new Date('2024-11-01'),
            lastActivity: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
            userId,
            name: 'SaaS Dashboard',
            domain: 'saasapp.co',
            status: 'Active' as const,
            linksBuilt: 120,
            targetLinks: 200,
            startDate: new Date('2024-07-20'),
            lastActivity: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        },
        {
            userId,
            name: 'Legal Services',
            domain: 'legalfirm.law',
            status: 'Completed' as const,
            linksBuilt: 50,
            targetLinks: 50,
            startDate: new Date('2024-06-01'),
            lastActivity: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        },
    ];

    const insertedProjects = await Project.insertMany(sampleProjects);

    // Create activities for the seeded projects
    for (let i = 0; i < insertedProjects.length; i++) {
        const project = insertedProjects[i];
        const sampleProject = sampleProjects[i];
        await Activity.create({
            userId,
            action: 'New project created',
            site: sampleProject.domain,
            projectId: project._id as mongoose.Types.ObjectId,
        });
    }
}

/**
 * Get all projects for user
 * GET /api/v1/projects
 */
export const getAllProjects = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = new mongoose.Types.ObjectId(req.user!._id);

        // Seed sample projects if database is empty for this user
        await ensureSeeded(userId);

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
        const {
            name,
            domain,
            targetLinks,
            category,
            sensitiveTopics,
            countries,
            languages,
            taskForPublisher,
            targetPages,
        } = req.body;

        if (!name || !domain || !targetLinks) {
            throw new AppError('Name, domain, and targetLinks are required', 400);
        }

        // Validate targetPages if provided
        if (targetPages && Array.isArray(targetPages) && targetPages.length > 50) {
            throw new AppError('You can add up to 50 anchor-URL pairs', 400);
        }

        // Validate countries and languages
        if (countries && Array.isArray(countries) && countries.length > 3) {
            throw new AppError('You can select up to 3 countries', 400);
        }
        if (languages && Array.isArray(languages) && languages.length > 3) {
            throw new AppError('You can select up to 3 languages', 400);
        }

        const project = await Project.create({
            userId,
            name,
            domain,
            targetLinks,
            category,
            sensitiveTopics,
            countries,
            languages,
            taskForPublisher,
            targetPages,
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

