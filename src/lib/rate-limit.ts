import { LRUCache } from 'lru-cache';

// This is a simple in-memory rate limiter. For a production application at scale,
// you would want to use a more robust solution like Redis.
const rateLimiters = new LRUCache<string, { count: number; expiresAt: number }>({
  max: 500, // Max number of unique users to track in a given time
  ttl: 1000 * 60, // 1 minute
});

const MAX_REQUESTS = 5; // Max 5 requests...
const WINDOW_MS = 1000 * 60; // ...per minute

export function checkRateLimit(identifier: string) {
  const now = Date.now();
  const userData = rateLimiters.get(identifier) || { count: 0, expiresAt: now + WINDOW_MS };

  if (now > userData.expiresAt) {
    // Reset if the window has expired
    userData.count = 0;
    userData.expiresAt = now + WINDOW_MS;
  }

  userData.count += 1;
  rateLimiters.set(identifier, userData);

  if (userData.count > MAX_REQUESTS) {
    throw new Error('Too many requests. Please wait a minute and try again.');
  }
}
