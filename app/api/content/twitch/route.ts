import { fetchTwitch } from '@/lib/fetchers';

export async function GET() {
  const result = await fetchTwitch();
  return Response.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
  });
}
