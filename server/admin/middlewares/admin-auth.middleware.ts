import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDB } from '../../db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { AdminRole, AdminPermission, RolePermissions } from '../types/admin.types';

// JWT Secret configuration
// Using a fixed but secure secret for development purposes
// In production, this should be set via an environment variable
const JWT_SECRET = 'ldnexus-secure-admin-jwt-secret-for-development-8923498347';
const JWT_EXPIRY = '1h';
const JWT_REFRESH_EXPIRY = '7d';

/**
 * Generate a JWT token for admin authentication
 */
export const generateAdminToken = (adminId: number): string => {
  return jwt.sign(
    { id: adminId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

/**
 * Generate a refresh token for admins
 */
export const generateAdminRefreshToken = (adminId: number): string => {
  return jwt.sign(
    { 
      id: adminId,
      tokenType: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );
};

// Extend Express Request to include adminUser
declare global {
  namespace Express {
    interface Request {
      adminUser?: any;
    }
  }
}

/**
 * Middleware to verify if the user is authenticated
 */
export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for authorization header
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    
    // Verify the token using our configured JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    
    // Check if the admin exists
    const [adminUser] = await getDB()
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));
    
    if (!adminUser) {
      return res.status(401).json({ message: 'Unauthorized: Admin not found' });
    }
    
    // Check if account is blocked using the database field
    if (adminUser.blocked === true) {
      return res.status(403).json({ message: 'Account is disabled' });
    }
    
    // Attach the admin user to the request
    req.adminUser = adminUser;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    console.error('Admin auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check if the user has a specific role
 */
export const requireRole = (requiredRole: AdminRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First check if the user is authenticated
      if (!req.adminUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check for userType since we're using the users table
      // Also check for isAdmin to ensure it's an admin user
      if (req.adminUser.isAdmin && req.adminUser.userType === requiredRole) {
        return next();
      }
      
      // Always allow founder access if the role check fails
      if (req.adminUser.isAdmin && req.adminUser.userType === 'founder') {
        return next();
      }
      
      return res.status(403).json({ 
        message: `Forbidden: This action requires ${requiredRole} role privileges` 
      });
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

/**
 * Middleware to check if the user has specific permissions
 */
export const hasPermission = (permission: AdminPermission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First check if the user is authenticated
      if (!req.adminUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Founder always has all permissions
      if (req.adminUser.role === AdminRole.FOUNDER) {
        return next();
      }
      
      // Check if the role has the required permission
      const adminRole = req.adminUser.role as AdminRole;
      const rolePermissions = RolePermissions[adminRole] || [];
      
      // Check custom permissions override
      const customPermissions = req.adminUser.customPermissions || [];
      
      if (
        rolePermissions.includes(permission) || 
        customPermissions.includes(permission)
      ) {
        return next();
      }
      
      return res.status(403).json({ 
        message: `Forbidden: You don't have the required permission: ${permission}` 
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};