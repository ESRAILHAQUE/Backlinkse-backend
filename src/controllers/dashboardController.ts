import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { Order } from '../models/Order';
import { Activity } from '../models/Activity';

/**
 * Get dashboard statistics
 * GET /api/v1/dashboard/stats
 */
export const getDashboardStats = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        // Get total backlinks from orders
        const orders = await Order.find({ userId });
        const totalBacklinks = orders.reduce((sum, order) => sum + order.linksDelivered, 0);

        // Calculate average domain rating (mock calculation - in real app, this would come from actual backlink data)
        const avgDomainRating = 54; // This would be calculated from actual backlink data

        // Get active campaigns (orders in progress)
        const activeCampaigns = await Order.countDocuments({
            userId,
            status: { $in: ['Pending', 'In Progress'] },
        });

        // Calculate estimated traffic value (mock calculation)
        const estTrafficValue = totalBacklinks * 500; // Mock calculation

        // Get this month's backlinks
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const thisMonthOrders = await Order.find({
            userId,
            orderDate: { $gte: thisMonth },
        });
        const thisMonthBacklinks = thisMonthOrders.reduce(
            (sum, order) => sum + order.linksDelivered,
            0
        );

        // Get last month's backlinks for comparison
        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthOrders = await Order.find({
            userId,
            orderDate: { $gte: lastMonth, $lt: thisMonth },
        });
        const lastMonthBacklinks = lastMonthOrders.reduce(
            (sum, order) => sum + order.linksDelivered,
            0
        );

        const backlinksChange = lastMonthBacklinks > 0
            ? `+${thisMonthBacklinks - lastMonthBacklinks} this month`
            : `+${thisMonthBacklinks} this month`;

        sendSuccess(res, 'Dashboard stats retrieved successfully', {
            totalBacklinks,
            avgDomainRating,
            activeCampaigns,
            estTrafficValue: `$${(estTrafficValue / 1000).toFixed(1)}K`,
            backlinksChange,
        });
    }
);

/**
 * Get recent activity
 * GET /api/v1/dashboard/activity
 */
export const getRecentActivity = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        const activities = await Activity.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Format activities for frontend
        const formattedActivities = activities.map((activity) => {
            const timeAgo = getTimeAgo(activity.createdAt);
            return {
                action: activity.action,
                site: activity.site || '',
                dr: activity.domainRating || null,
                time: timeAgo,
            };
        });

        sendSuccess(res, 'Recent activity retrieved successfully', {
            activities: formattedActivities,
        });
    }
);

/**
 * Get campaign progress
 * GET /api/v1/dashboard/campaign-progress
 */
export const getCampaignProgress = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const userId = req.user!._id;

        // Get the most recent active order
        const activeOrder = await Order.findOne({
            userId,
            status: { $in: ['Pending', 'In Progress'] },
        })
            .sort({ orderDate: -1 })
            .lean();

        if (!activeOrder) {
            sendSuccess(res, 'No active campaign', {
                campaign: null,
            });
            return;
        }

        // Calculate next report date (mock - would be based on actual schedule)
        const nextReportDate = new Date();
        nextReportDate.setDate(15); // Next report on 15th of month

        sendSuccess(res, 'Campaign progress retrieved successfully', {
            campaign: {
                packageName: activeOrder.packageName,
                linksDelivered: activeOrder.linksDelivered,
                linksTotal: activeOrder.linksTotal,
                progress: Math.round((activeOrder.linksDelivered / activeOrder.linksTotal) * 100),
                remaining: activeOrder.linksTotal - activeOrder.linksDelivered,
                nextReportDate: nextReportDate.toISOString(),
            },
        });
    }
);

/**
 * Helper function to calculate time ago
 */
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
}

