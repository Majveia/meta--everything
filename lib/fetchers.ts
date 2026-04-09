/**
 * Server-side fetcher functions for each platform.
 * Each reads env vars at call time, fetches, transforms, and returns.
 * Only imported from app/api/ route handlers (server-side context).
 */

import type { ContentItem } from './content';
import {
  transformYouTube,
  transformTwitch,
  transformX,
  transformSubstack,
  transformKick,
} from './transforms';

export interface FetchResult {
  items: ContentItem[];
  source: 'api' | 'unconfigured' | 'error';
  error?: string;
}

/** Default timeout for all external API calls */
const API_TIMEOUT = 8000;

// ═══ YOUTUBE ═══

export async function fetchYouTube(): Promise<FetchResult> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { items: [], source: 'unconfigured' };

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=10&key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(API_TIMEOUT) });
    if (!res.ok) throw new Error(`YouTube API ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return { items: transformYouTube(json), source: 'api' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[YouTube]', msg);
    return { items: [], source: 'error', error: msg };
  }
}

// ═══ TWITCH ═══

const TWITCH_USER = process.env.TWITCH_USERNAME || 'majveia';

async function twitchGet(path: string, clientId: string, token: string) {
  const res = await fetch(`https://api.twitch.tv/helix/${path}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Client-ID': clientId },
    signal: AbortSignal.timeout(API_TIMEOUT),
  });
  if (!res.ok) throw new Error(`Twitch ${path} ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function fetchTwitch(): Promise<FetchResult> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = process.env.TWITCH_ACCESS_TOKEN;
  if (!clientId || !token) return { items: [], source: 'unconfigured' };

  try {
    // Step 1: Get user ID for majveia
    const userJson = await twitchGet(`users?login=${TWITCH_USER}`, clientId, token);
    const userId = userJson.data?.[0]?.id;
    if (!userId) throw new Error(`Twitch user "${TWITCH_USER}" not found`);

    // Step 2: Get followed channels
    const followsJson = await twitchGet(`channels/followed?user_id=${userId}&first=50`, clientId, token);
    const followedIds: string[] = (followsJson.data || []).map((f: { broadcaster_id: string }) => f.broadcaster_id);
    if (followedIds.length === 0) throw new Error('No followed channels');

    // Step 3: Check which followed channels are live
    // API supports up to 100 user_ids at once
    const liveParams = followedIds.slice(0, 100).map((id) => `user_id=${id}`).join('&');
    const liveJson = await twitchGet(`streams?${liveParams}&first=20`, clientId, token);

    return { items: transformTwitch(liveJson), source: 'api' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[Twitch]', msg);
    // Fallback: fetch top streams if follows fail
    try {
      const fallback = await fetch('https://api.twitch.tv/helix/streams?first=10', {
        headers: { 'Authorization': `Bearer ${token}`, 'Client-ID': clientId },
        signal: AbortSignal.timeout(API_TIMEOUT),
      });
      if (fallback.ok) {
        const json = await fallback.json();
        return { items: transformTwitch(json), source: 'api' };
      }
    } catch { /* ignore fallback errors */ }
    return { items: [], source: 'error', error: msg };
  }
}

// ═══ X / TWITTER ═══

export async function fetchX(): Promise<FetchResult> {
  const token = process.env.X_API_BEARER_TOKEN;
  if (!token) return { items: [], source: 'unconfigured' };

  const accounts = (process.env.X_ACCOUNTS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (accounts.length === 0) return { items: [], source: 'unconfigured' };

  try {
    // Step 1: Look up user IDs from usernames
    const lookupRes = await fetch(
      `https://api.x.com/2/users/by?usernames=${accounts.join(',')}`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(API_TIMEOUT) }
    );
    if (!lookupRes.ok) throw new Error(`X user lookup ${lookupRes.status}: ${lookupRes.statusText}`);
    const lookupJson = await lookupRes.json();
    const users: Array<{ id: string; username: string; name: string }> = lookupJson.data || [];

    // Step 2: Fetch recent tweets from each user's timeline
    const tweetFields = 'created_at,public_metrics,author_id';
    const results = await Promise.allSettled(
      users.map(async (user) => {
        const params = new URLSearchParams({
          max_results: '5',
          'tweet.fields': tweetFields,
          exclude: 'retweets,replies',
        });
        const res = await fetch(
          `https://api.x.com/2/users/${user.id}/tweets?${params}`,
          { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(API_TIMEOUT) }
        );
        if (!res.ok) return { data: [], includes: { users: [user] } };
        const json = await res.json();
        // Inject user info into includes for the transform
        return {
          data: json.data || [],
          includes: { users: [{ id: user.id, username: user.username, name: user.name }] },
        };
      })
    );

    // Step 3: Merge all tweets + transform
    const allTweets: { data: unknown[]; includes: { users: unknown[] } } = { data: [], includes: { users: [] } };
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.data?.length > 0) {
        allTweets.data.push(...r.value.data);
        allTweets.includes.users.push(...r.value.includes.users);
      }
    }

    if (allTweets.data.length === 0) throw new Error('No tweets returned from any account');
    return { items: transformX(allTweets as Parameters<typeof transformX>[0]), source: 'api' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[X]', msg);
    return { items: [], source: 'error', error: msg };
  }
}

