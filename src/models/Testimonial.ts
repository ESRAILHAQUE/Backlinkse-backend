import mongoose, { Document, Model, Schema } from 'mongoose';

export interface TestimonialDocument extends Document {
    name: string;
    role: string;
    company: string;
    quote: string;
    rating: number; // 1-5
    photo?: string; // URL to client photo
    visible: boolean; // Show on website
    status?: 'published' | 'draft'; // For future use
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const TestimonialSchema = new Schema<TestimonialDocument>(
    {
        name: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        company: { type: String, required: true, trim: true },
        quote: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
        photo: { type: String, trim: true },
        visible: { type: Boolean, default: true },
        status: { type: String, enum: ['published', 'draft'], default: 'published' },
        sortOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
TestimonialSchema.index({ visible: 1, sortOrder: 1 });
TestimonialSchema.index({ status: 1, sortOrder: 1 });

const Testimonial: Model<TestimonialDocument> =
    mongoose.models.Testimonial || mongoose.model<TestimonialDocument>('Testimonial', TestimonialSchema);

export default Testimonial;

