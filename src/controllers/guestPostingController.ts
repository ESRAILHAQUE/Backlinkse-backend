import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import GuestPostingPackage from '../models/GuestPostingPackage';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

const DEFAULT_PACKAGES = [
    {
        name: 'Basic',
        price: 299,
        description: 'Per post placement',
        features: [
            'DR 30-40 websites',
            '500+ word article',
            '1 dofollow link',
            'Industry relevant sites',
            'Published within 14 days',
        ],
        icon: 'FileText',
        popular: false,
        enabled: true,
        sortOrder: 1,
    },
    {
        name: 'Premium',
        price: 599,
        description: 'Per post placement',
        features: [
            'DR 50-60 websites',
            '1000+ word article',
            '2 dofollow links',
            'High-traffic sites',
            'Published within 7 days',
            'Social media promotion',
        ],
        icon: 'Globe',
        popular: false,
        enabled: true,
        sortOrder: 2,
    },
    {
        name: 'Authority',
        price: 999,
        description: 'Per post placement',
        features: [
            'DR 70+ websites',
            '1500+ word article',
            '3 dofollow links',
            'Top-tier publications',
            'Published within 5 days',
            'Guaranteed indexing',
            'Press release distribution',
        ],
        icon: 'Zap',
        popular: false,
        enabled: true,
        sortOrder: 3,
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await GuestPostingPackage.countDocuments();
    if (count === 0) {
        await GuestPostingPackage.insertMany(DEFAULT_PACKAGES);
    }
}

export const getPublicPackages = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const packages = await GuestPostingPackage.find({ enabled: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'Guest posting packages retrieved', { packages });
});

export const getAllPackages = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const packages = await GuestPostingPackage.find({})
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'All guest posting packages retrieved', { packages });
});

export const createPackage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const pkg = await GuestPostingPackage.create({
        name: req.body.name,
        price: req.body.price === 'Custom' || req.body.price === null ? null : req.body.price,
        description: req.body.description,
        features: req.body.features || [],
        icon: req.body.icon || 'FileText',
        popular: req.body.popular ?? false,
        enabled: req.body.enabled ?? true,
        sortOrder: req.body.sortOrder ?? 0,
    });

    sendSuccess(res, 'Guest posting package created', { package: pkg }, 201);
});

export const updatePackage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const pkg = await GuestPostingPackage.findByIdAndUpdate(
        id,
        {
            ...(req.body.name !== undefined && { name: req.body.name }),
            ...(req.body.price !== undefined && {
                price: req.body.price === 'Custom' || req.body.price === null ? null : req.body.price,
            }),
            ...(req.body.description !== undefined && { description: req.body.description }),
            ...(req.body.features !== undefined && { features: req.body.features }),
            ...(req.body.icon !== undefined && { icon: req.body.icon }),
            ...(req.body.popular !== undefined && { popular: req.body.popular }),
            ...(req.body.enabled !== undefined && { enabled: req.body.enabled }),
            ...(req.body.sortOrder !== undefined && { sortOrder: req.body.sortOrder }),
        },
        { new: true }
    );

    if (!pkg) {
        throw new AppError('Package not found', 404);
    }

    sendSuccess(res, 'Guest posting package updated', { package: pkg });
});

export const deletePackage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const pkg = await GuestPostingPackage.findByIdAndDelete(id);

    if (!pkg) {
        throw new AppError('Package not found', 404);
    }

    sendSuccess(res, 'Guest posting package deleted');
});

