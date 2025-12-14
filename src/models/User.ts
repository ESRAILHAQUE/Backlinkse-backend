import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Interface
 * Defines the structure of a User document
 */
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'moderator' | 'user';
    isVerified: boolean;
    isSuspended: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Schema
 * Defines the structure and validation rules for User documents
 */
const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default in queries
        },
        role: {
            type: String,
            enum: ['admin', 'moderator', 'user'],
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

/**
 * Pre-save middleware to hash password before saving
 */
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

/**
 * Instance method to compare password with hashed password
 * @param candidatePassword - Plain text password to compare
 * @returns Promise<boolean> - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * User Model
 * Export the model for use in controllers and routes
 */
export const User = mongoose.model<IUser>('User', userSchema);

