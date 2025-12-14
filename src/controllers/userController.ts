import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * Get all users
 * GET /api/v1/users
 */
export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = await User.find().select('-password').lean();

    logger.info(`Retrieved ${users.length} users`);

    sendSuccess(res, 'Users retrieved successfully', { users, count: users.length });
  }
);

/**
 * Get single user by ID
 * GET /api/v1/users/:id
 */
export const getUserById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404);
    }

    logger.info(`Retrieved user: ${id}`);

    sendSuccess(res, 'User retrieved successfully', { user });
  }
);

/**
 * Create new user
 * POST /api/v1/users
 */
export const createUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email, password, isVerified, isSuspended, isActive, isDeleted, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
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
      // Admin-created accounts are verified by default unless specified
      isVerified: typeof isVerified === 'boolean' ? isVerified : true,
      isSuspended: typeof isSuspended === 'boolean' ? isSuspended : false,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      isDeleted: typeof isDeleted === 'boolean' ? isDeleted : false,
      role: role ?? 'user',
    });

    // Remove password from response
    const userResponse = user.toObject();
    const { password: _password, ...userWithoutPassword } = userResponse;

    logger.info(`Created new user: ${user._id}`);

    sendSuccess(res, 'User created successfully', { user: userWithoutPassword }, 201);
  }
);

/**
 * Update user by ID
 * PATCH /api/v1/users/:id
 */
export const updateUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { name, email, isVerified, isSuspended, isActive, isDeleted, role } = req.body;

    // Build update object (only include provided fields)
    const updateData: Partial<IUser> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;
    if (typeof isSuspended === 'boolean') updateData.isSuspended = isSuspended;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isDeleted === 'boolean') updateData.isDeleted = isDeleted;
    if (role) updateData.role = role as IUser['role'];

    // Don't allow password updates through this endpoint
    if (req.body.password) {
      throw new AppError('Password cannot be updated through this endpoint', 400);
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    ).select('-password').lean();

    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404);
    }

    logger.info(`Updated user: ${id}`);

    sendSuccess(res, 'User updated successfully', { user });
  }
);

/**
 * Delete user by ID
 * DELETE /api/v1/users/:id
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404);
    }

    logger.info(`Deleted user: ${id}`);

    sendSuccess(res, 'User deleted successfully');
  }
);

/**
 * Approve (verify) a pending user
 * PATCH /api/v1/users/:id/verify
 */
export const approveUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        isVerified: true,
        isSuspended: false,
        isActive: true,
        isDeleted: false,
      },
      {
        new: true,
        runValidators: true,
        select: '-password',
      }
    ).lean();

    if (!user) {
      throw new AppError(`User with ID ${id} not found`, 404);
    }

    logger.info(`Approved user: ${id}`);

    sendSuccess(res, 'User approved successfully', { user });
  }
);

