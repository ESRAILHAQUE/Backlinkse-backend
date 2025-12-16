import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';
import { LiveChat, ILiveChat } from '../models/LiveChat';

/**
 * Get active live chat settings
 * GET /api/v1/live-chat
 */
export const getActiveLiveChat = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
        let liveChat = await LiveChat.findOne({ isActive: true }).lean();

        // If no live chat exists, create a default one
        if (!liveChat) {
            await ensureSeeded();
            liveChat = await LiveChat.findOne({ isActive: true }).lean();
        }

        if (!liveChat) {
            throw new AppError('Live chat settings not found', 404);
        }

        sendSuccess(res, 'Active live chat settings retrieved successfully', { liveChat });
    }
);

/**
 * Get all live chat settings (Admin only)
 * GET /api/v1/live-chat/admin/all
 */
export const getAllLiveChatSettings = asyncHandler(
    async (_req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const liveChats = await LiveChat.find({}).sort({ createdAt: -1 }).lean();

        sendSuccess(res, 'All live chat settings retrieved successfully', { liveChats });
    }
);

/**
 * Get live chat by ID
 * GET /api/v1/live-chat/admin/:id
 */
export const getLiveChatById = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const liveChat = await LiveChat.findById(id).lean();

        if (!liveChat) {
            throw new AppError('Live chat settings not found', 404);
        }

        sendSuccess(res, 'Live chat settings retrieved successfully', { liveChat });
    }
);

/**
 * Create new live chat settings
 * POST /api/v1/live-chat/admin
 */
export const createLiveChat = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { enabled, widgetScript, displayOn, autoReplyMessage, supportEmail, isActive } = req.body;

        // If setting this as active, deactivate all others
        if (isActive) {
            await LiveChat.updateMany({ isActive: true }, { isActive: false });
        }

        const liveChat = await LiveChat.create({
            enabled: enabled ?? true,
            widgetScript: widgetScript || '',
            displayOn: displayOn || 'all',
            autoReplyMessage: autoReplyMessage || '',
            supportEmail: supportEmail || '',
            isActive: isActive ?? false,
        });

        sendSuccess(res, 'Live chat settings created successfully', { liveChat }, 201);
    }
);

/**
 * Update live chat settings
 * PATCH /api/v1/live-chat/admin/:id
 */
export const updateLiveChat = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const { enabled, widgetScript, displayOn, autoReplyMessage, supportEmail, isActive } = req.body;

        const updateData: Partial<ILiveChat> = {};
        if (typeof enabled === 'boolean') updateData.enabled = enabled;
        if (typeof widgetScript === 'string') updateData.widgetScript = widgetScript;
        if (displayOn) updateData.displayOn = displayOn;
        if (typeof autoReplyMessage === 'string') updateData.autoReplyMessage = autoReplyMessage;
        if (typeof supportEmail === 'string') updateData.supportEmail = supportEmail;
        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive;
            // If setting this as active, deactivate all others
            if (isActive) {
                await LiveChat.updateMany({ _id: { $ne: id }, isActive: true }, { isActive: false });
            }
        }

        const liveChat = await LiveChat.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();

        if (!liveChat) {
            throw new AppError('Live chat settings not found', 404);
        }

        sendSuccess(res, 'Live chat settings updated successfully', { liveChat });
    }
);

/**
 * Update active live chat settings (simplified endpoint)
 * PATCH /api/v1/live-chat
 */
export const updateActiveLiveChat = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { enabled, widgetScript, displayOn, autoReplyMessage, supportEmail } = req.body;

        let liveChat = await LiveChat.findOne({ isActive: true });

        // If no active live chat exists, create one
        if (!liveChat) {
            await ensureSeeded();
            liveChat = await LiveChat.findOne({ isActive: true });
        }

        if (!liveChat) {
            throw new AppError('Live chat settings not found', 404);
        }

        const updateData: Partial<ILiveChat> = {};
        if (typeof enabled === 'boolean') updateData.enabled = enabled;
        if (typeof widgetScript === 'string') updateData.widgetScript = widgetScript;
        if (displayOn) updateData.displayOn = displayOn;
        if (typeof autoReplyMessage === 'string') updateData.autoReplyMessage = autoReplyMessage;
        if (typeof supportEmail === 'string') updateData.supportEmail = supportEmail;

        const updatedLiveChat = await LiveChat.findByIdAndUpdate(liveChat._id, updateData, {
            new: true,
            runValidators: true,
        }).lean();

        sendSuccess(res, 'Active live chat settings updated successfully', { liveChat: updatedLiveChat });
    }
);

/**
 * Delete live chat settings
 * DELETE /api/v1/live-chat/admin/:id
 */
export const deleteLiveChat = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
        const { id } = req.params;

        const liveChat = await LiveChat.findByIdAndDelete(id).lean();

        if (!liveChat) {
            throw new AppError('Live chat settings not found', 404);
        }

        sendSuccess(res, 'Live chat settings deleted successfully', { liveChat });
    }
);

/**
 * Seed default live chat data
 */
export const ensureSeeded = async (): Promise<void> => {
    const existingLiveChat = await LiveChat.findOne({ isActive: true });

    if (existingLiveChat) {
        return;
    }

    const defaultWidgetScript = `window.$crisp = [];
window.CRISP_WEBSITE_ID = "your-crisp-website-id";
(function() {
  var d = document;
  var s = d.createElement("script");
  s.src = "https://client.crisp.chat/l.js";
  s.async = 1;
  d.getElementsByTagName("head")[0].appendChild(s);
})();`;

    await LiveChat.create({
        enabled: true,
        widgetScript: defaultWidgetScript,
        displayOn: 'all',
        autoReplyMessage: "Thanks for reaching out! We'll get back to you shortly.",
        supportEmail: 'support@backlinkse.com',
        isActive: true,
    });
};

