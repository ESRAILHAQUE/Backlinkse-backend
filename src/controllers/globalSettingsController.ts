import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { GlobalSettings, IGlobalSettings } from '../models/GlobalSettings';

/**
 * Get active global settings
 * GET /api/v1/settings
 */
export const getActiveGlobalSettings = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
        let settings = await GlobalSettings.findOne({ isActive: true }).lean();

        // If no settings exist, create a default one
        if (!settings) {
            await ensureSeeded();
            settings = await GlobalSettings.findOne({ isActive: true }).lean();
        }

        if (!settings) {
            throw new AppError('Global settings not found', 404);
        }

        sendSuccess(res, 'Active global settings retrieved successfully', { settings });
    }
);

/**
 * Get all global settings (Admin only)
 * GET /api/v1/settings/admin/all
 */
export const getAllGlobalSettings = asyncHandler(
    async (_req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const allSettings = await GlobalSettings.find({}).sort({ createdAt: -1 }).lean();

        sendSuccess(res, 'All global settings retrieved successfully', { settings: allSettings });
    }
);

/**
 * Get settings by ID
 * GET /api/v1/settings/admin/:id
 */
export const getGlobalSettingsById = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const settings = await GlobalSettings.findById(id).lean();

        if (!settings) {
            throw new AppError('Global settings not found', 404);
        }

        sendSuccess(res, 'Global settings retrieved successfully', { settings });
    }
);

/**
 * Create new global settings
 * POST /api/v1/settings/admin
 */
export const createGlobalSettings = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const {
            siteLogo,
            favicon,
            siteName,
            tagline,
            contactEmail,
            supportEmail,
            whatsappNumber,
            businessAddress,
            calendlyLink,
            dashboardUrl,
            caseStudiesExternalUrl,
            defaultMetaTitle,
            defaultMetaDescription,
            googleAnalyticsId,
            adminEmail,
            twoFactorAuthEnabled,
            sessionExpiryEnabled,
            activityLoggingEnabled,
            bruteForceProtectionEnabled,
            isActive,
        } = req.body;

        // If setting this as active, deactivate all others
        if (isActive) {
            await GlobalSettings.updateMany({ isActive: true }, { isActive: false });
        }

        const settings = await GlobalSettings.create({
            siteLogo: siteLogo || '',
            favicon: favicon || '',
            siteName: siteName || 'Backlinkse',
            tagline: tagline || 'Professional Link Building Agency',
            contactEmail: contactEmail || 'hello@backlinkse.com',
            supportEmail: supportEmail || 'support@backlinkse.com',
            whatsappNumber: whatsappNumber || '',
            businessAddress: businessAddress || '',
            calendlyLink: calendlyLink || '',
            dashboardUrl: dashboardUrl || '/dashboard',
            caseStudiesExternalUrl: caseStudiesExternalUrl || '',
            defaultMetaTitle: defaultMetaTitle || '',
            defaultMetaDescription: defaultMetaDescription || '',
            googleAnalyticsId: googleAnalyticsId || '',
            adminEmail: adminEmail || 'admin@backlinkse.com',
            twoFactorAuthEnabled: twoFactorAuthEnabled ?? false,
            sessionExpiryEnabled: sessionExpiryEnabled ?? true,
            activityLoggingEnabled: activityLoggingEnabled ?? true,
            bruteForceProtectionEnabled: bruteForceProtectionEnabled ?? true,
            isActive: isActive ?? false,
        });

        sendSuccess(res, 'Global settings created successfully', { settings }, 201);
    }
);

/**
 * Update global settings
 * PATCH /api/v1/settings/admin/:id
 */
export const updateGlobalSettings = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const {
            siteLogo,
            favicon,
            siteName,
            tagline,
            contactEmail,
            supportEmail,
            whatsappNumber,
            businessAddress,
            calendlyLink,
            dashboardUrl,
            caseStudiesExternalUrl,
            defaultMetaTitle,
            defaultMetaDescription,
            googleAnalyticsId,
            adminEmail,
            twoFactorAuthEnabled,
            sessionExpiryEnabled,
            activityLoggingEnabled,
            bruteForceProtectionEnabled,
            isActive,
        } = req.body;

        const updateData: Partial<IGlobalSettings> = {};
        if (typeof siteLogo === 'string') updateData.siteLogo = siteLogo;
        if (typeof favicon === 'string') updateData.favicon = favicon;
        if (typeof siteName === 'string') updateData.siteName = siteName;
        if (typeof tagline === 'string') updateData.tagline = tagline;
        if (typeof contactEmail === 'string') updateData.contactEmail = contactEmail;
        if (typeof supportEmail === 'string') updateData.supportEmail = supportEmail;
        if (typeof whatsappNumber === 'string') updateData.whatsappNumber = whatsappNumber;
        if (typeof businessAddress === 'string') updateData.businessAddress = businessAddress;
        if (typeof calendlyLink === 'string') updateData.calendlyLink = calendlyLink;
        if (typeof dashboardUrl === 'string') updateData.dashboardUrl = dashboardUrl;
        if (typeof caseStudiesExternalUrl === 'string') updateData.caseStudiesExternalUrl = caseStudiesExternalUrl;
        if (typeof defaultMetaTitle === 'string') updateData.defaultMetaTitle = defaultMetaTitle;
        if (typeof defaultMetaDescription === 'string') updateData.defaultMetaDescription = defaultMetaDescription;
        if (typeof googleAnalyticsId === 'string') updateData.googleAnalyticsId = googleAnalyticsId;
        if (typeof adminEmail === 'string') updateData.adminEmail = adminEmail;
        if (typeof twoFactorAuthEnabled === 'boolean') updateData.twoFactorAuthEnabled = twoFactorAuthEnabled;
        if (typeof sessionExpiryEnabled === 'boolean') updateData.sessionExpiryEnabled = sessionExpiryEnabled;
        if (typeof activityLoggingEnabled === 'boolean') updateData.activityLoggingEnabled = activityLoggingEnabled;
        if (typeof bruteForceProtectionEnabled === 'boolean')
            updateData.bruteForceProtectionEnabled = bruteForceProtectionEnabled;
        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive;
            // If setting this as active, deactivate all others
            if (isActive) {
                await GlobalSettings.updateMany({ _id: { $ne: id }, isActive: true }, { isActive: false });
            }
        }

        const settings = await GlobalSettings.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();

        if (!settings) {
            throw new AppError('Global settings not found', 404);
        }

        sendSuccess(res, 'Global settings updated successfully', { settings });
    }
);