// ═══ SUBSTACK ═══

export async function fetchSubstack(): Promise<FetchResult> {
  const pubs = (process.env.SUBSTACK_PUBLICATIONS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (pubs.length === 0) return { items: [], source: 'unconfigured' };

  try {
    const results = await Promise.allSettled(
      pubs.map(async (slug) => {
        const res = await fetch(`https://${slug}.substack.com/feed`, {
          headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
          signal: AbortSignal.timeout(API_TIMEOUT),
        });
        if (!res.ok) throw new Error(`Substack ${slug}: ${res.status}`);
        const buf = await res.arrayBuffer();
        const xml = new TextDecoder('utf-8').decode(buf);
        return transformSubstack(xml, slug);
      })
    );

    const items: ContentItem[] = [];
    const errors: string[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') items.push(...r.value);
      else errors.push(r.reason?.message || 'Unknown');
    }
    if (items.length > 0) return { items, source: 'api' };
    return { items: [], source: 'error', error: errors.join('; ') || 'No items returned' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[Substack]', msg);
    return { items: [], source: 'error', error: msg };
  }
}

// ═══ KICK ═══

export async function fetchKick(): Promise<FetchResult> {
  const channels = (process.env.KICK_CHANNELS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (channels.length === 0) return { items: [], source: 'unconfigured' };

  try {
    const results = await Promise.allSettled(
      channels.map(async (slug) => {
        const res = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
          signal: AbortSignal.timeout(API_TIMEOUT),
        });
        if (!res.ok) throw new Error(`Kick ${slug}: ${res.status}`);
        const json = await res.json();
        return transformKick(json, slug);
      })
    );

    const items: ContentItem[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') items.push(...r.value);
    }
    return { items, source: items.length > 0 ? 'api' : 'error' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[Kick]', msg);
    return { items: [], source: 'error', error: msg };
  }
}

// ═══ AGGREGATOR ═══

export type PlatformSources = Record<string, 'api' | 'unconfigured' | 'error'>;

export async function fetchAllContent(): Promise<{ items: ContentItem[]; sources: PlatformSources }> {
  const [yt, tw, x, ss, ki] = await Promise.allSettled([
    fetchYouTube(),
    fetchTwitch(),
    fetchX(),
    fetchSubstack(),
    fetchKick(),
  ]);

  const extract = (r: PromiseSettledResult<FetchResult>): FetchResult =>
    r.status === 'fulfilled' ? r.value : { items: [], source: 'error' as const };

  const ytR = extract(yt);
  const twR = extract(tw);
  const xR = extract(x);
  const ssR = extract(ss);
  const kiR = extract(ki);

  return {
    items: [...ytR.items, ...twR.items, ...xR.items, ...ssR.items, ...kiR.items],
    sources: {
      youtube: ytR.source,
      twitch: twR.source,
      x: xR.source,
      substack: ssR.source,
      kick: kiR.source,
    },
  };
}
