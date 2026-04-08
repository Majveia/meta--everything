import { NextRequest } from 'next/server';

const YT_KEY = process.env.YOUTUBE_API_KEY || '';

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
  const videoId = req.nextUrl.searchParams.get('videoId');
  const sort = req.nextUrl.searchParams.get('sort') || 'relevance'; // relevance | time

  if (!videoId || !YT_KEY) {
    return Response.json({ comments: [], source: 'none' });
  }

  try {
    const order = sort === 'recent' ? 'time' : 'relevance';
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&order=${order}&maxResults=20&textFormat=plainText&key=${YT_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

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
