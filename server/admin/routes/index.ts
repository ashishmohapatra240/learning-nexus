import { Router } from 'express';
import authRoutes from './auth-routes';
import founderRoutes from './founder-routes';
import { isAuthenticated } from '../middlewares/admin-auth.middleware';

const adminRouter = Router();

// Authentication routes (login, logout, refresh token)
adminRouter.use('/auth', authRoutes);

// Founder-specific routes - require authentication
adminRouter.use('/founder', isAuthenticated, founderRoutes);

// Export the main router
export default adminRouter;