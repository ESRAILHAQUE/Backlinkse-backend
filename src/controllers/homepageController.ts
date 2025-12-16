import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import HomepageSection from '../models/HomepageSection';
import { sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const DEFAULT_SECTIONS = [
    {
        sectionId: 'client-logos',
        name: 'Trusted by 500+ Companies',
        enabled: true,
        sortOrder: 1,
        content: {
            heading: 'Trusted by 500+ Companies Worldwide',
            logos: [],
        },
    },
    {
        sectionId: 'intro',
        name: 'We Build Authoritative Backlinks',
        enabled: true,
        sortOrder: 2,
        content: {
            badge: 'Welcome to Backlinkse',
            mainHeading: 'We build authoritative backlinks that',
            highlightedText: 'boost rankings and organic traffic',
            description:
                'Using a process-driven approach with a cutting-edge link building strategy, our link building services significantly improve your search engine rankings and SEO performance.',
            sectionImage: '',
        },
    },
    {
        sectionId: 'results',
        name: 'We Get Results',
        enabled: true,
        sortOrder: 3,
        content: {
            sectionLabel: 'Case Studies',
            mainHeading: 'We get',
            highlightedWord: 'results',
            featuredCaseStudies: ['Career Guidance Service', 'Employee Relocation', 'Online Courses', 'Snack Delivery'],
        },
    },
    {
        sectionId: 'pricing',
        name: 'Our Link Building Pricing',
        enabled: true,
        sortOrder: 4,
        content: {
            heading: 'Our Link Building Pricing',
            description:
                'Choose a plan that fits your growth goals. All plans include white-hat link building with transparent reporting.',
        },
    },
    {
        sectionId: 'testimonials',
        name: 'Client Testimonials',
        enabled: true,
        sortOrder: 5,
        content: {},
    },
    {
        sectionId: 'comparison',
        name: 'Why Choose Backlinkse',
        enabled: true,
        sortOrder: 6,
        content: {
            sectionLabel: 'Us vs. Competitors',
            mainHeading: 'Why choose Backlinkse?',
            features: ['Strategist', 'Analysis', 'Sustainable', 'Relationships', 'Big Scale'],
        },
    },
    {
        sectionId: 'faq',
        name: 'FAQs',
        enabled: true,
        sortOrder: 7,
        content: {},
    },
    {
        sectionId: 'cta',
        name: 'Ready to Build Your Authority',
        enabled: true,
        sortOrder: 8,
        content: {
            heading: 'Ready to Build Your Authority?',
            description: 'Join 500+ businesses that trust us to build their online authority through strategic link building.',
            primaryButtonText: 'Get Started Today',
            primaryButtonLink: '/contact',
            secondaryButtonText: 'Book a Call',
            secondaryButtonLink: 'https://calendly.com/backlinkse',
        },
    },
];

async function ensureSeeded(): Promise<void> {
    const count = await HomepageSection.countDocuments();
    if (count === 0) {
        await HomepageSection.insertMany(DEFAULT_SECTIONS);
    }
}

export const getPublicHomepageSections = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await ensureSeeded();
    const sections = await HomepageSection.find({ enabled: true })
        .sort({ sortOrder: 1 })
        .lean();
    sendSuccess(res, 'Homepage sections retrieved', { sections });
});

export const getAllHomepageSections = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    await ensureSeeded();
    const sections = await HomepageSection.find({})
        .sort({ sortOrder: 1 })
        .lean();
    sendSuccess(res, 'All homepage sections retrieved', { sections });
});

export const getHomepageSectionById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const section = await HomepageSection.findOne({ $or: [{ _id: id }, { sectionId: id }] }).lean();

    if (!section) {
        throw new AppError('Homepage section not found', 404);
    }

    sendSuccess(res, 'Homepage section retrieved', { section });
});

export const createHomepageSection = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const section = await HomepageSection.create({
        sectionId: req.body.sectionId,
        name: req.body.name,
        enabled: req.body.enabled !== undefined ? req.body.enabled : true,
        sortOrder: req.body.sortOrder ?? 0,
        content: req.body.content || {},
    });

    sendSuccess(res, 'Homepage section created', { section }, 201);
});

export const updateHomepageSection = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.sectionId !== undefined) updateData.sectionId = req.body.sectionId;
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.enabled !== undefined) updateData.enabled = req.body.enabled;
    if (req.body.sortOrder !== undefined) updateData.sortOrder = req.body.sortOrder;
    if (req.body.content !== undefined) updateData.content = req.body.content;

    const section = await HomepageSection.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!section) {
        throw new AppError('Homepage section not found', 404);
    }

    sendSuccess(res, 'Homepage section updated', { section });
});

export const deleteHomepageSection = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const section = await HomepageSection.findByIdAndDelete(id);

    if (!section) {
        throw new AppError('Homepage section not found', 404);
    }

    sendSuccess(res, 'Homepage section deleted');
});

