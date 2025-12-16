import express, { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { corsMiddleware } from "./middleware/cors";
import { rateLimiter } from "./middleware/rateLimiter";
import { swaggerSpec } from "./config/swagger";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import projectRoutes from "./routes/projectRoutes";
import orderRoutes from "./routes/orderRoutes";
import reportRoutes from "./routes/reportRoutes";
import supportRoutes from "./routes/supportRoutes";
import teamRoutes from "./routes/teamRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import pricingRoutes from "./routes/pricingRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import caseStudyRoutes from "./routes/caseStudyRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";
import faqRoutes from "./routes/faqRoutes";
import blogRoutes from "./routes/blogRoutes";
import homepageRoutes from "./routes/homepageRoutes";
import themeRoutes from "./routes/themeRoutes";
import navigationRoutes from "./routes/navigationRoutes";
import liveChatRoutes from "./routes/liveChatRoutes";
import globalSettingsRoutes from "./routes/globalSettingsRoutes";

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
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "API Documentation",
    })
);

// Health check endpoints
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
const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
};

// Root-level health
app.get("/health", healthHandler);

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint (v1)
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
app.get("/api/v1/health", healthHandler);

// API Routes
// Mount routes at /api/v1 prefix
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/support", supportRoutes);
app.use("/api/v1/team", teamRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/pricing", pricingRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/case-studies", caseStudyRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/faqs", faqRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/homepage", homepageRoutes);
app.use("/api/v1/theme", themeRoutes);
app.use("/api/v1/navigation", navigationRoutes);
app.use("/api/v1/live-chat", liveChatRoutes);
app.use("/api/v1/settings", globalSettingsRoutes);

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the Backend API",
        version: "1.0.0",
    });
});

// 404 Handler - Must be after all routes
app.use(notFoundHandler);

// Global Error Handler - Must be last middleware
app.use(errorHandler);

export default app;
