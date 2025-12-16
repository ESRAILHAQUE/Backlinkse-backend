import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import FAQ from '../models/FAQ';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const DEFAULT_FAQS = [
    {
        question: 'What types of backlinks do you build?',
        answer: 'We focus on high-quality, white-hat backlinks from authoritative websites...',
        visible: true,
        status: 'published' as const,
        sortOrder: 1,
    },
    {
        question: 'How long until I see results?',
        answer: 'Most clients start seeing improvements in rankings within 2-3 months...',
        visible: true,
        status: 'published' as const,
        sortOrder: 2,
    },
    {
        question: 'Do you offer refunds?',
        answer: "Yes, we offer a satisfaction guarantee. If you're not happy with our service...",
        visible: true,
        status: 'published' as const,
        sortOrder: 3,
    },
    {
        question: 'How Do We Communicate?',
        answer:
            "You can message our team 24/7 and you'll receive a same-day reply. Clients may also book a call anytime. We schedule regular meetings to review strategy and planning. You will receive a monthly update covering every backlink built and key insights related to your SEO goals.",
        visible: true,
        status: 'published' as const,
        sortOrder: 4,
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await FAQ.countDocuments();
    if (count === 0) {
        await FAQ.insertMany(DEFAULT_FAQS);
    }
}

export const getPublicFAQs = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const faqs = await FAQ.find({ visible: true, status: 'published' })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'FAQs retrieved', { faqs });
});

export const getAllFAQs = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const faqs = await FAQ.find({})
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    sendSuccess(res, 'All FAQs retrieved', { faqs });
});

export const getFAQById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const faq = await FAQ.findById(id).lean();

    if (!faq) {
        throw new AppError('FAQ not found', 404);
    }

    sendSuccess(res, 'FAQ retrieved', { faq });
});

export const createFAQ = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const faq = await FAQ.create({
        question: req.body.question,
        answer: req.body.answer,
        visible: req.body.visible !== undefined ? req.body.visible : true,
        status: req.body.status || 'published',
        sortOrder: req.body.sortOrder ?? 0,
    });

    sendSuccess(res, 'FAQ created', { faq }, 201);
});

export const updateFAQ = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.question !== undefined) updateData.question = req.body.question;
    if (req.body.answer !== undefined) updateData.answer = req.body.answer;
    if (req.body.visible !== undefined) updateData.visible = req.body.visible;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.sortOrder !== undefined) updateData.sortOrder = req.body.sortOrder;

    const faq = await FAQ.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!faq) {
        throw new AppError('FAQ not found', 404);
    }

    sendSuccess(res, 'FAQ updated', { faq });
});

export const deleteFAQ = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
        throw new AppError('FAQ not found', 404);
    }

    sendSuccess(res, 'FAQ deleted');
});

