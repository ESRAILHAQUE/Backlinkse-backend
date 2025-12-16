import mongoose, { Document, Model, Schema } from 'mongoose';

export interface HomepageSectionDocument extends Document {
    sectionId: string; // e.g., "intro", "results", "pricing", etc.
    name: string;
    enabled: boolean;
    sortOrder: number;
    // Flexible content storage for different section types
    // Fields vary by section type:
    // - intro: badge, mainHeading, highlightedText, description, sectionImage
    // - results: sectionLabel, mainHeading, highlightedWord, featuredCaseStudies[]
    // - pricing: heading, description
    // - client-logos: heading, logos[]
    // - comparison: sectionLabel, mainHeading, features[]
    // - cta: heading, description, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink
    content: {
        [key: string]: any; // Flexible structure for section-specific content
    };
    createdAt: Date;
    updatedAt: Date;
}

const HomepageSectionSchema = new Schema<HomepageSectionDocument>(
    {
        sectionId: { type: String, required: true, unique: true, trim: true },
        name: { type: String, required: true, trim: true },
        enabled: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
        content: { type: Schema.Types.Mixed, default: {} },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
HomepageSectionSchema.index({ sectionId: 1 });
HomepageSectionSchema.index({ enabled: 1, sortOrder: 1 });

const HomepageSection: Model<HomepageSectionDocument> =
    mongoose.models.HomepageSection ||
    mongoose.model<HomepageSectionDocument>('HomepageSection', HomepageSectionSchema);

export default HomepageSection;

