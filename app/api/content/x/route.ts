import { fetchX } from '@/lib/fetchers';

export async function GET() {
  const result = await fetchX();
  return Response.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' },
  });
}
