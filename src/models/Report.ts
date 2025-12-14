import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    type: 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom';
    reportDate: Date;
    linksCount: number;
    status: 'In Progress' | 'Ready';
    fileUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Report name is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['Monthly', 'Quarterly', 'Yearly', 'Custom'],
            required: true,
        },
        reportDate: {
            type: Date,
            required: true,
        },
        linksCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ['In Progress', 'Ready'],
            default: 'In Progress',
        },
        fileUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
reportSchema.index({ userId: 1, reportDate: -1 });
reportSchema.index({ userId: 1, status: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);

