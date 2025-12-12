import dotenv from 'dotenv';
import { logger } from '../utils/logger';

/**
 * Load environment variables from .env file
 */
dotenv.config();

/**
 * Environment variables configuration
 * Validates required environment variables on application startup
 */
export const env = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5004', 10),

  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || '',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '',

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Application
  APP_NAME: process.env.APP_NAME || 'Backend API',
};

/**
 * Validate required environment variables
 */
export const validateEnv = (): void => {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

  const missing: string[] = [];

  required.forEach((key) => {
    if (!env[key as keyof typeof env]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    logger.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  logger.info('Environment variables validated successfully');
};

