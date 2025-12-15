import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Service, { ServicePackage } from '../models/Service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const DEFAULT_SERVICES = [
    {
        serviceId: 'link-building',
        name: 'Monthly Link Building Packages',
        slug: '/services/link-building',
        description: 'Build high-quality backlinks from authoritative websites in your niche. Our white-hat link building strategies help improve your search rankings.',
        icon: 'Link2',
        status: 'published' as const,
        packages: [
            { name: 'Starter', price: 499 },
            { name: 'Professional', price: 999 },
            { name: 'Enterprise', price: 1999 },
            { name: 'Custom', price: 0 },
        ] as ServicePackage[],
        sortOrder: 1,
    },
    {
        serviceId: 'guest-posting',
        name: 'Guest Posting Packages',
        slug: '/services/guest-posting',
        description: 'Get featured on high-authority websites in your industry through quality guest posts that build your brand and backlinks.',
        icon: 'FileText',
        status: 'published' as const,
        packages: [
            { name: 'Starter', price: 299 },
            { name: 'Professional', price: 699 },
            { name: 'Enterprise', price: 1499 },
        ] as ServicePackage[],
        sortOrder: 2,
    },
    {
        serviceId: 'seo-blog-writing',
        name: 'SEO Blog Writing Services',
        slug: '/services/seo-blog-writing',
        description: 'Professional SEO-optimized blog content that ranks well and drives organic traffic to your website.',
        icon: 'PenTool',
        status: 'published' as const,
        packages: [
            { name: 'Starter', price: 199 },
            { name: 'Professional', price: 499 },
            { name: 'Enterprise', price: 999 },
        ] as ServicePackage[],
        sortOrder: 3,
    },
    {
        serviceId: 'link-insertions',
        name: 'Link Insertions',
        slug: '/services/link-insertions',
        description: 'Insert contextual backlinks into existing high-quality content on authoritative websites.',
        icon: 'Package',
        status: 'published' as const,
        packages: [
            { name: 'Starter', price: 149 },
            { name: 'Professional', price: 399 },
            { name: 'Enterprise', price: 799 },
        ] as ServicePackage[],
        sortOrder: 4,
    },
    {
        serviceId: 'platinum-links',
        name: 'Platinum Links',
        slug: '/services/platinum-links',
        description: 'Premium backlinks from the most authoritative websites in your industry for maximum SEO impact.',
        icon: 'Award',
        status: 'published' as const,
        packages: [
            { name: 'Starter', price: 599 },
            { name: 'Professional', price: 1299 },
            { name: 'Enterprise', price: 2499 },
        ] as ServicePackage[],
        sortOrder: 5,
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await Service.countDocuments();
    if (count === 0) {
        await Service.insertMany(DEFAULT_SERVICES);
    }
}

export const getPublicServices = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const services = await Service.find({ status: 'published' })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'Services retrieved', { services });
});

export const getAllServices = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const services = await Service.find({})
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'All services retrieved', { services });
});

export const getServiceById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const service = await Service.findOne({ $or: [{ _id: id }, { serviceId: id }] }).lean();

    if (!service) {
        throw new AppError('Service not found', 404);
    }

    sendSuccess(res, 'Service retrieved', { service });
});

export const createService = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const service = await Service.create({
        serviceId: req.body.serviceId,
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        icon: req.body.icon || 'Package',
        status: req.body.status || 'published',
        packages: req.body.packages || [],
        sortOrder: req.body.sortOrder ?? 0,
    });

    sendSuccess(res, 'Service created', { service }, 201);
});

export const updateService = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.serviceId !== undefined) updateData.serviceId = req.body.serviceId;
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.slug !== undefined) updateData.slug = req.body.slug;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.icon !== undefined) updateData.icon = req.body.icon;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.packages !== undefined) updateData.packages = req.body.packages;
    if (req.body.sortOrder !== undefined) updateData.sortOrder = req.body.sortOrder;

    const service = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!service) {
        throw new AppError('Service not found', 404);
    }

    sendSuccess(res, 'Service updated', { service });
});

export const deleteService = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);

    if (!service) {
        throw new AppError('Service not found', 404);
    }

    sendSuccess(res, 'Service deleted');
});

