import { NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const YT_KEY = process.env.YOUTUBE_API_KEY || '';
const VALID_SORT = new Set(['relevance', 'recent', 'time']);
const VIDEO_ID_RE = /^[\w-]{6,20}$/;

interface YTComment {
  id: string;
  author: string;
  authorImage: string;
  text: string;
  likes: number;
  publishedAt: string;
  replies: number;
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { allowed } = rateLimit(`comments:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) {
    return Response.json({ comments: [], source: 'error', error: 'Too many requests' }, { status: 429 });
  }

  const videoId = req.nextUrl.searchParams.get('videoId');
  const sort = req.nextUrl.searchParams.get('sort') || 'relevance';

  if (!videoId || !YT_KEY) {
    return Response.json({ comments: [], source: 'none' });
  }

  if (!VIDEO_ID_RE.test(videoId)) {
    return Response.json({ comments: [], source: 'error', error: 'Invalid video ID' }, { status: 400 });
  }

  if (!VALID_SORT.has(sort)) {
    return Response.json({ comments: [], source: 'error', error: 'Invalid sort parameter' }, { status: 400 });
  }

  try {
    const order = sort === 'recent' || sort === 'time' ? 'time' : 'relevance';
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${encodeURIComponent(videoId)}&order=${order}&maxResults=20&textFormat=plainText&key=${YT_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) });

    if (!res.ok) {
      return Response.json({ comments: [], source: 'error', error: res.statusText });
    }

    const data = await res.json();
    const comments: YTComment[] = (data.items || []).map((item: Record<string, unknown>) => {
      const s = (item.snippet as Record<string, unknown>)?.topLevelComment as Record<string, unknown>;
      const snip = (s?.snippet || {}) as Record<string, unknown>;
      return {
        id: item.id as string,
        author: (snip.authorDisplayName as string) || 'Unknown',
        authorImage: (snip.authorProfileImageUrl as string) || '',
        text: (snip.textDisplay as string) || '',
        likes: (snip.likeCount as number) || 0,
        publishedAt: (snip.publishedAt as string) || '',
        replies: ((item.snippet as Record<string, unknown>)?.totalReplyCount as number) || 0,
      };
    });

    return Response.json(
      { comments, source: 'youtube', total: data.pageInfo?.totalResults || comments.length },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' } }
    );
  } catch {
    return Response.json({ comments: [], source: 'error' });
  }
}
