import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from '../utils/AppError';

/**
 * Role-based authorization middleware
 * Usage: router.get('/admin', authenticate, authorizeRoles('admin'), handler)
 */
export const authorizeRoles = (...allowedRoles: Array<'admin' | 'moderator' | 'user'>) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }

        const { role } = req.user;
        if (!allowedRoles.includes(role)) {
            return next(new AppError('Access denied. Insufficient permissions.', 403));
        }

        next();
    };
};


