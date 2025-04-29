import { Request, Response, NextFunction } from 'express';
import { getDB } from '../../db';
import { users } from '../../../shared/schema';

/**
 * Middleware to log admin activities for audit purposes
 */
export const adminActivityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Capture original end method
  const originalEnd = res.end;
  
  // Replace end method with custom implementation
  res.end = function(...args: any[]) {
    // Call original end method with all arguments
    originalEnd.apply(res, args);
    
    try {
      // Only log if a user is authenticated and the request was successful
      if (req.adminUser && res.statusCode < 400) {
        const action = getActionType(req.method, req.path);
        const resourceType = getResourceType(req.path);
        const resourceId = getResourceId(req.path);
        
        // Log to database asynchronously
        logActivity({
          userId: req.adminUser.id,
          action,
          resourceType,
          resourceId,
          details: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            query: req.query,
            body: sanitizeBody(req.body),
            params: req.params
          },
          ip: req.ip || req.socket.remoteAddress || 'unknown'
        }).catch(err => {
          console.error('Failed to log admin activity:', err);
        });
      }
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Error in admin activity logger:', error);
    }
    
    return res;
  };
  
  next();
};

/**
 * Determine the action type based on HTTP method and path
 */
function getActionType(method: string, path: string): string {
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  
  switch (method) {
    case 'GET': return 'VIEW';
    case 'POST': return path.includes('/search') ? 'SEARCH' : 'CREATE';
    case 'PUT': 
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'OTHER';
  }
}

/**
 * Extract the resource type from the path
 */
function getResourceType(path: string): string {
  const parts = path.split('/').filter(Boolean);
  
  // Handle special cases
  if (parts.includes('auth')) return 'AUTH';
  
  // For typical REST paths like /api/admin/users, return 'users'
  if (parts.length >= 2) {
    return parts[1].toUpperCase();
  }
  
  return 'SYSTEM';
}

/**
 * Extract resource ID if present in the path
 */
function getResourceId(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  
  // Look for numeric IDs in the path
  for (let i = 0; i < parts.length; i++) {
    if (/^\d+$/.test(parts[i])) {
      return parts[i];
    }
  }
  
  return null;
}

/**
 * Sanitize the request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'key'];
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Log activity to the database
 */
async function logActivity(data: {
  userId: number;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: any;
  ip: string;
}) {
  // For now, we'll just log to console since we don't have a dedicated table
  console.log('Admin activity:', {
    timestamp: new Date(),
    ...data
  });
  
  // When we have a dedicated table, we would insert there
  /* 
  await getDB().insert(adminActivityLogs).values({
    userId: data.userId,
    action: data.action,
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    details: data.details,
    ip: data.ip,
    timestamp: new Date()
  });
  */
}