import { fetchKick } from '@/lib/fetchers';

export async function GET() {
  const result = await fetchKick();
  return Response.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
  });
}
