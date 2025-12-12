import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests from a single IP
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // Time window in milliseconds (default: 15 minutes)
  max: env.RATE_LIMIT_MAX_REQUESTS, // Maximum number of requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, _res) => {
    throw new AppError('Too many requests from this IP, please try again later.', 429);
  },
});

