import mongoose, { Document, Model, Schema } from 'mongoose';

export interface GuestPostingPackageDocument extends Document {
    name: string;
    price: number | null; // null for "Custom" pricing
    description: string; // e.g., "Per post placement"
    features: string[];
    icon: string; // Icon name (e.g., "FileText", "Globe", "Zap")
    popular: boolean;
    enabled: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const GuestPostingPackageSchema = new Schema<GuestPostingPackageDocument>(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, default: null, min: 0 }, // null means "Custom"
        description: { type: String, required: true, trim: true },
        features: { type: [String], default: [] },
        icon: { type: String, default: 'FileText', trim: true },
        popular: { type: Boolean, default: false },
        enabled: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
GuestPostingPackageSchema.index({ enabled: 1, sortOrder: 1 });

const GuestPostingPackage: Model<GuestPostingPackageDocument> =
    mongoose.models.GuestPostingPackage || mongoose.model<GuestPostingPackageDocument>('GuestPostingPackage', GuestPostingPackageSchema);

export default GuestPostingPackage;

