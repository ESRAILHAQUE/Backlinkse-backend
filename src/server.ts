import app from './app';
import { connectDatabase } from './config/database';
import { validateEnv, env } from './config/env';
import { logger } from './utils/logger';

/**
 * Server Entry Point
 * Initializes the application and starts the server
 */

// Validate environment variables
validateEnv();

// Connect to MongoDB
connectDatabase()
  .then(() => {
    // Start server after database connection is established
    const PORT = env.PORT;

    app.listen(PORT, () => {
      // Clear console message for port
      console.log('\n🚀 Server is running!');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`📝 App: ${env.APP_NAME}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
      console.log(`📚 Swagger: http://localhost:${PORT}/api-docs\n`);
      
      // Also log using logger for structured logging
      logger.info(`Server is running on port ${PORT}`, {
        environment: env.NODE_ENV,
        port: PORT,
        appName: env.APP_NAME,
      });
    });
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

