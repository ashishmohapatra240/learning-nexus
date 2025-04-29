import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { adminUsers, adminActionLogs } from '../schema/admin.schema';
import { 
  AdminRole, 
  adminLoginSchema,
  AdminAuthResponse
} from '../types/admin.types';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { isAuthenticated } from '../middlewares/admin-auth.middleware';

const router = Router();

// Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = adminLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: validation.error.format() 
      });
    }
    
    const { email, password } = validation.data;
    
    // Find the admin user
    const [adminUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));
    
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if the admin is active
    if (!adminUser.isActive) {
      return res.status(403).json({ message: 'Account is disabled' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, adminUser.password);
    if (!passwordMatch) {
      // Log failed login attempt
      await db.insert(adminActionLogs).values({
        adminId: adminUser.id,
        adminUsername: adminUser.username,
        action: 'LOGIN_FAILED',
        entityType: 'admin',
        details: 'Failed login attempt',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || 'Unknown',
      });
      
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check for 2FA if enabled
    if (adminUser.twoFactorEnabled) {
      const { totpCode } = validation.data;
      
      if (!totpCode) {
        return res.status(400).json({ message: '2FA code is required' });
      }
      
      // Verify TOTP code - this would validate against the stored secret
      // This is a placeholder for the actual 2FA verification logic
      const validTotp = true; // Replace with actual verification
      
      if (!validTotp) {
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
    }
    
    // Generate JWT tokens
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    
    const accessToken = jwt.sign(
      { id: adminUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { id: adminUser.id, tokenType: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Update last login time
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, adminUser.id));
    
    // Log successful login
    await db.insert(adminActionLogs).values({
      adminId: adminUser.id,
      adminUsername: adminUser.username,
      action: 'LOGIN_SUCCESS',
      entityType: 'admin',
      details: 'Successful login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'Unknown',
    });
    
    // Return the response
    const authResponse: AdminAuthResponse = {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
      adminUser: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        customPermissions: adminUser.customPermissions,
        lastLogin: adminUser.lastLogin,
        createdAt: adminUser.createdAt,
        updatedAt: adminUser.updatedAt,
        isActive: adminUser.isActive,
        twoFactorEnabled: adminUser.twoFactorEnabled,
        twoFactorSecret: null, // Never return the 2FA secret
        accessLevel: adminUser.role === AdminRole.FOUNDER ? 100 : undefined,
        bypassRestrictions: adminUser.role === AdminRole.FOUNDER ? true : undefined,
        canImpersonateUsers: adminUser.role === AdminRole.FOUNDER ? true : undefined
      }
    };
    
    return res.status(200).json(authResponse);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    
    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET) as { 
        id: number; 
        tokenType?: string;
      };
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    // Check that this is actually a refresh token
    if (!decoded.tokenType || decoded.tokenType !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    // Find the admin user
    const [adminUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, decoded.id));
    
    if (!adminUser || !adminUser.isActive) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Generate a new access token
    const accessToken = jwt.sign(
      { id: adminUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Return the new access token
    return res.status(200).json({
      accessToken,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Log the logout action
    if (req.adminUser) {
      await db.insert(adminActionLogs).values({
        adminId: req.adminUser.id,
        adminUsername: req.adminUser.username,
        action: 'LOGOUT',
        entityType: 'admin',
        details: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || 'Unknown',
      });
    }
    
    // In a real implementation, you might also want to invalidate the refresh token
    // This would typically be done by adding the token to a blacklist
    
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.adminUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Return the user info (without password)
    const { password, twoFactorSecret, ...adminUserInfo } = req.adminUser;
    
    return res.status(200).json(adminUserInfo);
  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;