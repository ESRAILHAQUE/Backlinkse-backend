import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { SupportTicket } from '../models/SupportTicket';

/**
 * Generate unique ticket number
 */
function generateTicketNumber(): string {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TKT-${random}`;
}

/**
 * Get all support tickets for user
 * GET /api/v1/support
 */
export const getAllTickets = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        const tickets = await SupportTicket.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        sendSuccess(res, 'Support tickets retrieved successfully', { tickets });
    }
);

/**
 * Get single ticket by ID
 * GET /api/v1/support/:id
 */
export const getTicketById = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        const ticket = await SupportTicket.findOne({ _id: id, userId }).lean();

        if (!ticket) {
            throw new AppError('Support ticket not found', 404);
        }

        sendSuccess(res, 'Support ticket retrieved successfully', { ticket });
    }
);

/**
 * Create new support ticket
 * POST /api/v1/support
 */
export const createTicket = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { subject, category, priority, message } = req.body;

        if (!subject || !category || !message) {
            throw new AppError('Subject, category, and message are required', 400);
        }

        // Generate unique ticket number
        let ticketNumber = generateTicketNumber();
        let exists = await SupportTicket.findOne({ ticketNumber });
        while (exists) {
            ticketNumber = generateTicketNumber();
            exists = await SupportTicket.findOne({ ticketNumber });
        }

        const ticket = await SupportTicket.create({
            userId,
            ticketNumber,
            subject,
            category,
            priority: priority || 'Medium',
            message,
            status: 'Open',
        });

        sendSuccess(res, 'Support ticket created successfully', { ticket }, 201);
    }
);

/**
 * Update support ticket
 * PATCH /api/v1/support/:id
 */
export const updateTicket = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;
        const { status, priority } = req.body;

        const updateData: any = {
            lastUpdate: new Date(),
        };
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;

        const ticket = await SupportTicket.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        ).lean();

        if (!ticket) {
            throw new AppError('Support ticket not found', 404);
        }

        sendSuccess(res, 'Support ticket updated successfully', { ticket });
    }
);

