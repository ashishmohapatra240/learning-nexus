import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { adminUsers, adminActionLogs } from '../schema/admin.schema';
import { AdminRole } from '../types/admin.types';
import { checkIsFounder } from '../middlewares/founder-auth.middleware';

/**
 * Safe database operation helper for founder access
 * Allows founders to bypass normal database restrictions
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  adminId?: number,
  entityType?: string,
  entityId?: number,
  description?: string
): Promise<T> {
  try {
    // Check if the operation is being performed by a founder
    const isFounder = adminId ? await checkIsFounder(adminId) : false;
    
    // Execute the operation
    const result = await operation();
    
    // Log the operation if performed by an admin
    if (adminId) {
      const [admin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, adminId));
      
      if (admin) {
        await db.insert(adminActionLogs).values({
          adminId,
          adminUsername: admin.username,
          action: isFounder ? 'FOUNDER_DB_OPERATION' : 'ADMIN_DB_OPERATION',
          entityType: entityType || 'unknown',
          entityId: entityId || null,
          details: description || 'Database operation performed',
          ipAddress: 'internal',
          userAgent: 'system',
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  }
}

/**
 * Direct database management utilities for founders
 */
export const founderDbUtils = {
  /**
   * Execute a raw query (USE WITH CAUTION)
   */
  async executeRawQuery(query: string, params: any[], adminId: number): Promise<any> {
    // Verify this is being called by a founder
    const isFounder = await checkIsFounder(adminId);
    if (!isFounder) {
      throw new Error('Only founders can execute raw queries');
    }
    
    // Log this high-risk operation
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, adminId));
    
    await db.insert(adminActionLogs).values({
      adminId,
      adminUsername: admin?.username || 'unknown',
      action: 'RAW_QUERY_EXECUTION',
      entityType: 'database',
      details: `Raw query executed: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`,
      ipAddress: 'internal',
      userAgent: 'system',
    });
    
    // Execute the raw query
    const result = await db.execute(query, params);
    return result;
  },
  
  /**
   * Get database schema information
   */
  async getDatabaseSchema(adminId: number): Promise<any> {
    const isFounder = await checkIsFounder(adminId);
    if (!isFounder) {
      throw new Error('Only founders can access schema information');
    }
    
    // This is PostgreSQL specific
    const result = await db.execute(`
      SELECT 
        table_name, 
        column_name, 
        data_type
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, 
        ordinal_position
    `);
    
    return result;
  },
  
  /**
   * Get table data with pagination
   */
  async getTableData(tableName: string, page: number = 1, pageSize: number = 100, adminId: number): Promise<any> {
    const isFounder = await checkIsFounder(adminId);
    if (!isFounder) {
      throw new Error('Only founders can directly access table data');
    }
    
    // Sanitize table name to prevent SQL injection
    const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    
    const offset = (page - 1) * pageSize;
    
    const result = await db.execute(`
      SELECT * FROM "${safeTableName}"
      LIMIT ${pageSize} OFFSET ${offset}
    `);
    
    const countResult = await db.execute(`
      SELECT COUNT(*) as total FROM "${safeTableName}"
    `);
    
    return {
      data: result,
      meta: {
        page,
        pageSize,
        total: parseInt(countResult[0]?.total || '0'),
        totalPages: Math.ceil(parseInt(countResult[0]?.total || '0') / pageSize)
      }
    };
  },
  
  /**
   * Update a record directly
   */
  async updateRecord(
    tableName: string, 
    id: number, 
    data: Record<string, any>,
    adminId: number
  ): Promise<any> {
    const isFounder = await checkIsFounder(adminId);
    if (!isFounder) {
      throw new Error('Only founders can directly update records');
    }
    
    // Sanitize table name to prevent SQL injection
    const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Build SET clause
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    Object.entries(data).forEach(([key, value]) => {
      // Sanitize column name
      const safeColumnName = key.replace(/[^a-zA-Z0-9_]/g, '');
      setClauses.push(`"${safeColumnName}" = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });
    
    values.push(id);
    
    const query = `
      UPDATE "${safeTableName}"
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await db.execute(query, values);
    
    // Log the direct update
    await db.insert(adminActionLogs).values({
      adminId,
      adminUsername: (await db.select().from(adminUsers).where(eq(adminUsers.id, adminId)))[0]?.username || 'unknown',
      action: 'DIRECT_RECORD_UPDATE',
      entityType: safeTableName,
      entityId: id,
      details: `Founder directly updated record in ${safeTableName} with ID ${id}`,
      ipAddress: 'internal',
      userAgent: 'system',
    });
    
    return result;
  }
};