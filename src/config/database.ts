import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * MongoDB Connection Configuration
 * Handles connection to MongoDB using Mongoose with proper error handling
 */

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const options: mongoose.ConnectOptions = {
            // These options are recommended for production
            // maxPoolSize: 10, // Maintain up to 10 socket connections
            // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        await mongoose.connect(mongoUri, options);

        logger.info('MongoDB connected successfully', {
            host: mongoose.connection.host,
            database: mongoose.connection.name,
        });

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed due to application termination');
            process.exit(0);
        });
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB disconnected successfully');
    } catch (error) {
        logger.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
};

