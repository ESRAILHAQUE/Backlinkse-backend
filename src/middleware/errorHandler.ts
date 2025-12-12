import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';
import mongoose from 'mongoose';

/**
 * Global Error Handling Middleware
 * Centralized error handling for all routes and controllers
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((error) => error.message);
    sendError(res, 'Validation Error', 400, messages.join(', '));
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err instanceof Error && 'code' in err && (err as any).code === 11000) {
    const duplicateField = Object.keys((err as any).keyPattern || {})[0];
    sendError(res, `${duplicateField} already exists`, 409);
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // Default error handler (500 - Internal Server Error)
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Something went wrong';

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};

