import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';
import { rateLimiter } from './middleware/rateLimiter';
import { swaggerSpec } from './config/swagger';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import projectRoutes from './routes/projectRoutes';
import orderRoutes from './routes/orderRoutes';
import reportRoutes from './routes/reportRoutes';
import supportRoutes from './routes/supportRoutes';
import teamRoutes from './routes/teamRoutes';
import paymentRoutes from './routes/paymentRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';

/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */
const app: Application = express();

// CORS middleware - Must be before other middleware
app.use(corsMiddleware);

// Rate limiting middleware - Apply to all routes
app.use(rateLimiter);

// Body parser middleware - Parse JSON request bodies
app.use(express.json());

// Body parser middleware - Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation',
}));

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns server status and timestamp
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
// Mount routes at /api/v1 prefix
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Backend API',
        version: '1.0.0',
    });
});

// 404 Handler - Must be after all routes
app.use(notFoundHandler);

// Global Error Handler - Must be last middleware
app.use(errorHandler);

export default app;

