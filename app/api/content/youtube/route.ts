import { fetchYouTube } from '@/lib/fetchers';

export async function GET() {
  const result = await fetchYouTube();
  return Response.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' },
  });
}
