import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store per rate-limiting prefix
const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Memory-efficient sliding-window rate limiter.
 * @param key Unique identifier (IP address, user email, or session token)
 * @param prefix Action namespace (e.g. "login", "enquiries", "api")
 * @param maxRequests Maximum allowable requests in the window
 * @param windowMs Time window in milliseconds (default: 60,000 ms = 1 minute)
 */
export function checkRateLimit(
  key: string,
  prefix: string,
  maxRequests: number,
  windowMs: number = 60000
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
} {
  const now = Date.now();

  if (!rateLimitStores.has(prefix)) {
    rateLimitStores.set(prefix, new Map<string, RateLimitRecord>());
  }
  const store = rateLimitStores.get(prefix)!;

  // Cleanup expired entries periodically
  if (store.size > 2000) {
    for (const [k, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(k);
      }
    }
  }

  const record = store.get(key);

  if (!record || record.resetAt <= now) {
    // New or expired window
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= maxRequests) {
    // Limit exceeded
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  // Increment within window
  record.count += 1;
  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    resetSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Extracts best client IP address from Next.js request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // If multiple IPs are forwarded, take the first client IP
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

