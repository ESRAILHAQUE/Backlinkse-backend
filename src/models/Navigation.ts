import mongoose, { Document, Schema } from 'mongoose';

export interface INavigationLink {
    label: string;
    href: string;
    visible: boolean;
}

export interface IFooterLink {
    label: string;
    href: string;
}

export interface IFooterSection {
    title: string;
    links: IFooterLink[];
}

export interface IHeaderCTA {
    text: string;
    href: string;
    visible: boolean;
    showWhenLoggedIn?: boolean; // For Dashboard button
}

export interface INavigation extends Document {
    // Header navigation
    headerLinks: INavigationLink[];

    // Header CTAs
    loginButton: IHeaderCTA;
    signUpButton: IHeaderCTA;
    dashboardButton: IHeaderCTA;

    // Footer sections
    footerSections: IFooterSection[];

    // Social & Contact
    contactEmail: string;
    whatsappNumber: string;
    twitterUrl: string;
    linkedInUrl: string;

    // Metadata
    isActive: boolean; // Only one navigation should be active
    createdAt: Date;
    updatedAt: Date;
}

const NavigationLinkSchema = new Schema<INavigationLink>(
    {
        label: { type: String, required: true, trim: true },
        href: { type: String, required: true, trim: true },
        visible: { type: Boolean, default: true },
    },
    { _id: false }
);

const FooterLinkSchema = new Schema<IFooterLink>(
    {
        label: { type: String, required: true, trim: true },
        href: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const FooterSectionSchema = new Schema<IFooterSection>(
    {
        title: { type: String, required: true, trim: true },
        links: { type: [FooterLinkSchema], default: [] },
    },
    { _id: false }
);

const HeaderCTASchema = new Schema<IHeaderCTA>(
    {
        text: { type: String, required: true, trim: true },
        href: { type: String, required: true, trim: true },
        visible: { type: Boolean, default: true },
        showWhenLoggedIn: { type: Boolean, default: false },
    },
    { _id: false }
);

const navigationSchema = new Schema<INavigation>(
    {
        headerLinks: {
            type: [NavigationLinkSchema],
            default: [],
        },
        loginButton: {
            type: HeaderCTASchema,
            required: true,
        },
        signUpButton: {
            type: HeaderCTASchema,
            required: true,
        },
        dashboardButton: {
            type: HeaderCTASchema,
            required: true,
        },
        footerSections: {
            type: [FooterSectionSchema],
            default: [],
        },
        contactEmail: {
            type: String,
            default: '',
            trim: true,
        },
        whatsappNumber: {
            type: String,
            default: '',
            trim: true,
        },
        twitterUrl: {
            type: String,
            default: '',
            trim: true,
        },
        linkedInUrl: {
            type: String,
            default: '',
            trim: true,
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

// Index to ensure only one active navigation
navigationSchema.index({ isActive: 1 });

export const Navigation = mongoose.model<INavigation>('Navigation', navigationSchema);

