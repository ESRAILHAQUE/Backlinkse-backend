import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamMember extends Document {
    userId: mongoose.Types.ObjectId; // Owner/Admin who invited
    email: string;
    role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
    status: 'Pending' | 'Active' | 'Inactive';
    invitedBy: mongoose.Types.ObjectId;
    invitedAt: Date;
    joinedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        role: {
            type: String,
            enum: ['Owner', 'Admin', 'Editor', 'Viewer'],
            default: 'Viewer',
        },
        status: {
            type: String,
            enum: ['Pending', 'Active', 'Inactive'],
            default: 'Pending',
        },
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        invitedAt: {
            type: Date,
            default: Date.now,
        },
        joinedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
teamMemberSchema.index({ userId: 1, status: 1 });
teamMemberSchema.index({ email: 1 });

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);

