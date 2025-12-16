import mongoose, { Document, Schema } from 'mongoose';

export interface ILiveChat extends Document {
    enabled: boolean;
    widgetScript: string;
    displayOn: 'all' | 'homepage' | 'dashboard' | 'exclude-dashboard';
    autoReplyMessage: string;
    supportEmail: string;
    isActive: boolean; // Only one live chat config should be active
    createdAt: Date;
    updatedAt: Date;
}

const liveChatSchema = new Schema<ILiveChat>(
    {
        enabled: {
            type: Boolean,
            default: true,
        },
        widgetScript: {
            type: String,
            default: '',
            trim: true,
        },
        displayOn: {
            type: String,
            enum: ['all', 'homepage', 'dashboard', 'exclude-dashboard'],
            default: 'all',
        },
        autoReplyMessage: {
            type: String,
            default: '',
            trim: true,
        },
        supportEmail: {
            type: String,
            default: '',
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index to ensure only one active live chat config
liveChatSchema.index({ isActive: 1 });

export const LiveChat = mongoose.model<ILiveChat>('LiveChat', liveChatSchema);

