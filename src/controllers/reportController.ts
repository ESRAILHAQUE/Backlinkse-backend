import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { Report } from '../models/Report';
import { Order } from '../models/Order';

/**
 * Get all reports for user
 * GET /api/v1/reports
 */
export const getAllReports = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        const reports = await Report.find({ userId }).sort({ reportDate: -1 }).lean();

        // Calculate stats
        const totalReports = reports.length;
        const linksThisYear = reports.reduce((sum, r) => sum + r.linksCount, 0);
        const avgMonthlyLinks = totalReports > 0 ? Math.round(linksThisYear / totalReports) : 0;

        sendSuccess(res, 'Reports retrieved successfully', {
            reports,
            stats: {
                totalReports,
                linksThisYear,
                avgMonthlyLinks,
            },
        });
    }
);

/**
 * Get single report by ID
 * GET /api/v1/reports/:id
 */
export const getReportById = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;

        const report = await Report.findOne({ _id: id, userId }).lean();

        if (!report) {
            throw new AppError('Report not found', 404);
        }

        sendSuccess(res, 'Report retrieved successfully', { report });
    }
);

/**
 * Create new report
 * POST /api/v1/reports
 */
export const createReport = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { name, type, reportDate, linksCount } = req.body;

        if (!name || !type || !reportDate) {
            throw new AppError('Name, type, and report date are required', 400);
        }

        // Calculate links count from orders if not provided
        let calculatedLinksCount = linksCount;
        if (!calculatedLinksCount) {
            const startDate = new Date(reportDate);
            const endDate = new Date(reportDate);
            if (type === 'Monthly') {
                endDate.setMonth(endDate.getMonth() + 1);
            } else if (type === 'Quarterly') {
                endDate.setMonth(endDate.getMonth() + 3);
            } else if (type === 'Yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }

            const orders = await Order.find({
                userId,
                orderDate: { $gte: startDate, $lt: endDate },
            });
            calculatedLinksCount = orders.reduce((sum, order) => sum + order.linksDelivered, 0);
        }

        const report = await Report.create({
            userId,
            name,
            type,
            reportDate: new Date(reportDate),
            linksCount: calculatedLinksCount || 0,
            status: 'In Progress',
        });

        sendSuccess(res, 'Report created successfully', { report }, 201);
    }
);

/**
 * Update report status
 * PATCH /api/v1/reports/:id
 */
export const updateReport = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;
        const { id } = req.params;
        const { status, fileUrl } = req.body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (fileUrl) updateData.fileUrl = fileUrl;

        const report = await Report.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        ).lean();

        if (!report) {
            throw new AppError('Report not found', 404);
        }

        sendSuccess(res, 'Report updated successfully', { report });
    }
);

