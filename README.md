# Backend API

A production-ready Node.js backend application built with Express.js, TypeScript, Mongoose, and MongoDB.

## Features

- ✅ **TypeScript** - Full type safety and modern JavaScript features
- ✅ **Express.js** - Fast, unopinionated web framework
- ✅ **MongoDB & Mongoose** - Database with ODM for data modeling
- ✅ **Centralized Error Handling** - Global error middleware for consistent error responses
- ✅ **Async Error Wrapper** - Automatic error catching for async controllers
- ✅ **API Response Formatting** - Standardized success/error response structure
- ✅ **Environment Variables** - Secure configuration management
- ✅ **Logger Utility** - Structured logging for debugging and monitoring
- ✅ **Modular Architecture** - Clean, scalable folder structure
- ✅ **Swagger UI** - Interactive API documentation
- ✅ **Production Ready** - Best practices and error handling

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection setup
│   │   ├── env.ts       # Environment variables validation
│   │   └── swagger.ts   # Swagger/OpenAPI configuration
│   ├── controllers/     # Route controllers
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── middleware/      # Express middleware
│   │   └── errorHandler.ts
│   ├── models/          # Mongoose models
│   │   └── User.ts
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   └── userRoutes.ts
│   ├── utils/           # Utility functions
│   │   ├── AppError.ts
│   │   ├── apiResponse.ts
│   │   ├── asyncHandler.ts
│   │   └── logger.ts
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── .gitignore          # Git ignore rules
├── nodemon.json        # Nodemon configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file and update the following variables:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/backend_db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   APP_NAME=Backend API
   ```

4. **Start MongoDB:**
   - If using local MongoDB, ensure it's running:
     ```bash
     mongod
     ```
   - Or use MongoDB Atlas connection string in `MONGODB_URI`

## Running the Application

### Development Mode

Run the application in development mode with hot-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Production Mode

1. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## API Documentation (Swagger)

The API documentation is available via Swagger UI. After starting the server, visit:

**http://localhost:3000/api-docs**

The Swagger UI provides:
- Interactive API documentation
- Try-it-out functionality to test endpoints
- Request/response schemas
- Authentication examples
- All available endpoints with detailed descriptions

## API Endpoints

### Health Check
- **GET** `/health` - Check server status

### Authentication Routes (`/api/v1/auth`)
- **POST** `/api/v1/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/v1/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **GET** `/api/v1/auth/me` - Get current user (requires authentication)

### User Routes (`/api/v1/users`)
- **GET** `/api/v1/users` - Get all users
- **GET** `/api/v1/users/:id` - Get user by ID
- **POST** `/api/v1/users` - Create new user
- **PATCH** `/api/v1/users/:id` - Update user
- **DELETE** `/api/v1/users/:id` - Delete user

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (development only)"
}
```

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint errors automatically

## Error Handling

The application uses a centralized error handling system:

- **AppError Class** - Custom error class for operational errors
- **Global Error Middleware** - Catches all errors and returns standardized responses
- **Async Handler Wrapper** - Automatically catches errors in async route handlers
- **Mongoose Error Handling** - Handles validation, duplicate key, and cast errors

## Security Features

- Password hashing using bcryptjs
- JWT token generation for authentication
- Environment variables for sensitive configuration
- Input validation using Mongoose schemas
- Password field excluded from queries by default

## Development Best Practices

1. **Type Safety** - Always use TypeScript types and interfaces
2. **Error Handling** - Use `asyncHandler` wrapper for all async controllers
3. **Response Format** - Use `sendSuccess` and `sendError` utilities
4. **Logging** - Use the logger utility for consistent log formatting
5. **Environment Variables** - Never commit `.env` file, use `.env.example`

## Production Considerations

- Set `NODE_ENV=production` in production
- Use a strong `JWT_SECRET` (at least 32 characters)
- Configure MongoDB connection pooling
- Set up proper logging service (e.g., Winston, Pino)
- Add rate limiting middleware
- Implement authentication middleware for protected routes
- Add request validation (e.g., using Joi or Zod)
- Set up monitoring and error tracking (e.g., Sentry)
- Use HTTPS in production
- Configure CORS properly for your frontend domain

## License

ISC

## Support

For issues and questions, please open an issue in the repository.

## Deployment

- CI/CD via GitHub Actions deploys to `/var/www/Backlinkse/backend` with PM2 on port 5004.
