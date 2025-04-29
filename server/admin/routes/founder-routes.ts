import { Router, Request, Response } from 'express';
import { isFounder, impersonateUser } from '../middlewares/founder-auth.middleware';
import { founderDbUtils, safeDbOperation } from '../utils/database-helper';
import { db } from '../../db';
import { eq, desc, and, sql } from 'drizzle-orm';
import {
  adminUsers,
  adminActionLogs
} from '../schema/admin.schema';
import { 
  users, 
  professionalProfiles, 
  companyProfiles, 
  jobPostings,
  resources,
  forumPosts,
  messages,
  consultations
} from '../../../shared/schema';

const founderRouter = Router();

// Require founder authentication for all routes
founderRouter.use(isFounder);

// Platform Overview Dashboard
founderRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Get user counts by type
    const userCounts = await db.execute(sql`
      SELECT user_type, COUNT(*) as count
      FROM users
      WHERE deleted = false
      GROUP BY user_type
    `);
    
    // Get recent registrations (last 7 days)
    const recentRegistrations = await db
      .select({ 
        count: sql<number>`count(*)` 
      })
      .from(users)
      .where(
        and(
          sql`created_at > NOW() - INTERVAL '7 days'`,
          eq(users.deleted, false)
        )
      );
    
    // Get active jobs count
    const activeJobs = await db
      .select({ 
        count: sql<number>`count(*)` 
      })
      .from(jobPostings)
      .where(eq(jobPostings.status, 'open'));
    
    // Get recent resources
    const recentResources = await db
      .select({ 
        count: sql<number>`count(*)` 
      })
      .from(resources)
      .where(sql`created_at > NOW() - INTERVAL '7 days'`);
    
    // Get messaging activity 
    const messagingActivity = await db
      .select({ 
        count: sql<number>`count(*)` 
      })
      .from(messages)
      .where(sql`created_at > NOW() - INTERVAL '7 days'`);
      
    // Get admin activity
    const adminActivity = await db
      .select()
      .from(adminActionLogs)
      .orderBy(desc(adminActionLogs.timestamp))
      .limit(10);
    
    return res.status(200).json({
      userCounts,
      recentRegistrations: recentRegistrations[0]?.count || 0,
      activeJobs: activeJobs[0]?.count || 0,
      recentResources: recentResources[0]?.count || 0,
      messagingActivity: messagingActivity[0]?.count || 0,
      recentAdminActivity: adminActivity
    });
  } catch (error) {
    console.error('Error in founder dashboard:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// User Management
founderRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const userType = req.query.userType as string;
    const search = req.query.search as string;
    
    const offset = (page - 1) * pageSize;
    
    let query = db
      .select()
      .from(users)
      .limit(pageSize)
      .offset(offset);
    
    // Apply filters
    if (userType) {
      query = query.where(eq(users.userType, userType));
    }
    
    if (search) {
      query = query.where(
        sql`(username ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'} OR first_name ILIKE ${'%' + search + '%'} OR last_name ILIKE ${'%' + search + '%'})`
      );
    }
    
    const result = await query;
    
    // Count total
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    if (userType) {
      countQuery = countQuery.where(eq(users.userType, userType));
    }
    
    if (search) {
      countQuery = countQuery.where(
        sql`(username ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'} OR first_name ILIKE ${'%' + search + '%'} OR last_name ILIKE ${'%' + search + '%'})`
      );
    }
    
    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;
    
    return res.status(200).json({
      data: result,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error in founder users list:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific user with all related data
founderRouter.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get professional or company profile
    let profile = null;
    
    if (user.userType === 'professional') {
      [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.userId, userId));
    } else if (user.userType === 'company') {
      [profile] = await db
        .select()
        .from(companyProfiles)
        .where(eq(companyProfiles.userId, userId));
    }
    
    // Get recent activities
    // Jobs if company
    let jobs = [];
    if (user.userType === 'company' && profile) {
      jobs = await db
        .select()
        .from(jobPostings)
        .where(eq(jobPostings.companyId, profile.id))
        .limit(5);
    }
    
    // Resources by the user
    const resources = await db
      .select()
      .from(resources)
      .where(eq(resources.authorId, userId))
      .limit(5);
    
    // Forum posts
    const forumPosts = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.authorId, userId))
      .limit(5);
    
    // Recent messages
    const sentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, userId))
      .limit(5);
    
    const receivedMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.receiverId, userId))
      .limit(5);
    
    // Consultations if professional
    let consultations = [];
    if (user.userType === 'professional' && profile) {
      consultations = await db
        .select()
        .from(consultations)
        .where(eq(consultations.professionalId, profile.id))
        .limit(5);
    }
    
    // Return comprehensive user data
    return res.status(200).json({
      user,
      profile,
      activity: {
        jobs,
        resources,
        forumPosts,
        messages: {
          sent: sentMessages,
          received: receivedMessages
        },
        consultations
      }
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// User impersonation route
founderRouter.post('/impersonate', impersonateUser);

// Database Management Routes
founderRouter.get('/database/schema', async (req: Request, res: Response) => {
  try {
    const schema = await founderDbUtils.getDatabaseSchema(req.adminUser!.id);
    return res.status(200).json(schema);
  } catch (error) {
    console.error('Error getting database schema:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

founderRouter.get('/database/table/:tableName', async (req: Request, res: Response) => {
  try {
    const tableName = req.params.tableName;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;
    
    const tableData = await founderDbUtils.getTableData(
      tableName,
      page,
      pageSize,
      req.adminUser!.id
    );
    
    return res.status(200).json(tableData);
  } catch (error) {
    console.error(`Error getting table data for ${req.params.tableName}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

founderRouter.post('/database/query', async (req: Request, res: Response) => {
  try {
    const { query, params = [] } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Valid query is required' });
    }
    
    // Execute the raw query
    const result = await founderDbUtils.executeRawQuery(
      query,
      params,
      req.adminUser!.id
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error executing raw query:', error);
    return res.status(500).json({ 
      message: 'Error executing query',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// System Configuration Routes
founderRouter.get('/system/logs', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const actionType = req.query.actionType as string;
    
    const offset = (page - 1) * pageSize;
    
    let query = db
      .select()
      .from(adminActionLogs)
      .orderBy(desc(adminActionLogs.timestamp))
      .limit(pageSize)
      .offset(offset);
    
    if (actionType) {
      query = query.where(eq(adminActionLogs.action, actionType));
    }
    
    const logs = await query;
    
    // Count total
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(adminActionLogs);
    
    if (actionType) {
      countQuery = countQuery.where(eq(adminActionLogs.action, actionType));
    }
    
    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;
    
    return res.status(200).json({
      data: logs,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Platform messaging - send announcement to all users
founderRouter.post('/messaging/announcement', async (req: Request, res: Response) => {
  try {
    const { title, message, userTypes = ['professional', 'company'] } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    
    // Get users of the specified types
    const targetUsers = await db
      .select()
      .from(users)
      .where(
        and(
          sql`user_type = ANY(ARRAY[${userTypes}])`,
          eq(users.deleted, false)
        )
      );
    
    // Here we would send the announcement to all users
    // This would typically use a notification system or email service
    
    // For now, we'll just log the action
    await db.insert(adminActionLogs).values({
      adminId: req.adminUser!.id,
      adminUsername: req.adminUser!.username,
      action: 'PLATFORM_ANNOUNCEMENT',
      entityType: 'users',
      details: `Announcement sent to ${targetUsers.length} users: ${title}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'Unknown',
    });
    
    return res.status(200).json({ 
      message: 'Announcement scheduled for delivery',
      userCount: targetUsers.length
    });
  } catch (error) {
    console.error('Error sending announcement:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default founderRouter;