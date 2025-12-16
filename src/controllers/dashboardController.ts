import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { Order } from '../models/Order';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { SupportTicket } from '../models/SupportTicket';
import { Subscription } from '../models/Subscription';

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
 * Get admin dashboard statistics
 * GET /api/v1/dashboard/admin/stats
 */
export const getAdminDashboardStats = asyncHandler(
    async (_req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        // Get total users
        const totalUsers = await User.countDocuments({ isDeleted: false });

        // Get users this month vs last month for change calculation
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const usersThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonth }, isDeleted: false });
        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const usersLastMonth = await User.countDocuments({
            createdAt: { $gte: lastMonth, $lt: thisMonth },
            isDeleted: false,
        });
        const usersChange = usersLastMonth > 0
            ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1)
            : '0.0';
        const usersTrend = usersThisMonth >= usersLastMonth ? 'up' : 'down';

        // Get total orders
        const totalOrders = await Order.countDocuments();

        // Get orders this month vs last month
        const ordersThisMonth = await Order.countDocuments({ orderDate: { $gte: thisMonth } });
        const ordersLastMonth = await Order.countDocuments({ orderDate: { $gte: lastMonth, $lt: thisMonth } });
        const ordersChange = ordersLastMonth > 0
            ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1)
            : '0.0';
        const ordersTrend = ordersThisMonth >= ordersLastMonth ? 'up' : 'down';

        // Get active projects
        const activeProjects = await Project.countDocuments({ status: 'Active' });
        const projectsThisMonth = await Project.countDocuments({ createdAt: { $gte: thisMonth } });
        const projectsLastMonth = await Project.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } });
        const projectsChange = projectsLastMonth > 0
            ? ((projectsThisMonth - projectsLastMonth) / projectsLastMonth * 100).toFixed(1)
            : '0.0';
        const projectsTrend = projectsThisMonth >= projectsLastMonth ? 'up' : 'down';

        // Get support tickets (open + in progress)
        const openTickets = await SupportTicket.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
        const ticketsThisMonth = await SupportTicket.countDocuments({ createdAt: { $gte: thisMonth } });
        const ticketsLastMonth = await SupportTicket.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } });
        const ticketsChange = ticketsLastMonth > 0
            ? ((ticketsThisMonth - ticketsLastMonth) / ticketsLastMonth * 100).toFixed(1)
            : '0.0';
        const ticketsTrend = ticketsThisMonth >= ticketsLastMonth ? 'down' : 'up'; // Lower is better for tickets

        // Calculate monthly revenue from orders
        const ordersThisMonthData = await Order.find({ orderDate: { $gte: thisMonth } }).lean();
        const monthlyRevenue = ordersThisMonthData.reduce((sum, order) => sum + order.amount, 0);
        const ordersLastMonthData = await Order.find({ orderDate: { $gte: lastMonth, $lt: thisMonth } }).lean();
        const lastMonthRevenue = ordersLastMonthData.reduce((sum, order) => sum + order.amount, 0);
        const revenueChange = lastMonthRevenue > 0
            ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : '0.0';
        const revenueTrend = monthlyRevenue >= lastMonthRevenue ? 'up' : 'down';

        // Website traffic (mock - would come from analytics)
        const websiteTraffic = '45.2K';
        const trafficChange = '+18.7';
        const trafficTrend = 'up';

        sendSuccess(res, 'Admin dashboard stats retrieved successfully', {
            stats: {
                totalUsers: {
                    value: totalUsers.toString(),
                    change: `${usersTrend === 'up' ? '+' : ''}${usersChange}%`,
                    trend: usersTrend,
                },
                totalOrders: {
                    value: totalOrders.toString(),
                    change: `${ordersTrend === 'up' ? '+' : ''}${ordersChange}%`,
                    trend: ordersTrend,
                },
                activeProjects: {
                    value: activeProjects.toString(),
                    change: `${projectsTrend === 'up' ? '+' : ''}${projectsChange}%`,
                    trend: projectsTrend,
                },
                supportTickets: {
                    value: openTickets.toString(),
                    change: `${ticketsTrend === 'up' ? '+' : '-'}${Math.abs(parseFloat(ticketsChange))}%`,
                    trend: ticketsTrend,
                },
                monthlyRevenue: {
                    value: `$${(monthlyRevenue / 1000).toFixed(0)}K`,
                    change: `${revenueTrend === 'up' ? '+' : ''}${revenueChange}%`,
                    trend: revenueTrend,
                },
                websiteTraffic: {
                    value: websiteTraffic,
                    change: `${trafficChange}%`,
                    trend: trafficTrend,
                },
            },
        });
    }
);

/**
 * Get admin recent activity
 * GET /api/v1/dashboard/admin/activity
 */
export const getAdminRecentActivity = asyncHandler(
    async (_req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const activities: Array<{ action: string; user: string; time: string }> = [];

        // Get recent users (last 3)
        const recentUsers = await User.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
        recentUsers.forEach((user) => {
            activities.push({
                action: 'New user registered',
                user: user.email,
                time: getTimeAgo(user.createdAt),
            });
        });

        // Get recent orders (last 3)
        const recentOrders = await Order.find()
            .sort({ orderDate: -1 })
            .limit(3)
            .lean();
        recentOrders.forEach((order) => {
            activities.push({
                action: `Order #${order.orderNumber} placed`,
                user: order.packageName,
                time: getTimeAgo(order.orderDate),
            });
        });

        // Get recent support tickets (last 3)
        const recentTickets = await SupportTicket.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('userId', 'email')
            .lean();
        recentTickets.forEach((ticket) => {
            const userEmail = (ticket.userId as any)?.email || 'Unknown';
            activities.push({
                action: 'Support ticket opened',
                user: userEmail,
                time: getTimeAgo(ticket.createdAt),
            });
        });

        // Get recent subscriptions (last 2)
        const recentSubscriptions = await Subscription.find()
            .sort({ createdAt: -1 })
            .limit(2)
            .populate('userId', 'email')
            .lean();
        recentSubscriptions.forEach((sub) => {
            const userEmail = (sub.userId as any)?.email || 'Unknown';
            activities.push({
                action: 'New subscription',
                user: userEmail,
                time: getTimeAgo(sub.createdAt),
            });
        });

        // Activities are already sorted by query (newest first), just limit to 6

        sendSuccess(res, 'Admin recent activity retrieved successfully', {
            activities: activities.slice(0, 6),
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

