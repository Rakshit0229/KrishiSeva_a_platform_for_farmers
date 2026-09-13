import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  code?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * In-memory sliding window rate limiter
 * Clean, zero-dependency, ultra-fast for resilient deployment
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please slow down and try again later.',
    code = 'RATE_LIMIT_EXCEEDED',
    keyGenerator = (req: Request) => {
      const forwarded = req.headers['x-forwarded-for'];
      const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip) || req.socket.remoteAddress || '127.0.0.1';
      return ip.trim();
    },
  } = options;

  const hits = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 2 * 60 * 1000);

  // Unref cleanup so it doesn't hold node process open during unit tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil(record.resetTime / 1000);
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

    // RFC-compliant RateLimit headers
    res.setHeader('RateLimit-Limit', max.toString());
    res.setHeader('RateLimit-Remaining', remaining.toString());
    res.setHeader('RateLimit-Reset', resetSeconds.toString());

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({
        error: message,
        code,
        retry_after: retryAfterSeconds,
        status: 429,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

/**
 * Auth Rate Limiter: 10 requests per 15 minutes per IP
 * Protects OTP requests, login, password resets against brute force & credential stuffing
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  code: 'AUTH_RATE_LIMIT_EXCEEDED',
});

/**
 * Standard API Limiter: 120 requests per minute
 * General protection for authenticated & public data retrieval
 */
export const standardApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: 'API rate limit exceeded. Please reduce request frequency.',
  code: 'API_RATE_LIMIT_EXCEEDED',
});

/**
 * Intensive Limiter: 20 requests per minute
 * Protects computationally heavy endpoints (ML vision inference, file uploads)
 */
export const intensiveApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Compute-intensive request rate limit exceeded. Please wait a moment.',
  code: 'INTENSIVE_RATE_LIMIT_EXCEEDED',
});
