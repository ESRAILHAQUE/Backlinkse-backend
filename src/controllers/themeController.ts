import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { Theme, ITheme } from '../models/Theme';

/**
 * Get active theme
 * GET /api/v1/theme
 */
export const getActiveTheme = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
        let theme = await Theme.findOne({ isActive: true }).lean();

        // If no theme exists, create a default one
        if (!theme) {
            await ensureSeeded();
            theme = await Theme.findOne({ isActive: true }).lean();
        }

        if (!theme) {
            throw new AppError('Theme not found', 404);
        }

        sendSuccess(res, 'Active theme retrieved successfully', { theme });
    }
);

/**
 * Get all themes (Admin only)
 * GET /api/v1/theme/admin/all
 */
export const getAllThemes = asyncHandler(
    async (_req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const themes = await Theme.find({}).sort({ createdAt: -1 }).lean();

        sendSuccess(res, 'All themes retrieved successfully', { themes });
    }
);

/**
 * Get theme by ID
 * GET /api/v1/theme/admin/:id
 */
export const getThemeById = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const theme = await Theme.findById(id).lean();

        if (!theme) {
            throw new AppError('Theme not found', 404);
        }

        sendSuccess(res, 'Theme retrieved successfully', { theme });
    }
);

/**
 * Create new theme
 * POST /api/v1/theme/admin
 */
export const createTheme = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { activeColorHue, darkMode, primaryFont, headingFont, baseFontSize, borderRadius, colorPresets, isActive } = req.body;

        // If setting this theme as active, deactivate all others
        if (isActive) {
            await Theme.updateMany({ isActive: true }, { isActive: false });
        }

        const theme = await Theme.create({
            activeColorHue: activeColorHue ?? 155,
            darkMode: darkMode ?? false,
            primaryFont: primaryFont ?? 'Inter',
            headingFont: headingFont ?? 'Inter',
            baseFontSize: baseFontSize ?? '16px',
            borderRadius: borderRadius ?? 0.625,
            colorPresets: colorPresets ?? [],
            isActive: isActive ?? false,
        });

        sendSuccess(res, 'Theme created successfully', { theme }, 201);
    }
);

/**
 * Update theme
 * PATCH /api/v1/theme/admin/:id
 */
export const updateTheme = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const { activeColorHue, darkMode, primaryFont, headingFont, baseFontSize, borderRadius, colorPresets, isActive } = req.body;

        const updateData: Partial<ITheme> = {};
        if (typeof activeColorHue === 'number') updateData.activeColorHue = activeColorHue;
        if (typeof darkMode === 'boolean') updateData.darkMode = darkMode;
        if (primaryFont) updateData.primaryFont = primaryFont;
        if (headingFont) updateData.headingFont = headingFont;
        if (baseFontSize) updateData.baseFontSize = baseFontSize;
        if (typeof borderRadius === 'number') updateData.borderRadius = borderRadius;
        if (Array.isArray(colorPresets)) updateData.colorPresets = colorPresets;
        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive;
            // If setting this theme as active, deactivate all others
            if (isActive) {
                await Theme.updateMany({ _id: { $ne: id }, isActive: true }, { isActive: false });
            }
        }

        const theme = await Theme.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();

        if (!theme) {
            throw new AppError('Theme not found', 404);
        }

        sendSuccess(res, 'Theme updated successfully', { theme });
    }
);

/**
 * Update active theme (simplified endpoint)
 * PATCH /api/v1/theme
 */
export const updateActiveTheme = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { activeColorHue, darkMode, primaryFont, headingFont, baseFontSize, borderRadius } = req.body;

        let theme = await Theme.findOne({ isActive: true });

        // If no active theme exists, create one
        if (!theme) {
            await ensureSeeded();
            theme = await Theme.findOne({ isActive: true });
        }

        if (!theme) {
            throw new AppError('Theme not found', 404);
        }

        const updateData: Partial<ITheme> = {};
        if (typeof activeColorHue === 'number') updateData.activeColorHue = activeColorHue;
        if (typeof darkMode === 'boolean') updateData.darkMode = darkMode;
        if (primaryFont) updateData.primaryFont = primaryFont;
        if (headingFont) updateData.headingFont = headingFont;
        if (baseFontSize) updateData.baseFontSize = baseFontSize;
        if (typeof borderRadius === 'number') updateData.borderRadius = borderRadius;

        const updatedTheme = await Theme.findByIdAndUpdate(theme._id, updateData, { new: true, runValidators: true }).lean();

        sendSuccess(res, 'Active theme updated successfully', { theme: updatedTheme });
    }
);

/**
 * Delete theme
 * DELETE /api/v1/theme/admin/:id
 */
export const deleteTheme = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const theme = await Theme.findByIdAndDelete(id).lean();

        if (!theme) {
            throw new AppError('Theme not found', 404);
        }

        sendSuccess(res, 'Theme deleted successfully', { theme });
    }
);

/**
 * Seed default theme data
 */
export const ensureSeeded = async (): Promise<void> => {
    const existingTheme = await Theme.findOne({ isActive: true });

    if (existingTheme) {
        return;
    }

    const defaultColorPresets = [
        { name: 'Green', hue: 155, color: 'oklch(0.65 0.2 155)' },
        { name: 'Blue', hue: 260, color: 'oklch(0.65 0.22 260)' },
        { name: 'Purple', hue: 280, color: 'oklch(0.65 0.2 280)' },
        { name: 'Orange', hue: 30, color: 'oklch(0.65 0.2 30)' },
        { name: 'Teal', hue: 180, color: 'oklch(0.65 0.2 180)' },
        { name: 'Pink', hue: 330, color: 'oklch(0.65 0.2 330)' },
    ];

    await Theme.create({
        activeColorHue: 155,
        darkMode: false,
        primaryFont: 'Inter',
        headingFont: 'Inter',
        baseFontSize: '16px',
        borderRadius: 0.625,
        colorPresets: defaultColorPresets,
        isActive: true,
    });
};

