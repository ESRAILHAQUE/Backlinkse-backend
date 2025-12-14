import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { TeamMember } from '../models/TeamMember';
import { User } from '../models/User';

/**
 * Get all team members for user
 * GET /api/v1/team
 */
export const getAllTeamMembers = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        // Get owner info
        const owner = await User.findById(userId).select('name email').lean();
        if (!owner) {
            throw new AppError('User not found', 404);
        }

        // Get team members
        const teamMembers = await TeamMember.find({ userId }).lean();

        // Format response with owner as first member
        const members = [
            {
                name: owner.name,
                email: owner.email,
                role: 'Owner' as const,
                initials: owner.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2),
            },
            ...teamMembers.map((member) => {
                const nameParts = member.email.split('@')[0].split('.');
                const initials = nameParts
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                return {
                    name: member.email.split('@')[0],
                    email: member.email,
                    role: member.role,
                    initials,
                    status: member.status,
                };
            }),
        ];

        sendSuccess(res, 'Team members retrieved successfully', { members });
    }
);

/**
 * Invite team member
 * POST /api/v1/team/invite
 */
export const inviteTeamMember = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { email, role } = req.body;

        if (!email || !role) {
            throw new AppError('Email and role are required', 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() === userId) {
            throw new AppError('You cannot invite yourself', 400);
        }

        // Check if already invited
        const existingInvite = await TeamMember.findOne({ userId, email });
        if (existingInvite) {
            throw new AppError('Team member already invited', 409);
        }

        const teamMember = await TeamMember.create({
            userId,
            email,
            role,
            invitedBy: userId,
            status: 'Pending',
        });

        sendSuccess(res, 'Team member invited successfully', { teamMember }, 201);
    }
);

/**
 * Remove team member
 * DELETE /api/v1/team/:id
 */
export const removeTeamMember = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        const teamMember = await TeamMember.findOneAndDelete({ _id: id, userId });

        if (!teamMember) {
            throw new AppError('Team member not found', 404);
        }

        sendSuccess(res, 'Team member removed successfully');
    }
);

