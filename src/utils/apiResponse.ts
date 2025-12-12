import { Response } from 'express';

/**
 * API Response Interface
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

/**
 * Utility function to send standardized success responses
 * @param res - Express response object
 * @param message - Success message
 * @param data - Response data (optional)
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
): void => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        ...(data && { data }),
    };

    res.status(statusCode).json(response);
};

/**
 * Utility function to send standardized error responses
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param error - Error details (optional)
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string
): void => {
    const response: ApiResponse = {
        success: false,
        message,
        ...(error && { error }),
    };

    res.status(statusCode).json(response);
};

