import { Request, Response, NextFunction } from 'express';
import { AdminRole, AdminPermission } from '../types/admin.types';
import jwt from 'jsonwebtoken';
import { db } from '../../db';
import { eq } from 'drizzle-orm';

// Admin schema will be imported when available
// Using the users table for now
import { users } from '../../../shared/schema';

/**
 * Middleware to verify if the user is a founder
 * Founder has unrestricted access to all system components
 */
export const isFounder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First check if user is authenticated
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: number };
    
    // Check if the user exists and is a founder
    // Temporarily using the users table
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));
    
    if (!adminUser) {
      return res.status(401).json({ message: 'Unauthorized: Admin not found' });
    }
    
    // For now, check if admin and if user type is marked appropriately
    if (!adminUser.isAdmin || adminUser.userType !== 'founder') {
      return res.status(403).json({ 
        message: 'Forbidden: This action requires founder privileges' 
      });
    }
    
    // Attach the admin user to the request
    req.adminUser = adminUser;
    
    // Log the action
    await db.insert(adminActionLogs).values({
      adminId: adminUser.id,
      adminUsername: adminUser.username,
      action: 'FOUNDER_ACCESS',
      entityType: req.path,
      details: `Founder accessed ${req.method} ${req.path}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'Unknown',
    });
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    console.error('Founder auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Helper function to check if the authenticated admin is the founder
 */
export const checkIsFounder = async (adminId: number): Promise<boolean> => {
  try {
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, adminId));
    
    // Check if user is an admin and has founder userType
    return adminUser?.isAdmin && adminUser?.userType === 'founder';
  } catch (error) {
    console.error('Error checking founder status:', error);
    return false;
  }
};

/**
 * This middleware enables user impersonation for founders
 * It allows them to act as any user in the system for testing and support
 */
export const impersonateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First verify the user is a founder
    if (!req.adminUser || !req.adminUser.isAdmin || req.adminUser.userType !== 'founder') {
      return res.status(403).json({ 
        message: 'Forbidden: Only founders can impersonate users' 
      });
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required for impersonation' });
    }
    
    // Get the user to impersonate from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found for impersonation' });
    }
    
    // Create an impersonation token
    const impersonationToken = jwt.sign(
      { 
        id: user.id,
        impersonatedBy: req.adminUser.id
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    // Log the impersonation action
    await db.insert(adminActionLogs).values({
      adminId: req.adminUser.id,
      adminUsername: req.adminUser.username,
      action: 'USER_IMPERSONATION',
      entityType: 'user',
      entityId: user.id,
      details: `Founder impersonated user: ${user.username}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'Unknown',
    });
    
    return res.status(200).json({ 
      impersonationToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Impersonation error:', error);
    return res.status(500).json({ message: 'Internal server error during impersonation' });
  }
};