import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables before importing fetchers
const env = {
  YOUTUBE_API_KEY: 'test-yt-key',
  TWITCH_CLIENT_ID: 'test-twitch-id',
  TWITCH_ACCESS_TOKEN: 'test-twitch-token',
  TWITCH_USERNAME: 'testuser',
  X_API_BEARER_TOKEN: 'test-x-token',
  X_ACCOUNTS: 'user1,user2',
  SUBSTACK_PUBLICATIONS: 'testpub',
  KICK_CHANNELS: 'testchannel',
};

// We need to mock process.env before importing
vi.stubEnv('YOUTUBE_API_KEY', env.YOUTUBE_API_KEY);
vi.stubEnv('TWITCH_CLIENT_ID', env.TWITCH_CLIENT_ID);
vi.stubEnv('TWITCH_ACCESS_TOKEN', env.TWITCH_ACCESS_TOKEN);
vi.stubEnv('TWITCH_USERNAME', env.TWITCH_USERNAME);
vi.stubEnv('X_API_BEARER_TOKEN', env.X_API_BEARER_TOKEN);
vi.stubEnv('X_ACCOUNTS', env.X_ACCOUNTS);
vi.stubEnv('SUBSTACK_PUBLICATIONS', env.SUBSTACK_PUBLICATIONS);
vi.stubEnv('KICK_CHANNELS', env.KICK_CHANNELS);

import {
  fetchYouTube,
  fetchTwitch,
  fetchX,
  fetchSubstack,
  fetchKick,
  fetchAllContent,
} from '@/lib/fetchers';

// ═══ SHARED SETUP ═══

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  // Re-stub env vars for next test
  Object.entries(env).forEach(([k, v]) => vi.stubEnv(k, v));
});

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

function textResponse(text: string, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    arrayBuffer: () => Promise.resolve(new TextEncoder().encode(text).buffer),
    text: () => Promise.resolve(text),
  });
}

// ═══ fetchYouTube ═══

describe('fetchYouTube', () => {
  it('returns unconfigured when API key is missing', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', '');
    // Need to re-import to pick up the env change - but since fetchers read env at call time, we can use unstub
    // Actually, the fetcher reads process.env at call time, so we need to clear it
    delete process.env.YOUTUBE_API_KEY;

    const result = await fetchYouTube();
    expect(result.source).toBe('unconfigured');
    expect(result.items).toEqual([]);
  });

  it('fetches and transforms YouTube videos', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'test-key');
    process.env.YOUTUBE_API_KEY = 'test-key';

    mockFetch.mockReturnValueOnce(jsonResponse({
      items: [{
        id: 'vid1',
        snippet: {
          title: 'Test Video',
          channelTitle: 'TestChannel',
          publishedAt: '2026-04-08T10:00:00Z',
          tags: ['tech'],
        },
        statistics: { viewCount: '1000', likeCount: '50', commentCount: '10' },
      }],
    }));

    const result = await fetchYouTube();
    expect(result.source).toBe('api');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('yt-vid1');
  });

  it('returns error when API call fails', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'test-key');
    process.env.YOUTUBE_API_KEY = 'test-key';

    mockFetch.mockReturnValueOnce(jsonResponse({}, 403));

    const result = await fetchYouTube();
    expect(result.source).toBe('error');
    expect(result.error).toContain('403');
  });
});

// ═══ fetchKick ═══

describe('fetchKick', () => {
  it('returns unconfigured when no channels set', async () => {
    vi.stubEnv('KICK_CHANNELS', '');
    delete process.env.KICK_CHANNELS;

    const result = await fetchKick();
    expect(result.source).toBe('unconfigured');
  });

  it('fetches live Kick channels', async () => {
    vi.stubEnv('KICK_CHANNELS', 'streamer1');
    process.env.KICK_CHANNELS = 'streamer1';

    mockFetch.mockReturnValueOnce(jsonResponse({
      id: 1,
      slug: 'streamer1',
      user: { username: 'Streamer1' },
      livestream: {
        id: 100,
        session_title: 'Gaming Session',
        viewer_count: 5000,
        is_live: true,
        categories: [{ name: 'Valorant' }],
      },
    }));

    const result = await fetchKick();
    expect(result.source).toBe('api');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].platform).toBe('kick');
  });
});

// ═══ fetchSubstack ═══

describe('fetchSubstack', () => {
  it('returns unconfigured when no publications set', async () => {
    vi.stubEnv('SUBSTACK_PUBLICATIONS', '');
    delete process.env.SUBSTACK_PUBLICATIONS;

    const result = await fetchSubstack();
    expect(result.source).toBe('unconfigured');
  });

  it('fetches and parses RSS feed', async () => {
    vi.stubEnv('SUBSTACK_PUBLICATIONS', 'testpub');
    process.env.SUBSTACK_PUBLICATIONS = 'testpub';

    const rssXml = `<?xml version="1.0"?>
    <rss><channel>
      <item>
        <title>Test Article</title>
        <description>Great article</description>
        <pubDate>Wed, 08 Apr 2026 10:00:00 GMT</pubDate>
      </item>
    </channel></rss>`;

    mockFetch.mockReturnValueOnce(textResponse(rssXml));

    const result = await fetchSubstack();
    expect(result.source).toBe('api');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].platform).toBe('substack');
  });
});

// ═══ fetchAllContent ═══

describe('fetchAllContent', () => {
  it('aggregates results from all platforms', async () => {
    // YouTube
    mockFetch.mockReturnValueOnce(jsonResponse({
      items: [{
        id: 'v1',
        snippet: { title: 'YT Video', channelTitle: 'Ch', publishedAt: '2026-04-08T10:00:00Z' },
      }],
    }));
    // Twitch: user lookup
    mockFetch.mockReturnValueOnce(jsonResponse({ data: [{ id: 'uid1' }] }));
    // X: user lookup
    mockFetch.mockReturnValueOnce(jsonResponse({ data: [{ id: 'u1', username: 'user1', name: 'User 1' }] }));
    // Substack
    mockFetch.mockReturnValueOnce(textResponse('<item><title>Article</title></item>'));
    // Kick
    mockFetch.mockReturnValueOnce(jsonResponse({
      id: 1, slug: 'testchannel', user: { username: 'Test' },
      livestream: { id: 1, session_title: 'Live', viewer_count: 100, is_live: true },
    }));
    // Twitch: follows
    mockFetch.mockReturnValueOnce(jsonResponse({ data: [{ broadcaster_id: 'b1' }] }));
    // X: tweets for user1
    mockFetch.mockReturnValueOnce(jsonResponse({ data: [{ id: 't1', text: 'Hello' }] }));
    // X: tweets for user2 (X_ACCOUNTS has user1,user2)
    mockFetch.mockReturnValueOnce(jsonResponse({ data: [] }));
    // Twitch: live streams
    mockFetch.mockReturnValueOnce(jsonResponse({
      data: [{
        id: 's1', user_name: 'Streamer', user_login: 'streamer',
        title: 'Live!', viewer_count: 100, game_name: 'Game',
        started_at: '2026-04-08T10:00:00Z', thumbnail_url: '',
      }],
    }));

    const result = await fetchAllContent();
    expect(result.sources).toBeDefined();
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    // At minimum, YouTube and Kick items should be present
    expect(result.sources.youtube).toBe('api');
  });

  it('handles complete API failures gracefully', async () => {
    // Make all fetches fail
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchAllContent();
    // Should not throw, should return error sources
    expect(result.items).toBeDefined();
    expect(result.sources).toBeDefined();
  });
});
