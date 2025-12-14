import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentMethod extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'Visa' | 'Mastercard' | 'American Express' | 'Discover';
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['Visa', 'Mastercard', 'American Express', 'Discover'],
            required: true,
        },
        last4: {
            type: String,
            required: true,
            length: 4,
        },
        expiryMonth: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        expiryYear: {
            type: Number,
            required: true,
            min: new Date().getFullYear(),
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
paymentMethodSchema.index({ userId: 1, isDefault: 1 });

export const PaymentMethod = mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);

