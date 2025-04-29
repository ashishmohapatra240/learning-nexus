import { Request, Response, NextFunction } from 'express';

interface RateLimiterRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

// Simple in-memory rate limiter implementation
const requests = new Map<string, RateLimiterRecord>();

// Rate limit configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // 100 requests per window
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes block if limit exceeded

/**
 * Basic rate limiter for admin authentication endpoints
 */
export const adminAuthRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Get client IP
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Get existing record or create a new one
  const record = requests.get(ip) || {
    count: 0,
    resetAt: now + WINDOW_MS
  };
  
  // Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
    return res.status(429).json({
      message: `Too many requests. Please try again in ${remainingMinutes} minutes.`
    });
  }
  
  // Reset counter if window expired
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + WINDOW_MS;
    delete record.blockedUntil;
  }
  
  // Increment counter
  record.count++;
  
  // Check if limit exceeded
  if (record.count > MAX_REQUESTS) {
    record.blockedUntil = now + BLOCK_DURATION;
    const remainingMinutes = Math.ceil(BLOCK_DURATION / 60000);
    return res.status(429).json({
      message: `Rate limit exceeded. Please try again in ${remainingMinutes} minutes.`
    });
  }
  
  // Update the record in the map
  requests.set(ip, record);
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - record.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));
  
  next();
};