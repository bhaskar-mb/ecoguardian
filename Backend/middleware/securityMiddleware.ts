
import { Request, Response, NextFunction } from 'express';

// Simple in-memory registry for failed attempts (in a real app, use Redis or DB)
const loginAttempts: Record<string, { count: number, lastAttempt: number }> = {};

export const auditLog = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip;

    if (status === 401 || status === 400) {
      console.warn(`[SECURITY ALERT] Failed access attempt - IP: ${ip} | Method: ${method} | URL: ${url} | Status: ${status}`);
      
      // Track failed logins specifically
      if (url.includes('/login')) {
        const key = ip || 'unknown';
        loginAttempts[key] = {
          count: (loginAttempts[key]?.count || 0) + 1,
          lastAttempt: Date.now()
        };
        
        if (loginAttempts[key].count > 5) {
          console.error(`[CRITICAL MONITOR] High risk IP detected: ${key}. Sequential failed login attempts: ${loginAttempts[key].count}`);
        }
      }
    } else if (status >= 200 && status < 300) {
      // Normal activity logging can be more quiet
      // console.log(`[ACCESS] ${method} ${url} - ${status} - ${duration}ms`);
    }
  });
  
  next();
};

export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body) {
    return next();
  }
  // Simple check for NoSQL injection patterns in body strings
  const bodyString = JSON.stringify(req.body);
  if (bodyString && (bodyString.includes('$gt') || bodyString.includes('$ne') || bodyString.includes('{"$'))) {
    console.error(`[INJECTION ATTEMPT] Potential NoSQL injection detected from IP: ${req.ip}`);
    return res.status(400).json({ message: 'Invalid input detected.' });
  }
  next();
};
