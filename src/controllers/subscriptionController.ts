import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { Subscription } from '../models/Subscription';

/**
 * Get current subscription
 * GET /api/v1/subscriptions/current
 */
export const getCurrentSubscription = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        const subscription = await Subscription.findOne({
            userId,
            status: 'Active',
        })
            .sort({ createdAt: -1 })
            .lean();

        if (!subscription) {
            sendSuccess(res, 'No active subscription', { subscription: null });
            return;
        }

        sendSuccess(res, 'Current subscription retrieved successfully', { subscription });
    }
);

/**
 * Get all subscriptions for user
 * GET /api/v1/subscriptions
 */
export const getAllSubscriptions = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 }).lean();

        sendSuccess(res, 'Subscriptions retrieved successfully', { subscriptions });
    }
);

/**
 * Get all subscriptions (Admin only - all users)
 * GET /api/v1/subscriptions/admin/all
 */
export const getAllSubscriptionsAdmin = asyncHandler(
    async (_req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const subscriptions = await Subscription.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        sendSuccess(res, 'All subscriptions retrieved successfully', { subscriptions });
    }
);

/**
 * Create or update subscription
 * POST /api/v1/subscriptions
 */
export const createSubscription = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { planName, price, billingCycle } = req.body;

        if (!planName || !price || !billingCycle) {
            throw new AppError('Plan name, price, and billing cycle are required', 400);
        }

        // Cancel existing active subscription
        await Subscription.updateMany(
            { userId, status: 'Active' },
            { status: 'Cancelled', cancelledAt: new Date() }
        );

        // Calculate next billing date
        const nextBillingDate = new Date();
        if (billingCycle === 'Monthly') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else if (billingCycle === 'Quarterly') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        } else if (billingCycle === 'Yearly') {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        const subscription = await Subscription.create({
            userId,
            planName,
            price,
            billingCycle,
            nextBillingDate,
            status: 'Active',
        });

        sendSuccess(res, 'Subscription created successfully', { subscription }, 201);
    }
);

/**
 * Cancel subscription
 * PATCH /api/v1/subscriptions/:id/cancel
 */
export const cancelSubscription = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        const subscription = await Subscription.findOneAndUpdate(
            { _id: id, userId, status: 'Active' },
            { status: 'Cancelled', cancelledAt: new Date() },
            { new: true }
        ).lean();

        if (!subscription) {
            throw new AppError('Active subscription not found', 404);
        }

        sendSuccess(res, 'Subscription cancelled successfully', { subscription });
    }
);

/**
 * Cancel subscription (Admin - can cancel any subscription)
 * PATCH /api/v1/subscriptions/:id/cancel-admin
 */
export const cancelSubscriptionAdmin = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const subscription = await Subscription.findByIdAndUpdate(
            id,
            { status: 'Cancelled', cancelledAt: new Date() },
            { new: true }
        ).lean();

        if (!subscription) {
            throw new AppError('Subscription not found', 404);
        }

        sendSuccess(res, 'Subscription cancelled successfully', { subscription });
    }
);

