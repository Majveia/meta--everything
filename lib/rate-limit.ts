const hits = new Map<string, number[]>();

export function rateLimit(ip: string, windowMs = 60_000, max = 30): { ok: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= max) {
    hits.set(ip, timestamps);
    return { ok: false, remaining: 0 };
  }
  timestamps.push(now);
  hits.set(ip, timestamps);
  // Prune old IPs periodically
  if (hits.size > 10_000) {
    for (const [key, ts] of hits) {
      if (ts.every((t) => now - t >= windowMs)) hits.delete(key);
    }
  }
  return { ok: true, remaining: max - timestamps.length };
}
