import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { Navigation, INavigation } from '../models/Navigation';

/**
 * Get active navigation
 * GET /api/v1/navigation
 */
export const getActiveNavigation = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
        let navigation = await Navigation.findOne({ isActive: true }).lean();

        // If no navigation exists, create a default one
        if (!navigation) {
            await ensureSeeded();
            navigation = await Navigation.findOne({ isActive: true }).lean();
        }

        if (!navigation) {
            throw new AppError('Navigation not found', 404);
        }

        sendSuccess(res, 'Active navigation retrieved successfully', { navigation });
    }
);

/**
 * Get all navigations (Admin only)
 * GET /api/v1/navigation/admin/all
 */
export const getAllNavigations = asyncHandler(
    async (_req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const navigations = await Navigation.find({}).sort({ createdAt: -1 }).lean();

        sendSuccess(res, 'All navigations retrieved successfully', { navigations });
    }
);

/**
 * Get navigation by ID
 * GET /api/v1/navigation/admin/:id
 */
export const getNavigationById = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const navigation = await Navigation.findById(id).lean();

        if (!navigation) {
            throw new AppError('Navigation not found', 404);
        }

        sendSuccess(res, 'Navigation retrieved successfully', { navigation });
    }
);

/**
 * Create new navigation
 * POST /api/v1/navigation/admin
 */
export const createNavigation = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const {
            headerLinks,
            loginButton,
            signUpButton,
            dashboardButton,
            footerSections,
            contactEmail,
            whatsappNumber,
            twitterUrl,
            linkedInUrl,
            isActive,
        } = req.body;

        // If setting this navigation as active, deactivate all others
        if (isActive) {
            await Navigation.updateMany({ isActive: true }, { isActive: false });
        }

        const navigation = await Navigation.create({
            headerLinks: headerLinks || [],
            loginButton: loginButton || { text: 'Log In', href: '/login', visible: true },
            signUpButton: signUpButton || { text: 'Sign Up', href: '/signup', visible: true },
            dashboardButton:
                dashboardButton || { text: 'Dashboard', href: '/dashboard', visible: true, showWhenLoggedIn: true },
            footerSections: footerSections || [],
            contactEmail: contactEmail || '',
            whatsappNumber: whatsappNumber || '',
            twitterUrl: twitterUrl || '',
            linkedInUrl: linkedInUrl || '',
            isActive: isActive ?? false,
        });

        sendSuccess(res, 'Navigation created successfully', { navigation }, 201);
    }
);

/**
 * Update navigation
 * PATCH /api/v1/navigation/admin/:id
 */
export const updateNavigation = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const {
            headerLinks,
            loginButton,
            signUpButton,
            dashboardButton,
            footerSections,
            contactEmail,
            whatsappNumber,
            twitterUrl,
            linkedInUrl,
            isActive,
        } = req.body;

        const updateData: Partial<INavigation> = {};
        if (Array.isArray(headerLinks)) updateData.headerLinks = headerLinks;
        if (loginButton) updateData.loginButton = loginButton;
        if (signUpButton) updateData.signUpButton = signUpButton;
        if (dashboardButton) updateData.dashboardButton = dashboardButton;
        if (Array.isArray(footerSections)) updateData.footerSections = footerSections;
        if (typeof contactEmail === 'string') updateData.contactEmail = contactEmail;
        if (typeof whatsappNumber === 'string') updateData.whatsappNumber = whatsappNumber;
        if (typeof twitterUrl === 'string') updateData.twitterUrl = twitterUrl;
        if (typeof linkedInUrl === 'string') updateData.linkedInUrl = linkedInUrl;
        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive;
            // If setting this navigation as active, deactivate all others
            if (isActive) {
                await Navigation.updateMany({ _id: { $ne: id }, isActive: true }, { isActive: false });
            }
        }

        const navigation = await Navigation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();

        if (!navigation) {
            throw new AppError('Navigation not found', 404);
        }

        sendSuccess(res, 'Navigation updated successfully', { navigation });
    }
);

