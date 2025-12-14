import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
    userId: mongoose.Types.ObjectId;
    ticketNumber: string;
    subject: string;
    category: 'billing' | 'technical' | 'order' | 'general';
    priority: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    message: string;
    createdAt: Date;
    updatedAt: Date;
    lastUpdate: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            maxlength: [200, 'Subject cannot exceed 200 characters'],
        },
        category: {
            type: String,
            enum: ['billing', 'technical', 'order', 'general'],
            required: true,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open',
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        lastUpdate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
supportTicketSchema.index({ userId: 1, status: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);

