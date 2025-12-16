import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Testimonial from '../models/Testimonial';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const DEFAULT_TESTIMONIALS = [
    {
        name: 'Sarah Johnson',
        role: 'Marketing Director',
        company: 'TechStart Inc.',
        quote: 'Backlinkse transformed our SEO strategy. We saw a 340% increase in organic traffic within 6 months.',
        rating: 5,
        visible: true,
        status: 'published' as const,
        sortOrder: 1,
    },
    {
        name: 'Michael Chen',
        role: 'CEO',
        company: 'GrowthLabs',
        quote: 'The quality of backlinks they deliver is exceptional. Our domain authority increased from 25 to 52.',
        rating: 5,
        visible: true,
        status: 'published' as const,
        sortOrder: 2,
    },
    {
        name: 'Emily Davis',
        role: 'Head of Digital',
        company: 'E-Commerce Plus',
        quote: 'Professional team, transparent reporting, and real results. Highly recommend their services.',
        rating: 5,
        visible: true,
        status: 'published' as const,
        sortOrder: 3,
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await Testimonial.countDocuments();
    if (count === 0) {
        await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
    }
}

export const getPublicTestimonials = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const testimonials = await Testimonial.find({ visible: true, status: 'published' })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'Testimonials retrieved', { testimonials });
});

export const getAllTestimonials = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const testimonials = await Testimonial.find({})
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'All testimonials retrieved', { testimonials });
});

export const getTestimonialById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id).lean();

    if (!testimonial) {
        throw new AppError('Testimonial not found', 404);
    }

    sendSuccess(res, 'Testimonial retrieved', { testimonial });
});

export const createTestimonial = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const testimonial = await Testimonial.create({
        name: req.body.name,
        role: req.body.role,
        company: req.body.company,
        quote: req.body.quote,
        rating: req.body.rating || 5,
        photo: req.body.photo,
        visible: req.body.visible !== undefined ? req.body.visible : true,
        status: req.body.status || 'published',
        sortOrder: req.body.sortOrder ?? 0,
    });

    sendSuccess(res, 'Testimonial created', { testimonial }, 201);
});

export const updateTestimonial = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.role !== undefined) updateData.role = req.body.role;
    if (req.body.company !== undefined) updateData.company = req.body.company;
    if (req.body.quote !== undefined) updateData.quote = req.body.quote;
    if (req.body.rating !== undefined) updateData.rating = req.body.rating;
    if (req.body.photo !== undefined) updateData.photo = req.body.photo;
    if (req.body.visible !== undefined) updateData.visible = req.body.visible;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.sortOrder !== undefined) updateData.sortOrder = req.body.sortOrder;

    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!testimonial) {
        throw new AppError('Testimonial not found', 404);
    }

    sendSuccess(res, 'Testimonial updated', { testimonial });
});

export const deleteTestimonial = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
        throw new AppError('Testimonial not found', 404);
    }

    sendSuccess(res, 'Testimonial deleted');
});

