import mongoose, { Document, Model, Schema } from 'mongoose';

export interface LinkBuildingPackageDocument extends Document {
    name: string;
    price: number | null; // null for "Custom" pricing
    linksPerMonth: string; // e.g., "5 links/month", "50+ links/month"
    features: string[];
    popular: boolean;
    enabled: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const LinkBuildingPackageSchema = new Schema<LinkBuildingPackageDocument>(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, default: null, min: 0 }, // null means "Custom"
        linksPerMonth: { type: String, required: true, trim: true },
        features: { type: [String], default: [] },
        popular: { type: Boolean, default: false },
        enabled: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
LinkBuildingPackageSchema.index({ enabled: 1, sortOrder: 1 });

const LinkBuildingPackage: Model<LinkBuildingPackageDocument> =
    mongoose.models.LinkBuildingPackage || mongoose.model<LinkBuildingPackageDocument>('LinkBuildingPackage', LinkBuildingPackageSchema);

export default LinkBuildingPackage;

