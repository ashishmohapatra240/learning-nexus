import { z } from "zod";

// Admin roles with hierarchy:
// Founder > SuperAdmin > Admin > Moderator > Analyst
export enum AdminRole {
  FOUNDER = "founder",
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MODERATOR = "moderator",
  ANALYST = "analyst"
}

// Permission sets for granular access control
export enum AdminPermission {
  // User Management
  READ_USERS = "read_users",
  CREATE_USERS = "create_users",
  UPDATE_USERS = "update_users",
  DELETE_USERS = "delete_users",
  IMPERSONATE_USERS = "impersonate_users",
  
  // Professional Management
  READ_PROFESSIONALS = "read_professionals",
  UPDATE_PROFESSIONALS = "update_professionals",
  VERIFY_PROFESSIONALS = "verify_professionals",
  FEATURE_PROFESSIONALS = "feature_professionals",
  
  // Company Management
  READ_COMPANIES = "read_companies",
  UPDATE_COMPANIES = "update_companies",
  VERIFY_COMPANIES = "verify_companies",
  FEATURE_COMPANIES = "feature_companies",
  
  // Job Management
  READ_JOBS = "read_jobs",
  UPDATE_JOBS = "update_jobs",
  APPROVE_JOBS = "approve_jobs",
  DELETE_JOBS = "delete_jobs",
  
  // Resource Management
  READ_RESOURCES = "read_resources",
  CREATE_RESOURCES = "create_resources",
  UPDATE_RESOURCES = "update_resources",
  DELETE_RESOURCES = "delete_resources",
  MANAGE_CATEGORIES = "manage_categories",
  
  // Financial Management
  VIEW_TRANSACTIONS = "view_transactions",
  PROCESS_REFUNDS = "process_refunds",
  MANAGE_SUBSCRIPTIONS = "manage_subscriptions",
  OVERRIDE_PAYMENTS = "override_payments",
  
  // Analytics & Settings
  VIEW_ANALYTICS = "view_analytics",
  EXPORT_DATA = "export_data",
  MANAGE_SETTINGS = "manage_settings",
  
  // Platform Control (Founder Only)
  MANAGE_ADMINS = "manage_admins",
  SYSTEM_CONFIGURATION = "system_configuration",
  DATABASE_ACCESS = "database_access",
  AI_CONFIGURATION = "ai_configuration",
  PLATFORM_MESSAGING = "platform_messaging",
  VIEW_LOGS = "view_logs",
  MANAGE_API_KEYS = "manage_api_keys"
}

// Define the role-permission mappings
export const RolePermissions: Record<AdminRole, AdminPermission[]> = {
  // Founder has absolute access to everything
  [AdminRole.FOUNDER]: Object.values(AdminPermission),
  
  // Super Admin has all standard permissions but not some founder-only permissions
  [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission).filter(
    perm => ![
      AdminPermission.DATABASE_ACCESS,
      AdminPermission.MANAGE_API_KEYS,
      AdminPermission.SYSTEM_CONFIGURATION
    ].includes(perm)
  ),
  
  [AdminRole.ADMIN]: [
    // User Management (limited)
    AdminPermission.READ_USERS,
    AdminPermission.UPDATE_USERS,
    
    // Professional Management
    AdminPermission.READ_PROFESSIONALS,
    AdminPermission.UPDATE_PROFESSIONALS,
    AdminPermission.VERIFY_PROFESSIONALS,
    AdminPermission.FEATURE_PROFESSIONALS,
    
    // Company Management
    AdminPermission.READ_COMPANIES,
    AdminPermission.UPDATE_COMPANIES,
    AdminPermission.VERIFY_COMPANIES,
    AdminPermission.FEATURE_COMPANIES,
    
    // Job Management
    AdminPermission.READ_JOBS,
    AdminPermission.UPDATE_JOBS,
    AdminPermission.APPROVE_JOBS,
    AdminPermission.DELETE_JOBS,
    
    // Resource Management
    AdminPermission.READ_RESOURCES,
    AdminPermission.CREATE_RESOURCES,
    AdminPermission.UPDATE_RESOURCES,
    AdminPermission.DELETE_RESOURCES,
    AdminPermission.MANAGE_CATEGORIES,
    
    // Financial Management
    AdminPermission.VIEW_TRANSACTIONS,
    AdminPermission.PROCESS_REFUNDS,
    AdminPermission.MANAGE_SUBSCRIPTIONS,
    
    // Analytics & Settings
    AdminPermission.VIEW_ANALYTICS,
    AdminPermission.EXPORT_DATA,
    AdminPermission.MANAGE_SETTINGS
  ],
  [AdminRole.MODERATOR]: [
    // User Management (view only)
    AdminPermission.READ_USERS,
    
    // Professional Management
    AdminPermission.READ_PROFESSIONALS,
    AdminPermission.UPDATE_PROFESSIONALS,
    AdminPermission.VERIFY_PROFESSIONALS,
    
    // Company Management
    AdminPermission.READ_COMPANIES,
    AdminPermission.UPDATE_COMPANIES,
    AdminPermission.VERIFY_COMPANIES,
    
    // Job Management
    AdminPermission.READ_JOBS,
    AdminPermission.UPDATE_JOBS,
    AdminPermission.APPROVE_JOBS,
    
    // Resource Management
    AdminPermission.READ_RESOURCES,
    AdminPermission.UPDATE_RESOURCES,
    
    // Analytics
    AdminPermission.VIEW_ANALYTICS
  ],
  [AdminRole.ANALYST]: [
    // Read-only permissions
    AdminPermission.READ_USERS,
    AdminPermission.READ_PROFESSIONALS,
    AdminPermission.READ_COMPANIES,
    AdminPermission.READ_JOBS,
    AdminPermission.READ_RESOURCES,
    AdminPermission.VIEW_TRANSACTIONS,
    AdminPermission.VIEW_ANALYTICS,
    AdminPermission.EXPORT_DATA
  ]
};

// Admin User Interface
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  customPermissions?: AdminPermission[]; // For special cases
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  password: string;
  bypassRestrictions?: boolean; // For founder to bypass all restrictions
  accessLevel?: number; // 100 = founder
  canImpersonateUsers?: boolean;
}

// Founder-specific interface
export interface FounderUser extends AdminUser {
  role: AdminRole.FOUNDER;
  bypassRestrictions: true;
  accessLevel: 100;
  canImpersonateUsers: true;
}

// Admin Action Log Interface
export interface AdminActionLog {
  id: number;
  adminId: number;
  adminUsername: string;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Authentication Types
export interface AdminLoginCredentials {
  email: string;
  password: string;
  totpCode?: string; // For 2FA
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  adminUser: Omit<AdminUser, 'password'>;
}

// Zod Schemas for Validation
export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totpCode: z.string().optional()
});

export const adminCreateSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  role: z.nativeEnum(AdminRole)
});

export const adminUpdateSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(AdminRole).optional(),
  customPermissions: z.array(z.nativeEnum(AdminPermission)).optional(),
  isActive: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional()
});

// Helper Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}