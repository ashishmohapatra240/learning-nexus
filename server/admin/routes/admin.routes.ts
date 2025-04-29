import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as usersController from '../controllers/users.controller';
import { verifyAdminToken, requireRole, hasPermission as requirePermission } from '../middlewares/admin-auth.middleware';
import { adminActivityLogger } from '../middlewares/activity-logger.middleware';
import { adminAuthRateLimiter } from '../middlewares/rate-limiter.middleware';
import { AdminRole, AdminPermission } from '../types/admin.types';

const router = Router();

// Apply admin activity logger to all routes
router.use(adminActivityLogger);

// Auth routes - no token required
router.post('/auth/login', adminAuthRateLimiter, authController.login);
router.post('/auth/refresh-token', authController.refreshToken);
router.post('/auth/logout', authController.logout);

// Token verification endpoint for frontend
router.get('/auth/verify-token', verifyAdminToken, (req, res) => {
  res.status(200).json({ valid: true });
});

// Admin user data endpoint for frontend
router.get('/auth/me', verifyAdminToken, authController.getProfile);

// Protected routes - require admin token
router.use(verifyAdminToken);

// Admin profile
router.get('/profile', authController.getProfile);
router.put('/profile/password', authController.updatePassword);
router.post('/profile/two-factor', authController.toggleTwoFactor);

// User management
router.get('/users', 
  requirePermission(AdminPermission.READ_USERS), 
  usersController.getAllUsers
);

router.get('/users/:id', 
  requirePermission(AdminPermission.READ_USERS), 
  usersController.getUserById
);

router.get('/users/:id/activity', 
  requirePermission(AdminPermission.READ_USERS), 
  usersController.getUserActivity
);

router.get('/users/:id/subscription', 
  requirePermission(AdminPermission.READ_USERS), 
  usersController.getUserSubscription
);

router.put('/users/:id', 
  requirePermission(AdminPermission.UPDATE_USERS), 
  usersController.updateUser
);

router.put('/users/:id/subscription', 
  usersController.updateUserSubscription
);

router.post('/users/:id/reset-password', 
  requireRole(AdminRole.ADMIN), 
  usersController.resetUserPassword
);

router.delete('/users/:id', 
  requireRole(AdminRole.ADMIN), 
  usersController.deleteUser
);

// User statistics
router.get('/stats/users', 
  requirePermission(AdminPermission.VIEW_ANALYTICS), 
  usersController.getUsersStats
);

// Return the router
export default router;