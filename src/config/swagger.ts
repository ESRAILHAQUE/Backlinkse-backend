import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

/**
 * Swagger Configuration
 * Generates OpenAPI specification from JSDoc comments
 */

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: env.APP_NAME,
            version: '1.0.0',
            description: 'A production-ready Node.js backend API with Express, TypeScript, and MongoDB',
            contact: {
                name: 'API Support',
            },
            license: {
                name: 'ISC',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Development server',
            },
            {
                url: 'https://api.example.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID',
                            example: '507f1f77bcf86cd799439011',
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                            example: 'John Doe',
                            minLength: 2,
                            maxLength: 50,
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'john@example.com',
                        },
                        password: {
                            type: 'string',
                            description: 'User password (min 6 characters)',
                            example: 'password123',
                            minLength: 6,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User last update timestamp',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: {
                            $ref: '#/components/schemas/User',
                        },
                        token: {
                            type: 'string',
                            description: 'JWT authentication token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        error: {
                            type: 'string',
                            description: 'Detailed error information (development only)',
                        },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'Operation successful',
                        },
                        data: {
                            type: 'object',
                            description: 'Response data',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication endpoints',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Health',
                description: 'Health check endpoints',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);

