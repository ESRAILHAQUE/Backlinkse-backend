import mongoose, { Document, Model, Schema } from 'mongoose';

export interface PricingPlanDocument extends Document {
    name: string;
    price: number;
    linksPerMonth: string;
    features: string[];
    popular: boolean;
    enabled: boolean;
    buttonText: string;
    buttonLink: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const PricingPlanSchema = new Schema<PricingPlanDocument>(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        linksPerMonth: { type: String, default: '' },
        features: { type: [String], default: [] },
        popular: { type: Boolean, default: false },
        enabled: { type: Boolean, default: true },
        buttonText: { type: String, default: 'Get Started' },
        buttonLink: { type: String, default: '/contact' },
        sortOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

const PricingPlan: Model<PricingPlanDocument> =
    mongoose.models.PricingPlan || mongoose.model<PricingPlanDocument>('PricingPlan', PricingPlanSchema);

export default PricingPlan;

