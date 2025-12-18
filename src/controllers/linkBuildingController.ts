import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import LinkBuildingPackage from '../models/LinkBuildingPackage';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

const DEFAULT_PACKAGES = [
    {
        name: 'Starter',
        price: 1500,
        linksPerMonth: '5 links/month',
        features: ['DR 30-50 websites', 'Natural anchor text', 'Monthly reporting', '30-day replacement guarantee'],
        popular: false,
        enabled: true,
        sortOrder: 1,
    },
    {
        name: 'Growth',
        price: 3500,
        linksPerMonth: '12 links/month',
        features: [
            'DR 40-60 websites',
            'Custom anchor strategy',
            'Bi-weekly reporting',
            '60-day replacement guarantee',
            'Priority support',
        ],
        popular: true,
        enabled: true,
        sortOrder: 2,
    },
    {
        name: 'Scale',
        price: 7000,
        linksPerMonth: '25 links/month',
        features: [
            'DR 50-70 websites',
            'Full SEO strategy',
            'Weekly reporting',
            '90-day replacement guarantee',
            'Dedicated account manager',
            'Content optimization',
        ],
        popular: false,
        enabled: true,
        sortOrder: 3,
    },
    {
        name: 'Enterprise',
        price: null, // null means "Custom"
        linksPerMonth: '50+ links/month',
        features: [
            'DR 60+ websites',
            'White-label reporting',
            'Real-time dashboard',
            'Lifetime guarantee',
            '24/7 priority support',
            'Custom integrations',
        ],
        popular: false,
        enabled: true,
        sortOrder: 4,
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await LinkBuildingPackage.countDocuments();
    if (count === 0) {
        await LinkBuildingPackage.insertMany(DEFAULT_PACKAGES);
    }
}

export const getPublicPackages = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const packages = await LinkBuildingPackage.find({ enabled: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'Link building packages retrieved', { packages });
});

export const getAllPackages = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const packages = await LinkBuildingPackage.find({})
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'All link building packages retrieved', { packages });
});

export const createPackage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const pkg = await LinkBuildingPackage.create({
        name: req.body.name,
        price: req.body.price === 'Custom' || req.body.price === null ? null : req.body.price,
        linksPerMonth: req.body.linksPerMonth,
        features: req.body.features || [],
        popular: req.body.popular ?? false,
        enabled: req.body.enabled ?? true,
        sortOrder: req.body.sortOrder ?? 0,
    });

    sendSuccess(res, 'Link building package created', { package: pkg }, 201);
});

export const updatePackage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const pkg = await LinkBuildingPackage.findByIdAndUpdate(
        id,
        {
            ...(req.body.name !== undefined && { name: req.body.name }),
            ...(req.body.price !== undefined && {
                price: req.body.price === 'Custom' || req.body.price === null ? null : req.body.price,
            }),
            ...(req.body.linksPerMonth !== undefined && { linksPerMonth: req.body.linksPerMonth }),
            ...(req.body.features !== undefined && { features: req.body.features }),
            ...(req.body.popular !== undefined && { popular: req.body.popular }),
            ...(req.body.enabled !== undefined && { enabled: req.body.enabled }),
            ...(req.body.sortOrder !== undefined && { sortOrder: req.body.sortOrder }),
        },
        { new: true }
    );

    if (!pkg) {
        throw new AppError('Package not found', 404);
    }

    sendSuccess(res, 'Link building package updated', { package: pkg });
});

export const deletePackage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const pkg = await LinkBuildingPackage.findByIdAndDelete(id);

    if (!pkg) {
        throw new AppError('Package not found', 404);
    }

    sendSuccess(res, 'Link building package deleted');
});

