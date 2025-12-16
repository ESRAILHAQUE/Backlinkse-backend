import mongoose, { Document, Model, Schema } from 'mongoose';

export interface FAQDocument extends Document {
    question: string;
    answer: string;
    visible: boolean; // Show on website
    status?: 'published' | 'draft'; // For future use
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const FAQSchema = new Schema<FAQDocument>(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
        visible: { type: Boolean, default: true },
        status: { type: String, enum: ['published', 'draft'], default: 'published' },
        sortOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
FAQSchema.index({ visible: 1, sortOrder: 1 });
FAQSchema.index({ status: 1, sortOrder: 1 });

const FAQ: Model<FAQDocument> =
    mongoose.models.FAQ || mongoose.model<FAQDocument>('FAQ', FAQSchema);

export default FAQ;

