import { fetchAllContent } from '@/lib/fetchers';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  const result = await fetchAllContent();
  return Response.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
  });
}
