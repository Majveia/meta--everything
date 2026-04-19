/**
 * Pure transform functions: raw API responses → ContentItem[]
 * No network calls, no side effects — just data mapping.
 */

import type { ContentItem } from './content';

// ═══ HELPERS ═══

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

// ═══ YOUTUBE ═══

interface YTVideo {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    categoryId?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

export function transformYouTube(json: { items?: YTVideo[] }): ContentItem[] {
  if (!json?.items || !Array.isArray(json.items)) return [];
  return json.items.map((v) => ({
    id: `yt-${v.id}`,
    type: 'std' as const,
    platform: 'youtube' as const,
    title: v.snippet.title,
    subtitle: `${v.snippet.channelTitle} · ${relativeTime(v.snippet.publishedAt)}`,
    author: v.snippet.channelTitle,
    time: relativeTime(v.snippet.publishedAt),
    views: v.statistics?.viewCount ? formatCount(Number(v.statistics.viewCount)) : undefined,
    likes: v.statistics?.likeCount ? formatCount(Number(v.statistics.likeCount)) : undefined,
    comments: v.statistics?.commentCount ? formatCount(Number(v.statistics.commentCount)) : undefined,
    tags: v.snippet.tags?.slice(0, 5).map((t) => t.toLowerCase()) || ['trending'],
    videoId: v.id,
    isNew: isRecent(v.snippet.publishedAt, 6),
  }));
}

// ═══ TWITCH ═══

interface TwitchStream {
  id: string;
  user_name: string;
  user_login: string;
  title: string;
  viewer_count: number;
  game_name: string;
  tags?: string[];
  started_at: string;
  thumbnail_url: string;
}

export function transformTwitch(json: { data?: TwitchStream[] }): ContentItem[] {
  if (!json?.data || !Array.isArray(json.data)) return [];
  return json.data.map((s) => ({
    id: `tw-${s.id}`,
    type: 'live' as const,
    platform: 'twitch' as const,
    title: s.title,
    subtitle: `${s.game_name} · Live`,
    author: s.user_name,
    viewers: formatCount(s.viewer_count),
    channelId: s.user_login,
    tags: [s.game_name.toLowerCase(), ...(s.tags?.slice(0, 3).map((t) => t.toLowerCase()) || [])],
    isLive: true,
    time: relativeTime(s.started_at),
  }));
}

// ═══ X / TWITTER ═══

interface XTweet {
  id: string;
  text: string;
  created_at?: string;
  author_id?: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
}

interface XUser {
  id: string;
  username: string;
  name: string;
}

export function transformX(
  json: { data?: XTweet[]; includes?: { users?: XUser[] } }
): ContentItem[] {
  if (!json?.data || !Array.isArray(json.data)) return [];
  const userMap = new Map<string, XUser>();
  json.includes?.users?.forEach((u) => userMap.set(u.id, u));

  return json.data.map((t) => {
    const user = t.author_id ? userMap.get(t.author_id) : undefined;
    const hashtags = t.text.match(/#\w+/g)?.map((h) => h.slice(1).toLowerCase()) || [];
    return {
      id: `x-${t.id}`,
      type: 'compact' as const,
      platform: 'x' as const,
      title: t.text.length > 80 ? t.text.slice(0, 80) + '…' : t.text,
      subtitle: t.text,
      author: user?.name || user?.username || 'Unknown',
      time: t.created_at ? relativeTime(t.created_at) : undefined,
      views: t.public_metrics ? formatCount(t.public_metrics.impression_count) : undefined,
      likes: t.public_metrics ? formatCount(t.public_metrics.like_count) : undefined,
      comments: t.public_metrics ? formatCount(t.public_metrics.reply_count) : undefined,
      tags: hashtags.length > 0 ? hashtags : ['trending'],
    };
  });
}

// ═══ SUBSTACK (RSS XML) ═══

export function transformSubstack(xml: string, publication: string): ContentItem[] {
  const items: ContentItem[] = [];
  // Extract <item> blocks
  const itemBlocks = xml.split('<item>').slice(1);

  for (let i = 0; i < Math.min(itemBlocks.length, 5); i++) {
    const block = itemBlocks[i];
    const title = extractTag(block, 'title');
    const description = extractTag(block, 'description');
    const pubDate = extractTag(block, 'pubDate');
    const creator = extractTag(block, 'dc:creator') || publication;
    const link = extractTag(block, 'link');

    if (!title) continue;

    items.push({
      id: `ss-${publication}-${i}`,
      type: 'std' as const,
      platform: 'substack' as const,
      title: decodeHTML(title),
      subtitle: description ? decodeHTML(description).slice(0, 120) : `From ${publication}`,
      extra: link || undefined,
      author: decodeHTML(creator),
      time: pubDate ? relativeTime(new Date(pubDate).toISOString()) : undefined,
      tags: ['writing', publication.toLowerCase()],
    });
  }
  return items;
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA wrapped content
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();
  // Handle plain content
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const plainMatch = xml.match(plainRe);
  return plainMatch ? plainMatch[1].trim() : null;
}

function decodeHTML(s: string): string {
  return s
    // UTF-8 mojibake fix (common when UTF-8 bytes decoded as Windows-1252)
    .replace(/\u00e2\u20ac\u2122/g, '\u2019') // '
    .replace(/\u00e2\u20ac\u0153/g, '\u201C') // "
    .replace(/\u00e2\u20ac\u009d/g, '\u201D') // "
    .replace(/\u00e2\u20ac\u201c/g, '\u2014') // —
    .replace(/\u00e2\u20ac\u201d/g, '\u2014') // —
    .replace(/\u00e2\u20ac\u00a6/g, '\u2026') // …
    .replace(/\u00c2\u00a0/g, ' ')             // non-breaking space
    // Standard HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&hellip;/g, '\u2026')
    .replace(/<[^>]+>/g, ''); // strip any remaining HTML tags
}

// ═══ KICK ═══

interface KickChannel {
  id: number;
  slug: string;
  user: { username: string };
  livestream?: {
    id: number;
    session_title: string;
    viewer_count: number;
    is_live: boolean;
    categories?: Array<{ name: string }>;
  };
}

export function transformKick(json: KickChannel | null, slug: string): ContentItem[] {
  if (!json?.livestream?.is_live) return [];
  const ls = json.livestream;
  return [{
    id: `ki-${slug}`,
    type: 'live' as const,
    platform: 'kick' as const,
    title: ls.session_title || `${json.user.username} is live`,
    subtitle: ls.categories?.[0]?.name || 'Live on Kick',
    author: json.user.username,
    viewers: formatCount(ls.viewer_count),
    channelId: slug,
    tags: ls.categories?.map((c) => c.name.toLowerCase()) || ['gaming'],
    isLive: true,
  }];
}

// ═══ UTILS ═══

function isRecent(isoDate: string, hours: number): boolean {
  return Date.now() - new Date(isoDate).getTime() < hours * 60 * 60 * 1000;
}
