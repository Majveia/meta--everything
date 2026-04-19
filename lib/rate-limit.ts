/**
 * Simple in-memory sliding-window rate limiter for API routes.
 * Keyed by IP address (or a fallback identifier).
 */

interface Entry {
  timestamps: number[];
}

const store = new Map<string, Entry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export function rateLimit(
  key: string,
  { maxRequests = 30, windowMs = 60_000 }: { maxRequests?: number; windowMs?: number } = {}
): { allowed: boolean; remaining: number } {
  cleanup(windowMs);
  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: maxRequests - entry.timestamps.length };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
