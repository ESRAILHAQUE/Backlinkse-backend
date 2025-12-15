import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ServicePackage {
    name: string;
    price: number;
    description?: string;
    features?: string[];
}

export interface ServiceDocument extends Document {
    serviceId: string; // unique identifier like "link-building"
    name: string;
    slug: string;
    description?: string;
    icon: string; // lucide-react icon name (e.g., "Link2", "FileText")
    status: 'published' | 'draft';
    packages: ServicePackage[];
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const ServicePackageSchema = new Schema<ServicePackage>(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, trim: true },
        features: { type: [String], default: [] },
    },
    { _id: false }
);

const ServiceSchema = new Schema<ServiceDocument>(
    {
        serviceId: { type: String, required: true, unique: true, trim: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        icon: { type: String, required: true, trim: true, default: 'Package' },
        status: { type: String, enum: ['published', 'draft'], default: 'published' },
        packages: { type: [ServicePackageSchema], default: [] },
        sortOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ServiceSchema.index({ serviceId: 1 });
ServiceSchema.index({ status: 1, sortOrder: 1 });

const Service: Model<ServiceDocument> =
    mongoose.models.Service || mongoose.model<ServiceDocument>('Service', ServiceSchema);

export default Service;

