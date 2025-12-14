import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

/**
 * Generate JWT Access Token
 * @param userId - User ID to encode in token
 * @returns JWT access token string
 */
const generateAccessToken = (userId: string): string => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  const expiresIn: string | number = env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { userId },
    env.JWT_SECRET as string,
    { expiresIn } as any
  );
};

/**
 * Generate JWT Refresh Token
 * @param userId - User ID to encode in token
 * @returns JWT refresh token string
 */
const generateRefreshToken = (userId: string): string => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  const expiresIn: string | number = env.JWT_REFRESH_EXPIRES_IN || '30d';
  return jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET as string,
    { expiresIn } as any
  );
};

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    // Validate password length
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by pre-save middleware
      // New accounts require admin approval
      role: 'user',
      isVerified: false,
      isSuspended: false,
      isActive: true,
      isDeleted: false,
    });

    // Generate JWT tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _password, ...userWithoutPassword } = userResponse;

    logger.info(`New user registered: ${user._id}`);

    sendSuccess(
      res,
      'User registered successfully',
      {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      201
    );
  }
);

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user and include password field (since it's select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Enforce account status before issuing tokens
    if (user.isDeleted || !user.isActive) {
      throw new AppError('Account is inactive or deleted. Please contact support.', 403);
    }

    if (user.isSuspended) {
      throw new AppError('Account is suspended. Please contact support.', 403);
    }

    if (!user.isVerified) {
      throw new AppError('Account is pending verification. Please wait for admin approval.', 403);
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _password2, ...userWithoutPassword2 } = userResponse;

    logger.info(`User logged in: ${user._id}`);

    sendSuccess(res, 'Login successful', {
      user: userWithoutPassword2,
      accessToken,
      refreshToken,
    });
  }
);

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!._id;

    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.info(`Retrieved current user: ${userId}`);

    sendSuccess(res, 'User retrieved successfully', { user });
  }
);

