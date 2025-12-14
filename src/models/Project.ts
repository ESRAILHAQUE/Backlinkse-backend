import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    domain: string;
    status: 'Active' | 'Paused' | 'Completed';
    linksBuilt: number;
    targetLinks: number;
    startDate: Date;
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
            maxlength: [100, 'Project name cannot exceed 100 characters'],
        },
        domain: {
            type: String,
            required: [true, 'Domain is required'],
            trim: true,
            lowercase: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Paused', 'Completed'],
            default: 'Active',
        },
        linksBuilt: {
            type: Number,
            default: 0,
            min: 0,
        },
        targetLinks: {
            type: Number,
            required: [true, 'Target links is required'],
            min: 1,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
projectSchema.index({ userId: 1, status: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);

