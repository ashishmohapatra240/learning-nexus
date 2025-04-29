import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Flag to determine if we're using a real database or not
export let useRealDatabase = false;
export let pool: Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

// Safe database access helper function
export function getDB(): ReturnType<typeof drizzle> {
  if (!db) {
    throw new Error('Database not initialized. Use in-memory storage until database is available.');
  }
  return db;
}

// Initialize database with safe retry functionality
export const initializeDatabase = async () => {
  try {
    if (process.env.DATABASE_URL) {
      console.log("Attempting to connect to database...");
      
      if (pool) {
        try {
          await pool.end();
          console.log("Closed existing connection pool");
        } catch (err) {
          console.warn("Error closing existing pool:", err);
        }
      }
      
      pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000, // 5 second timeout for connections
        max: 10, // Maximum connections in the pool
        idleTimeoutMillis: 30000 // How long a connection can be idle before being removed
      });
      
      // Create the drizzle instance
      db = drizzle({ client: pool, schema });
      
      // Test the connection with a simple query
      try {
        await pool.query('SELECT 1');
        useRealDatabase = true;
        console.log("Database connection successfully established and tested.");
      } catch (queryError) {
        console.error("Failed to execute test query:", queryError);
        console.log("Falling back to in-memory storage.");
        useRealDatabase = false;
        await pool.end().catch(err => console.warn("Error closing pool:", err));
        pool = null;
        db = null;
      }
    } else {
      console.log("DATABASE_URL not set, using in-memory storage only.");
    }
  } catch (error) {
    console.error("Error initializing database connection:", error);
    console.log("Falling back to in-memory storage.");
    useRealDatabase = false;
    pool = null;
    db = null;
  }
};

// Initial database connection attempt
try {
  if (process.env.DATABASE_URL) {
    console.log("Attempting to connect to database...");
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Just create the drizzle instance, don't execute any queries yet
    db = drizzle({ client: pool, schema });
    
    // We'll set this to true if initialization succeeds, but we won't know until the first query
    useRealDatabase = true;
    console.log("Database connection initialized.");
  } else {
    console.log("DATABASE_URL not set, using in-memory storage only.");
  }
} catch (error) {
  console.error("Error initializing database connection:", error);
  console.log("Falling back to in-memory storage.");
  useRealDatabase = false;
  pool = null;
  db = null;
}
