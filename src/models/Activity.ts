import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    site?: string;
    domainRating?: number;
    orderId?: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: [true, 'Action is required'],
            trim: true,
        },
        site: {
            type: String,
            trim: true,
        },
        domainRating: {
            type: Number,
            min: 0,
            max: 100,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
activitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);

