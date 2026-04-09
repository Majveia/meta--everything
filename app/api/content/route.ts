import { fetchAllContent } from '@/lib/fetchers';

export async function GET() {
  const result = await fetchAllContent();
  return Response.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
  });
}
