import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    planName: string;
    price: number;
    billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
    status: 'Active' | 'Cancelled' | 'Expired';
    startDate: Date;
    nextBillingDate: Date;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        planName: {
            type: String,
            required: [true, 'Plan name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        billingCycle: {
            type: String,
            enum: ['Monthly', 'Quarterly', 'Yearly'],
            default: 'Monthly',
        },
        status: {
            type: String,
            enum: ['Active', 'Cancelled', 'Expired'],
            default: 'Active',
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        nextBillingDate: {
            type: Date,
            required: true,
        },
        cancelledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);

