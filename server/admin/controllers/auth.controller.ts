import { Request, Response } from 'express';
import { getDB } from '../../db';
import { users } from '../../../shared/schema';
import bcrypt from 'bcrypt';
import { AdminRole, AdminAuthResponse, adminLoginSchema } from '../types/admin.types';
import { generateAdminToken, generateAdminRefreshToken } from '../middlewares/admin-auth.middleware';
import { eq, sql } from 'drizzle-orm';
import { ZodError } from 'zod';

/**
 * Authenticate admin user
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedData = adminLoginSchema.parse(req.body);
    
    // Find the user by email
    const [user] = await getDB()
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email));
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is an admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Not an admin account' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const accessToken = generateAdminToken(user.id);
    const refreshToken = generateAdminRefreshToken(user.id);
    
    // TODO: Store refresh token or hash in database for validation
    
    // Update last active timestamp
    await getDB()
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, user.id));
    
    // Return user info and tokens
    const response: AdminAuthResponse = {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
      adminUser: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.userType as AdminRole, 
        lastLogin: user.lastActiveAt,
        createdAt: user.createdAt,
        updatedAt: user.createdAt, // We don't have an updatedAt field, using createdAt instead
        isActive: user.blocked !== true,
        twoFactorEnabled: false, // Two-factor is not implemented yet
        twoFactorSecret: null,
        // Additional founder privileges
        bypassRestrictions: user.userType === AdminRole.FOUNDER,
        accessLevel: user.userType === AdminRole.FOUNDER ? 100 : 
                    user.userType === AdminRole.SUPER_ADMIN ? 80 : 
                    user.userType === AdminRole.ADMIN ? 60 : 
                    user.userType === AdminRole.MODERATOR ? 40 : 20,
        canImpersonateUsers: user.userType === AdminRole.FOUNDER || user.userType === AdminRole.SUPER_ADMIN
      }
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Refresh admin access token
 */
export const refreshToken = async (req: Request, res: Response) => {
  // This would validate the refresh token and generate a new access token
  res.status(501).json({ message: 'Not implemented yet' });
};

/**
 * Log out admin user
 */
export const logout = async (req: Request, res: Response) => {
  // This would invalidate the refresh token
  res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * Get admin profile with statistics
 */
export const getProfile = async (req: Request, res: Response) => {
  if (!req.adminUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // Get database counts for platform statistics
    const db = getDB();
    
    // Count users
    const [userCountResult] = await db.select({ count: sql`count(*)` }).from(users);
    const userCount = Number(userCountResult.count);
    
    // Count professional users (simple estimation based on user types)
    const [professionalCountResult] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.userType, 'professional'));
    const professionalCount = Number(professionalCountResult.count);
    
    // Count companies (simple estimation based on user types)
    const [companyCountResult] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.userType, 'company'));
    const companyCount = Number(companyCountResult.count);
    
    // Other counts from related tables - using safe queries with try/catch blocks
    let jobCount = 0;
    let resourceCount = 0;
    let monthlyRevenue = "$0";
    
    try {
      // Use the imported tables from shared schema
      const [jobCountResult] = await db
        .select({ count: sql`count(*)` })
        .from(sql`job_postings`);
      jobCount = Number(jobCountResult.count);
    } catch (e) {
      console.log('Could not count job postings, table may not exist yet');
      // Try to create the table if it doesn't exist
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS job_postings (
            id SERIAL PRIMARY KEY,
            company_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (tableError) {
        console.error('Failed to create job_postings table:', tableError);
      }
    }
    
    try {
      // Use the imported tables from shared schema
      const [resourceCountResult] = await db
        .select({ count: sql`count(*)` })
        .from(sql`resources`);
      resourceCount = Number(resourceCountResult.count);
    } catch (e) {
      console.log('Could not count resources, table may not exist yet');
      // Try to create the table if it doesn't exist
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS resources (
            id SERIAL PRIMARY KEY,
            author_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (tableError) {
        console.error('Failed to create resources table:', tableError);
      }
    }
    
    // Get sample monthly revenue - estimated for demo purposes
    monthlyRevenue = "$" + ((jobCount * 50) + (userCount * 5)).toLocaleString();
    
    // Return admin profile with stats
    res.status(200).json({
      id: req.adminUser.id,
      username: req.adminUser.username,
      email: req.adminUser.email,
      firstName: req.adminUser.firstName,
      lastName: req.adminUser.lastName,
      role: req.adminUser.role,
      stats: {
        totalUsers: userCount,
        totalProfessionals: professionalCount,
        totalCompanies: companyCount,
        totalJobs: jobCount,
        totalResources: resourceCount,
        monthlyRevenue: monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Error getting admin profile:', error);
    // Return basic profile without stats in case of error
    res.status(200).json({
      id: req.adminUser.id,
      username: req.adminUser.username,
      email: req.adminUser.email,
      firstName: req.adminUser.firstName,
      lastName: req.adminUser.lastName,
      role: req.adminUser.role,
      stats: {
        totalUsers: 0,
        totalProfessionals: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalResources: 0,
        monthlyRevenue: "$0"
      }
    });
  }
};

/**
 * Update admin password
 */
export const updatePassword = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

/**
 * Toggle two-factor authentication
 */
export const toggleTwoFactor = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented yet' });
};