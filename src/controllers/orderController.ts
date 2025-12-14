import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { Order } from '../models/Order';
import { Activity } from '../models/Activity';

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${year}-${random}`;
}

/**
 * Get all orders for user
 * GET /api/v1/orders
 */
export const getAllOrders = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        const orders = await Order.find({ userId }).sort({ orderDate: -1 }).lean();

        sendSuccess(res, 'Orders retrieved successfully', { orders });
    }
);

/**
 * Get single order by ID
 * GET /api/v1/orders/:id
 */
export const getOrderById = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, userId }).lean();

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        sendSuccess(res, 'Order retrieved successfully', { order });
    }
);

/**
 * Create new order
 * POST /api/v1/orders
 */
export const createOrder = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { packageName, packageType, linksTotal, amount, currency } = req.body;

        if (!packageName || !packageType || !linksTotal || !amount) {
            throw new AppError('Package name, type, links total, and amount are required', 400);
        }

        // Generate unique order number
        let orderNumber = generateOrderNumber();
        let exists = await Order.findOne({ orderNumber });
        while (exists) {
            orderNumber = generateOrderNumber();
            exists = await Order.findOne({ orderNumber });
        }

        const order = await Order.create({
            userId,
            orderNumber,
            packageName,
            packageType,
            linksTotal,
            amount,
            currency: currency || 'USD',
            status: 'Pending',
        });

        // Create activity
        await Activity.create({
            userId,
            action: 'New order placed',
            site: packageName,
            orderId: order._id,
        });

        sendSuccess(res, 'Order created successfully', { order }, 201);
    }
);

/**
 * Update order
 * PATCH /api/v1/orders/:id
 */
export const updateOrder = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;
        const { status, linksDelivered } = req.body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (linksDelivered !== undefined) updateData.linksDelivered = linksDelivered;
        if (status === 'Completed') updateData.completedDate = new Date();

        const order = await Order.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        ).lean();

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Create activity if links were delivered
        if (linksDelivered !== undefined) {
            await Activity.create({
                userId,
                action: 'Order updated',
                site: order.packageName,
                orderId: order._id,
            });
        }

        sendSuccess(res, 'Order updated successfully', { order });
    }
);

