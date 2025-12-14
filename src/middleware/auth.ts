import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

/**
 * Extended Request interface to include user information
 */
export interface AuthRequest extends Request {
    user?: {
        _id: string;
        name: string;
        email: string;
        role: 'admin' | 'moderator' | 'user';
        isVerified: boolean;
        isSuspended: boolean;
        isActive: boolean;
        isDeleted: boolean;
    };
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required. Please provide a valid token.', 401);
        }

        // Extract token from header
        const token = authHeader.substring(7);

        if (!token) {
            throw new AppError('Authentication required. Please provide a valid token.', 401);
        }

        // Verify token
        if (!env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

        // Find user by ID
        const user = await User.findById(decoded.userId).select('-password').lean();

        if (!user) {
            throw new AppError('User not found. Token may be invalid.', 401);
        }

        if (user.isDeleted || !user.isActive) {
            throw new AppError('Account is inactive or deleted. Please contact support.', 403);
        }

        if (user.isSuspended) {
            throw new AppError('Account is suspended. Please contact support.', 403);
        }

        if (!user.isVerified) {
            throw new AppError('Account is pending verification. Please wait for admin approval.', 403);
        }

        // Attach user to request object
        req.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'moderator' | 'user',
            isVerified: user.isVerified,
            isSuspended: user.isSuspended,
            isActive: user.isActive,
            isDeleted: user.isDeleted,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Invalid token. Please login again.', 401));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Token expired. Please login again.', 401));
        }
        next(error);
    }
};

