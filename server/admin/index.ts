import { Express } from 'express';
import adminRoutes from './routes';
import { db } from '../db';
import { adminUsers } from './schema/admin.schema';
import { eq } from 'drizzle-orm';
import { AdminRole } from './types/admin.types';
import bcrypt from 'bcrypt';

/**
 * Setup admin system and register admin routes
 */
export async function setupAdminSystem(app: Express) {
  try {
    // Register admin API routes
    app.use('/api/admin', adminRoutes);
    
    // Create default admin users if none exist
    if (process.env.NODE_ENV === 'development') {
      await createDefaultAdminUsersIfNeeded();
    }
    
    console.log('Admin routes registered successfully');
    return true;
  } catch (error) {
    console.error('Failed to setup admin system:', error);
    return false;
  }
}

/**
 * Create default admin users for development if none exist
 */
async function createDefaultAdminUsersIfNeeded() {
  try {
    // Check if we're connected to a database
    if (!db) {
      console.log('Running with memory storage, skipping default admin user creation until migrations are applied');
      return;
    }
    
    // Skip if tables don't exist yet
    try {
      const count = await db.select({ count: db.fn.count() }).from(adminUsers);
      
      // If we already have admin users, don't create defaults
      if (count[0].count > 0) {
        return;
      }
      
      // Create a default founder account
      const hashedPassword = await bcrypt.hash('founder123', 10);
      
      await db.insert(adminUsers).values({
        username: 'founder',
        email: 'founder@example.com',
        password: hashedPassword,
        firstName: 'Founder',
        lastName: 'User',
        role: AdminRole.FOUNDER,
        isActive: true,
        bypassRestrictions: true,
        accessLevel: 100,
      });
      
      // Create a default super_admin account
      const superAdminPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(adminUsers).values({
        username: 'super_admin',
        email: 'admin@example.com',
        password: superAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      });
      
      console.log('Created default admin users for development');
    } catch (error) {
      // This might fail if the table doesn't exist yet, which is fine
      console.log('Admin users table not available yet, skipping default user creation');
    }
  } catch (error) {
    console.error('Error creating default admin users:', error);
  }
}