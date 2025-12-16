import mongoose, { Document, Model, Schema } from 'mongoose';

export interface CaseStudyResult {
    label: string;
    before: string;
    after: string;
    change: string;
}

export interface CaseStudyTestimonial {
    quote: string;
    author: string;
    role: string;
}

export interface CaseStudyDocument extends Document {
    slug: string;
    client: string;
    name?: string; // For admin interface compatibility
    industry: string;
    logo?: string;
    trafficIncrease?: string;
    trafficGrowth?: string; // Alternative field name for admin interface
    trafficBefore?: string;
    trafficAfter?: string;
    linksBuilt: number;
    drBefore?: number;
    drAfter?: number;
    keywordsTop10?: number;
    duration: string;
    featuredImage?: string;
    overview?: string;
    description?: string; // Alternative field name
    challenges?: string[];
    strategy?: string[];
    execution?: string[];
    results?: CaseStudyResult[];
    testimonial?: CaseStudyTestimonial;
    status: 'published' | 'draft';
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const CaseStudyResultSchema = new Schema<CaseStudyResult>(
    {
        label: { type: String, required: true },
        before: { type: String, required: true },
        after: { type: String, required: true },
        change: { type: String, required: true },
    },
    { _id: false }
);

const CaseStudyTestimonialSchema = new Schema<CaseStudyTestimonial>(
    {
        quote: { type: String, required: true },
        author: { type: String, required: true },
        role: { type: String, required: true },
    },
    { _id: false }
);

const CaseStudySchema = new Schema<CaseStudyDocument>(
    {
        slug: { type: String, required: true, unique: true, trim: true },
        client: { type: String, required: true, trim: true },
        name: { type: String, trim: true }, // For admin interface
        industry: { type: String, required: true, trim: true },
        logo: { type: String, trim: true },
        trafficIncrease: { type: String, trim: true },
        trafficGrowth: { type: String, trim: true }, // Alternative field
        trafficBefore: { type: String, trim: true },
        trafficAfter: { type: String, trim: true },
        linksBuilt: { type: Number, required: true, min: 0 },
        drBefore: { type: Number, min: 0 },
        drAfter: { type: Number, min: 0 },
        keywordsTop10: { type: Number, min: 0 },
        duration: { type: String, required: true, trim: true },
        featuredImage: { type: String, trim: true },
        overview: { type: String, trim: true },
        description: { type: String, trim: true }, // Alternative field
        challenges: { type: [String], default: [] },
        strategy: { type: [String], default: [] },
        execution: { type: [String], default: [] },
        results: { type: [CaseStudyResultSchema], default: [] },
        testimonial: { type: CaseStudyTestimonialSchema },
        status: { type: String, enum: ['published', 'draft'], default: 'published' },
        sortOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
CaseStudySchema.index({ slug: 1 });
CaseStudySchema.index({ status: 1, sortOrder: 1 });

const CaseStudy: Model<CaseStudyDocument> =
    mongoose.models.CaseStudy || mongoose.model<CaseStudyDocument>('CaseStudy', CaseStudySchema);

export default CaseStudy;

