import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import PricingPlan from '../models/PricingPlan';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

const DEFAULT_PLANS = [
    {
        name: 'Startup',
        price: 1500,
        linksPerMonth: '5-8',
        features: ['5-8 high-quality links/month', 'DR 30-50 websites', 'Monthly reporting', 'Email support'],
        popular: false,
        enabled: true,
        buttonText: 'Get Started',
        buttonLink: '/contact',
        sortOrder: 1,
    },
    {
        name: 'Pro',
        price: 3000,
        linksPerMonth: '10-15',
        features: [
            '10-15 high-quality links/month',
            'DR 40-60 websites',
            'Bi-weekly reporting',
            'Priority support',
            'Dedicated account manager',
        ],
        popular: true,
        enabled: true,
        buttonText: 'Get Started',
        buttonLink: '/contact',
        sortOrder: 2,
    },
    {
        name: 'Growth',
        price: 5000,
        linksPerMonth: '20-25',
        features: [
            '20-25 high-quality links/month',
            'DR 50-70 websites',
            'Weekly reporting',
            '24/7 support',
            'Dedicated team',
            'Custom strategy',
        ],
        popular: false,
        enabled: true,
        buttonText: 'Get Started',
        buttonLink: '/contact',
        sortOrder: 3,
    },
    {
        name: 'Enterprise',
        price: 10000,
        linksPerMonth: '50+',
        features: [
            '50+ high-quality links/month',
            'DR 60+ websites',
            'Real-time dashboard',
            'Dedicated team',
            'Custom everything',
            'SLA guarantee',
        ],
        popular: false,
        enabled: true,
        buttonText: 'Get Started',
        buttonLink: '/contact',
        sortOrder: 4,
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await PricingPlan.countDocuments();
    if (count === 0) {
        await PricingPlan.insertMany(DEFAULT_PLANS);
    }
}

export const getPublicPricing = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const plans = await PricingPlan.find({ enabled: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    sendSuccess(res, 'Pricing plans retrieved', { plans });
});

export const getAllPricing = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const plans = await PricingPlan.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean();
    sendSuccess(res, 'All pricing plans retrieved', { plans });
});

export const createPricing = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const plan = await PricingPlan.create({
        name: req.body.name,
        price: req.body.price,
        linksPerMonth: req.body.linksPerMonth,
        features: req.body.features || [],
        popular: req.body.popular ?? false,
        enabled: req.body.enabled ?? true,
        buttonText: req.body.buttonText || 'Get Started',
        buttonLink: req.body.buttonLink || '/contact',
        sortOrder: req.body.sortOrder ?? 0,
    });

    sendSuccess(res, 'Pricing plan created', { plan }, 201);
});

export const updatePricing = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const plan = await PricingPlan.findByIdAndUpdate(
        id,
        {
            ...(req.body.name !== undefined && { name: req.body.name }),
            ...(req.body.price !== undefined && { price: req.body.price }),
            ...(req.body.linksPerMonth !== undefined && { linksPerMonth: req.body.linksPerMonth }),
            ...(req.body.features !== undefined && { features: req.body.features }),
            ...(req.body.popular !== undefined && { popular: req.body.popular }),
            ...(req.body.enabled !== undefined && { enabled: req.body.enabled }),
            ...(req.body.buttonText !== undefined && { buttonText: req.body.buttonText }),
            ...(req.body.buttonLink !== undefined && { buttonLink: req.body.buttonLink }),
            ...(req.body.sortOrder !== undefined && { sortOrder: req.body.sortOrder }),
        },
        { new: true }
    );

    sendSuccess(res, 'Pricing plan updated', { plan });
});

export const deletePricing = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await PricingPlan.findByIdAndDelete(id);
    sendSuccess(res, 'Pricing plan deleted');
});

