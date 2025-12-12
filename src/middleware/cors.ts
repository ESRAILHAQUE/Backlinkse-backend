import cors from 'cors';
import { env } from '../config/env';

/**
 * CORS Configuration Middleware
 * Configures Cross-Origin Resource Sharing based on environment variables
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // In development mode, allow all origins (including Swagger UI)
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, check against allowed origins
    const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

