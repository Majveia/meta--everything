import { NextRequest } from 'next/server';
import { fetchAllContent } from '@/lib/fetchers';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validateEnv } from '@/lib/env';

// Validate env config once on first request
validateEnv();

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { allowed, remaining } = rateLimit(`content:${ip}`, { maxRequests: 20, windowMs: 60_000 });

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' } }
    );
  }

  const result = await fetchAllContent();
  return Response.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120',
      'X-RateLimit-Remaining': String(remaining),
    },
  });
}
