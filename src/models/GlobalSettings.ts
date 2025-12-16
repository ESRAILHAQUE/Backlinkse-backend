import mongoose, { Document, Schema } from 'mongoose';

export interface IGlobalSettings extends Document {
    // Branding
    siteLogo: string;
    favicon: string;
    siteName: string;
    tagline: string;

    // Contact Information
    contactEmail: string;
    supportEmail: string;
    whatsappNumber: string;
    businessAddress: string;

    // External Links
    calendlyLink: string;
    dashboardUrl: string;
    caseStudiesExternalUrl: string;

    // SEO Settings
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    googleAnalyticsId: string;

    // Admin Security Settings
    adminEmail: string;
    twoFactorAuthEnabled: boolean;
    sessionExpiryEnabled: boolean;
    activityLoggingEnabled: boolean;
    bruteForceProtectionEnabled: boolean;

    // Metadata
    isActive: boolean; // Only one global settings should be active
    createdAt: Date;
    updatedAt: Date;
}

const globalSettingsSchema = new Schema<IGlobalSettings>(
    {
        // Branding
        siteLogo: {
            type: String,
            default: '',
            trim: true,
        },
        favicon: {
            type: String,
            default: '',
            trim: true,
        },
        siteName: {
            type: String,
            default: 'Backlinkse',
            trim: true,
        },
        tagline: {
            type: String,
            default: 'Professional Link Building Agency',
            trim: true,
        },

        // Contact Information
        contactEmail: {
            type: String,
            default: 'hello@backlinkse.com',
            trim: true,
        },
        supportEmail: {
            type: String,
            default: 'support@backlinkse.com',
            trim: true,
        },
        whatsappNumber: {
            type: String,
            default: '+1 234 567 890',
            trim: true,
        },
        businessAddress: {
            type: String,
            default: '',
            trim: true,
        },

        // External Links
        calendlyLink: {
            type: String,
            default: '',
            trim: true,
        },
        dashboardUrl: {
            type: String,
            default: '/dashboard',
            trim: true,
        },
        caseStudiesExternalUrl: {
            type: String,
            default: '',
            trim: true,
        },

        // SEO Settings
        defaultMetaTitle: {
            type: String,
            default: 'Backlinkse - Professional Link Building Agency',
            trim: true,
        },
        defaultMetaDescription: {
            type: String,
            default: 'Build high-quality backlinks and improve your search rankings with Backlinkse. Trusted by 500+ companies worldwide.',
            trim: true,
        },
        googleAnalyticsId: {
            type: String,
            default: '',
            trim: true,
        },

        // Admin Security Settings
        adminEmail: {
            type: String,
            default: 'admin@backlinkse.com',
            trim: true,
        },
        twoFactorAuthEnabled: {
            type: Boolean,
            default: false,
        },
        sessionExpiryEnabled: {
            type: Boolean,
            default: true,
        },
        activityLoggingEnabled: {
            type: Boolean,
            default: true,
        },
        bruteForceProtectionEnabled: {
            type: Boolean,
            default: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index to ensure only one active global settings
globalSettingsSchema.index({ isActive: 1 });

export const GlobalSettings = mongoose.model<IGlobalSettings>('GlobalSettings', globalSettingsSchema);

