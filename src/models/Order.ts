import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    orderNumber: string;
    packageName: string;
    packageType: 'link-building' | 'guest-posting';
    status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
    linksDelivered: number;
    linksTotal: number;
    amount: number;
    currency: string;
    orderDate: Date;
    completedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        packageName: {
            type: String,
            required: [true, 'Package name is required'],
            trim: true,
        },
        packageType: {
            type: String,
            enum: ['link-building', 'guest-posting'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        linksDelivered: {
            type: Number,
            default: 0,
            min: 0,
        },
        linksTotal: {
            type: Number,
            required: [true, 'Total links is required'],
            min: 1,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: 0,
        },
        currency: {
            type: String,
            default: 'USD',
            uppercase: true,
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        completedDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
orderSchema.index({ userId: 1, status: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

