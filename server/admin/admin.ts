import { Express } from 'express';
import adminRoutes from './routes/admin.routes';
import { storage } from '../storage';
import crypto from 'crypto';
import { useRealDatabase } from '../db';
import { AdminRole } from './types/admin.types';

/**
 * Create a default admin user for testing if none exists
 */
async function ensureDefaultAdminExists(): Promise<void> {
  try {
    // Skip admin user creation for database storage - we'll implement migrations later
    if (useRealDatabase) {
      console.log('Running with database storage, skipping default admin user creation until migrations are applied');
      return;
    }
    
    // Check if any admin user exists
    const adminUsers = await storage.getAllAdminUsers();
    
    if (adminUsers.length === 0) {
      console.log('Creating default admin user...');
      
      // Generate secure password hash
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync('admin123', salt, 1000, 64, 'sha512').toString('hex');
      const hashedPassword = `${hash}.${salt}`;
      
      // Create the admin user
      await storage.createAdminUser({
        username: 'admin',
        email: 'admin@nexus.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: AdminRole.SUPER_ADMIN,
        customPermissions: null,
        isActive: true,
        twoFactorEnabled: false
      });
      
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error ensuring default admin exists:', error);
  }
}

/**
 * Register admin routes with the main Express application
 * @param app Express application instance
 */
export function registerAdminRoutes(app: Express): void {
  // Mount all admin routes under /api/admin
  app.use('/api/admin', adminRoutes);
  
  // Ensure a default admin user exists
  ensureDefaultAdminExists().catch(err => {
    console.error('Error ensuring default admin exists:', err);
  });
  
  console.log('Admin routes registered successfully');
}