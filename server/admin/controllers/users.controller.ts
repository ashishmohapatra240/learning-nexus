import { Request, Response } from 'express';
import { storage } from '../../storage';
import { AdminPermission } from '../types/admin.types';
import { hasPermission } from '../middlewares/admin-auth.middleware';

/**
 * Get all users with pagination, filtering, and sorting
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const search = req.query.search as string || '';
    const userType = req.query.userType as string || '';
    const isActive = req.query.isActive ? (req.query.isActive === 'true') : undefined;
    
    // Get users with pagination
    const { users, total } = await storage.getAllUsersWithPagination({
      page,
      pageSize,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      search,
      userType,
      isActive
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);
    
    return res.status(200).json({
      data: users,
      page,
      pageSize,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get additional user data
    const [professional, company] = await Promise.all([
      storage.getProfessionalProfileByUserId(userId),
      storage.getCompanyProfileByUserId(userId)
    ]);
    
    // Return user with profiles if they exist
    return res.status(200).json({
      ...user,
      professionalProfile: professional || null,
      companyProfile: company || null
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};

/**
 * Get user's activity/audit log
 */
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    
    const { activityLogs, total } = await storage.getUserActivityLogs(userId, {
      page,
      pageSize
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);
    
    return res.status(200).json({
      data: activityLogs,
      page,
      pageSize,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    return res.status(500).json({ message: 'Error fetching user activity' });
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get current user data
    const existingUser = await storage.getUser(userId);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Extract update data from request body
    const {
      firstName,
      lastName,
      email,
      username,
      userType,
      isActive
    } = req.body;
    
    // Create update object with only provided fields
    const updateData: any = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (userType !== undefined) updateData.userType = userType;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Update user
    const updatedUser = await storage.updateUser(userId, updateData);
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Error updating user' });
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Verify user exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Soft delete the user
    const success = await storage.deleteUser(userId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }
    
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
};

/**
 * Reset user password
 */
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Verify user exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate random password
    const newPassword = generateRandomPassword();
    
    // Update user password
    await storage.resetUserPassword(userId, newPassword);
    
    return res.status(200).json({
      message: 'Password reset successful',
      newPassword,
      note: 'Please store this password securely. It will not be shown again.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};

/**
 * Get users statistics
 */
export const getUsersStats = async (req: Request, res: Response) => {
  try {
    // Get counts by user type
    const userStats = await storage.getUserStats();
    
    // Get new users count for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await storage.getNewUsersCount(thirtyDaysAgo);
    
    // Get active users count (users who logged in within last 30 days)
    const activeUsers = await storage.getActiveUsersCount(thirtyDaysAgo);
    
    return res.status(200).json({
      ...userStats,
      newUsers,
      activeUsers
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

/**
 * Get user's subscription information
 */
export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get user
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get subscription data
    const subscription = await storage.getUserSubscription(userId);
    
    // Get transaction history
    const transactions = await storage.getUserTransactions(userId);
    
    return res.status(200).json({
      subscription,
      transactions
    });
  } catch (error) {
    console.error('Get user subscription error:', error);
    return res.status(500).json({ message: 'Error fetching user subscription' });
  }
};

/**
 * Update user's subscription
 */
export const updateUserSubscription = [
  hasPermission(AdminPermission.MANAGE_SUBSCRIPTIONS),
  async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const { subscriptionTier, status, expiresAt } = req.body;
      
      if (!subscriptionTier || !status) {
        return res.status(400).json({ message: 'Subscription tier and status are required' });
      }
      
      // Update subscription 
      // Ensure we only pass expected parameters to the storage method
      const updatedSubscription = await storage.updateUserSubscription(
        userId,
        subscriptionTier,
        status
      );
      
      return res.status(200).json(updatedSubscription);
    } catch (error) {
      console.error('Update user subscription error:', error);
      return res.status(500).json({ message: 'Error updating user subscription' });
    }
  }
];

// Helper function to generate a random password
function generateRandomPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}