/**
 * Update active navigation (simplified endpoint)
 * PATCH /api/v1/navigation
 */
export const updateActiveNavigation = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const {
            headerLinks,
            loginButton,
            signUpButton,
            dashboardButton,
            footerSections,
            contactEmail,
            whatsappNumber,
            twitterUrl,
            linkedInUrl,
        } = req.body;

        let navigation = await Navigation.findOne({ isActive: true });

        // If no active navigation exists, create one
        if (!navigation) {
            await ensureSeeded();
            navigation = await Navigation.findOne({ isActive: true });
        }

        if (!navigation) {
            throw new AppError('Navigation not found', 404);
        }

        const updateData: Partial<INavigation> = {};
        if (Array.isArray(headerLinks)) updateData.headerLinks = headerLinks;
        if (loginButton) updateData.loginButton = loginButton;
        if (signUpButton) updateData.signUpButton = signUpButton;
        if (dashboardButton) updateData.dashboardButton = dashboardButton;
        if (Array.isArray(footerSections)) updateData.footerSections = footerSections;
        if (typeof contactEmail === 'string') updateData.contactEmail = contactEmail;
        if (typeof whatsappNumber === 'string') updateData.whatsappNumber = whatsappNumber;
        if (typeof twitterUrl === 'string') updateData.twitterUrl = twitterUrl;
        if (typeof linkedInUrl === 'string') updateData.linkedInUrl = linkedInUrl;

        const updatedNavigation = await Navigation.findByIdAndUpdate(navigation._id, updateData, {
            new: true,
            runValidators: true,
        }).lean();

        sendSuccess(res, 'Active navigation updated successfully', { navigation: updatedNavigation });
    }
);

/**
 * Delete navigation
 * DELETE /api/v1/navigation/admin/:id
 */
export const deleteNavigation = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const navigation = await Navigation.findByIdAndDelete(id).lean();

        if (!navigation) {
            throw new AppError('Navigation not found', 404);
        }

        sendSuccess(res, 'Navigation deleted successfully', { navigation });
    }
);

/**
 * Seed default navigation data
 */
export const ensureSeeded = async (): Promise<void> => {
    const existingNavigation = await Navigation.findOne({ isActive: true });

    if (existingNavigation) {
        return;
    }

    const defaultHeaderLinks = [
        { label: 'Home', href: '/', visible: true },
        { label: 'Services', href: '/services', visible: true },
        { label: 'Pricing', href: '/pricing', visible: true },
        { label: 'Case Studies', href: '/case-studies', visible: true },
        { label: 'Blog', href: '/blog', visible: true },
        { label: 'Contact', href: '/contact', visible: true },
    ];

    const defaultFooterSections = [
        {
            title: 'Services',
            links: [
                { label: 'Link Building', href: '/services/link-building' },
                { label: 'Guest Posting', href: '/services/guest-posting' },
                { label: 'SEO Consulting', href: '/services/seo-consulting' },
            ],
        },
        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '/about' },
                { label: 'Case Studies', href: '/case-studies' },
                { label: 'Blog', href: '/blog' },
            ],
        },
        {
            title: 'Legal',
            links: [
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Refund Policy', href: '/refund' },
            ],
        },
    ];

    await Navigation.create({
        headerLinks: defaultHeaderLinks,
        loginButton: { text: 'Log In', href: '/login', visible: true },
        signUpButton: { text: 'Sign Up', href: '/signup', visible: true },
        dashboardButton: { text: 'Dashboard', href: '/dashboard', visible: true, showWhenLoggedIn: true },
        footerSections: defaultFooterSections,
        contactEmail: 'hello@backlinkse.com',
        whatsappNumber: '+1 234 567 890',
        twitterUrl: 'https://twitter.com/backlinkse',
        linkedInUrl: 'https://linkedin.com/company/backlinkse',
        isActive: true,
    });
};

