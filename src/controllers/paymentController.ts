import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { PaymentMethod } from '../models/PaymentMethod';

/**
 * Get all payment methods for user
 * GET /api/v1/payment
 */
export const getAllPaymentMethods = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        const paymentMethods = await PaymentMethod.find({ userId }).sort({ isDefault: -1 }).lean();

        sendSuccess(res, 'Payment methods retrieved successfully', { paymentMethods });
    }
);

/**
 * Add payment method
 * POST /api/v1/payment
 */
export const addPaymentMethod = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { type, last4, expiryMonth, expiryYear, isDefault } = req.body;

        if (!type || !last4 || !expiryMonth || !expiryYear) {
            throw new AppError('Type, last4, expiryMonth, and expiryYear are required', 400);
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await PaymentMethod.updateMany({ userId, isDefault: true }, { isDefault: false });
        }

        const paymentMethod = await PaymentMethod.create({
            userId,
            type,
            last4,
            expiryMonth,
            expiryYear,
            isDefault: isDefault || false,
        });

        sendSuccess(res, 'Payment method added successfully', { paymentMethod }, 201);
    }
);

/**
 * Set default payment method
 * PATCH /api/v1/payment/:id/set-default
 */
export const setDefaultPaymentMethod = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        // Unset all other defaults
        await PaymentMethod.updateMany({ userId, isDefault: true }, { isDefault: false });

        // Set this one as default
        const paymentMethod = await PaymentMethod.findOneAndUpdate(
            { _id: id, userId },
            { isDefault: true },
            { new: true }
        ).lean();

        if (!paymentMethod) {
            throw new AppError('Payment method not found', 404);
        }

        sendSuccess(res, 'Default payment method updated successfully', { paymentMethod });
    }
);

/**
 * Delete payment method
 * DELETE /api/v1/payment/:id
 */
export const deletePaymentMethod = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        const paymentMethod = await PaymentMethod.findOneAndDelete({ _id: id, userId });

        if (!paymentMethod) {
            throw new AppError('Payment method not found', 404);
        }

        sendSuccess(res, 'Payment method deleted successfully');
    }
);

