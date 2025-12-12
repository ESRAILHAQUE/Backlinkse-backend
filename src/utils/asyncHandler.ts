import { Request, Response, NextFunction } from 'express';

/**
 * Type definition for async route handlers
 */
type AsyncFunction = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

/**
 * Wrapper function to catch errors in async route handlers
 * Eliminates the need for try-catch blocks in every controller
 *
 * @param fn - Async route handler function
 * @returns Wrapped function that catches and forwards errors
 */
export const asyncHandler = (fn: AsyncFunction) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Alternative: Factory function to create async handlers with custom error handling
 */
export const createAsyncHandler = (fn: AsyncFunction) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