/**
 * Update active global settings (simplified endpoint)
 * PATCH /api/v1/settings
 */
export const updateActiveGlobalSettings = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const {
            siteLogo,
            favicon,
            siteName,
            tagline,
            contactEmail,
            supportEmail,
            whatsappNumber,
            businessAddress,
            calendlyLink,
            dashboardUrl,
            caseStudiesExternalUrl,
            defaultMetaTitle,
            defaultMetaDescription,
            googleAnalyticsId,
            adminEmail,
            twoFactorAuthEnabled,
            sessionExpiryEnabled,
            activityLoggingEnabled,
            bruteForceProtectionEnabled,
        } = req.body;

        let settings = await GlobalSettings.findOne({ isActive: true });

        // If no active settings exist, create one
        if (!settings) {
            await ensureSeeded();
            settings = await GlobalSettings.findOne({ isActive: true });
        }

        if (!settings) {
            throw new AppError('Global settings not found', 404);
        }

        const updateData: Partial<IGlobalSettings> = {};
        if (typeof siteLogo === 'string') updateData.siteLogo = siteLogo;
        if (typeof favicon === 'string') updateData.favicon = favicon;
        if (typeof siteName === 'string') updateData.siteName = siteName;
        if (typeof tagline === 'string') updateData.tagline = tagline;
        if (typeof contactEmail === 'string') updateData.contactEmail = contactEmail;
        if (typeof supportEmail === 'string') updateData.supportEmail = supportEmail;
        if (typeof whatsappNumber === 'string') updateData.whatsappNumber = whatsappNumber;
        if (typeof businessAddress === 'string') updateData.businessAddress = businessAddress;
        if (typeof calendlyLink === 'string') updateData.calendlyLink = calendlyLink;
        if (typeof dashboardUrl === 'string') updateData.dashboardUrl = dashboardUrl;
        if (typeof caseStudiesExternalUrl === 'string') updateData.caseStudiesExternalUrl = caseStudiesExternalUrl;
        if (typeof defaultMetaTitle === 'string') updateData.defaultMetaTitle = defaultMetaTitle;
        if (typeof defaultMetaDescription === 'string') updateData.defaultMetaDescription = defaultMetaDescription;
        if (typeof googleAnalyticsId === 'string') updateData.googleAnalyticsId = googleAnalyticsId;
        if (typeof adminEmail === 'string') updateData.adminEmail = adminEmail;
        if (typeof twoFactorAuthEnabled === 'boolean') updateData.twoFactorAuthEnabled = twoFactorAuthEnabled;
        if (typeof sessionExpiryEnabled === 'boolean') updateData.sessionExpiryEnabled = sessionExpiryEnabled;
        if (typeof activityLoggingEnabled === 'boolean') updateData.activityLoggingEnabled = activityLoggingEnabled;
        if (typeof bruteForceProtectionEnabled === 'boolean')
            updateData.bruteForceProtectionEnabled = bruteForceProtectionEnabled;

        const updatedSettings = await GlobalSettings.findByIdAndUpdate(settings._id, updateData, {
            new: true,
            runValidators: true,
        }).lean();

        sendSuccess(res, 'Active global settings updated successfully', { settings: updatedSettings });
    }
);

/**
 * Delete global settings
 * DELETE /api/v1/settings/admin/:id
 */
export const deleteGlobalSettings = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const settings = await GlobalSettings.findByIdAndDelete(id).lean();

        if (!settings) {
            throw new AppError('Global settings not found', 404);
        }

        sendSuccess(res, 'Global settings deleted successfully', { settings });
    }
);

/**
 * Seed default global settings data
 */
export const ensureSeeded = async (): Promise<void> => {
    const existingSettings = await GlobalSettings.findOne({ isActive: true });

    if (existingSettings) {
        return;
    }

    await GlobalSettings.create({
        siteLogo: '',
        favicon: '',
        siteName: 'Backlinkse',
        tagline: 'Professional Link Building Agency',
        contactEmail: 'hello@backlinkse.com',
        supportEmail: 'support@backlinkse.com',
        whatsappNumber: '+1 234 567 890',
        businessAddress: '123 Business St, Suite 100, New York, NY 10001',
        calendlyLink: 'https://calendly.com/backlinkse/consultation',
        dashboardUrl: '/dashboard',
        caseStudiesExternalUrl: 'https://v0-backlinkse.vercel.app/case-studies',
        defaultMetaTitle: 'Backlinkse - Professional Link Building Agency',
        defaultMetaDescription:
            'Build high-quality backlinks and improve your search rankings with Backlinkse. Trusted by 500+ companies worldwide.',
        googleAnalyticsId: '',
        adminEmail: 'admin@backlinkse.com',
        twoFactorAuthEnabled: false,
        sessionExpiryEnabled: true,
        activityLoggingEnabled: true,
        bruteForceProtectionEnabled: true,
        isActive: true,
    });
};

