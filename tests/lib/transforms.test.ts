import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatCount,
  relativeTime,
  transformYouTube,
  transformTwitch,
  transformX,
  transformSubstack,
  transformKick,
} from '@/lib/transforms';

// ═══ formatCount ═══

describe('formatCount', () => {
  it('returns raw number for values under 1,000', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(1)).toBe('1');
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatCount(1_000)).toBe('1K');
    expect(formatCount(1_500)).toBe('1.5K');
    expect(formatCount(12_300)).toBe('12.3K');
    expect(formatCount(999_999)).toBe('1000K');
  });

  it('formats millions with M suffix', () => {
    expect(formatCount(1_000_000)).toBe('1M');
    expect(formatCount(2_500_000)).toBe('2.5M');
    expect(formatCount(10_000_000)).toBe('10M');
  });

  it('drops trailing .0', () => {
    expect(formatCount(1_000)).toBe('1K');
    expect(formatCount(1_000_000)).toBe('1M');
  });
});

// ═══ relativeTime ═══

describe('relativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns minutes for times less than 1 hour ago', () => {
    expect(relativeTime('2026-04-08T11:30:00Z')).toBe('30m');
    expect(relativeTime('2026-04-08T11:50:00Z')).toBe('10m');
  });

  it('returns at least 1m for very recent times', () => {
    expect(relativeTime('2026-04-08T11:59:30Z')).toBe('1m');
  });

  it('returns hours for times less than 1 day ago', () => {
    expect(relativeTime('2026-04-08T06:00:00Z')).toBe('6h');
    expect(relativeTime('2026-04-07T13:00:00Z')).toBe('23h');
  });

  it('returns days for times more than 1 day ago', () => {
    expect(relativeTime('2026-04-06T12:00:00Z')).toBe('2d');
    expect(relativeTime('2026-04-01T12:00:00Z')).toBe('7d');
  });
});

// ═══ transformYouTube ═══

describe('transformYouTube', () => {
  it('returns empty array when items is missing', () => {
    expect(transformYouTube({})).toEqual([]);
    expect(transformYouTube({ items: undefined })).toEqual([]);
  });

  it('returns empty array for null input', () => {
    expect(transformYouTube(null as unknown as { items: undefined })).toEqual([]);
  });

  it('transforms a YouTube video into a ContentItem', () => {
    const result = transformYouTube({
      items: [{
        id: 'abc123',
        snippet: {
          title: 'Test Video',
          channelTitle: 'Test Channel',
          publishedAt: '2026-04-08T10:00:00Z',
          tags: ['Tech', 'AI', 'Programming'],
        },
        statistics: {
          viewCount: '1500000',
          likeCount: '50000',
          commentCount: '1200',
        },
      }],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'yt-abc123',
      type: 'std',
      platform: 'youtube',
      title: 'Test Video',
      author: 'Test Channel',
      views: '1.5M',
      likes: '50K',
      comments: '1.2K',
      videoId: 'abc123',
    });
    expect(result[0].tags).toEqual(['tech', 'ai', 'programming']);
  });

  it('uses "trending" tag when video has no tags', () => {
    const result = transformYouTube({
      items: [{
        id: 'x',
        snippet: { title: 'No Tags', channelTitle: 'Ch', publishedAt: '2026-04-08T00:00:00Z' },
      }],
    });
    expect(result[0].tags).toEqual(['trending']);
  });

  it('limits tags to 5', () => {
    const result = transformYouTube({
      items: [{
        id: 'x',
        snippet: {
          title: 'Many Tags',
          channelTitle: 'Ch',
          publishedAt: '2026-04-08T00:00:00Z',
          tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        },
      }],
    });
    expect(result[0].tags).toHaveLength(5);
  });
});

// ═══ transformTwitch ═══

describe('transformTwitch', () => {
  it('returns empty array when data is missing', () => {
    expect(transformTwitch({})).toEqual([]);
    expect(transformTwitch({ data: undefined })).toEqual([]);
  });

  it('transforms a Twitch stream into a ContentItem', () => {
    const result = transformTwitch({
      data: [{
        id: 'stream1',
        user_name: 'Streamer',
        user_login: 'streamer',
        title: 'Playing Elden Ring',
        viewer_count: 15000,
        game_name: 'Elden Ring',
        tags: ['English', 'Souls'],
        started_at: '2026-04-08T10:00:00Z',
        thumbnail_url: 'http://example.com/thumb.jpg',
      }],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'tw-stream1',
      type: 'live',
      platform: 'twitch',
      title: 'Playing Elden Ring',
      author: 'Streamer',
      viewers: '15K',
      channelId: 'streamer',
      isLive: true,
    });
    expect(result[0].tags).toContain('elden ring');
    expect(result[0].tags).toContain('english');
  });
});

// ═══ transformX ═══

describe('transformX', () => {
  it('returns empty array when data is missing', () => {
    expect(transformX({})).toEqual([]);
  });

  it('transforms tweets with user resolution', () => {
    const result = transformX({
      data: [{
        id: 'tweet1',
        text: 'Hello world #tech #ai',
        author_id: 'user1',
        public_metrics: {
          like_count: 500,
          retweet_count: 100,
          reply_count: 50,
          impression_count: 25000,
        },
      }],
      includes: {
        users: [{ id: 'user1', username: 'johndoe', name: 'John Doe' }],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'x-tweet1',
      type: 'compact',
      platform: 'x',
      author: 'John Doe',
      likes: '500',
      views: '25K',
    });
    expect(result[0].tags).toContain('tech');
    expect(result[0].tags).toContain('ai');
  });

  it('truncates long tweets to 80 chars in title', () => {
    const longText = 'A'.repeat(100);
    const result = transformX({
      data: [{ id: 't1', text: longText }],
    });
    expect(result[0].title).toHaveLength(81); // 80 chars + ellipsis
    expect(result[0].title.endsWith('…')).toBe(true);
    expect(result[0].subtitle).toBe(longText); // full text in subtitle
  });

  it('falls back to "Unknown" when user not found', () => {
    const result = transformX({
      data: [{ id: 't1', text: 'test', author_id: 'missing' }],
    });
    expect(result[0].author).toBe('Unknown');
  });

  it('uses "trending" tag when no hashtags present', () => {
    const result = transformX({
      data: [{ id: 't1', text: 'no hashtags here' }],
    });
    expect(result[0].tags).toEqual(['trending']);
  });
});

// ═══ transformSubstack ═══

describe('transformSubstack', () => {
  it('returns empty array for empty XML', () => {
    expect(transformSubstack('', 'test')).toEqual([]);
  });

  it('parses RSS items from XML', () => {
    const xml = `
      <rss><channel>
        <item>
          <title>First Post</title>
          <description>A great article about testing</description>
          <pubDate>Tue, 08 Apr 2026 10:00:00 GMT</pubDate>
          <dc:creator>Jane Author</dc:creator>
          <link>https://example.substack.com/p/first-post</link>
        </item>
      </channel></rss>
    `;
    const result = transformSubstack(xml, 'example');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ss-example-0',
      type: 'std',
      platform: 'substack',
      title: 'First Post',
      author: 'Jane Author',
      tags: ['writing', 'example'],
    });
    expect(result[0].extra).toBe('https://example.substack.com/p/first-post');
  });

  it('handles CDATA-wrapped content', () => {
    const xml = `
      <item>
        <title><![CDATA[CDATA Title]]></title>
        <description><![CDATA[CDATA Description]]></description>
      </item>
    `;
    const result = transformSubstack(xml, 'pub');
    expect(result[0].title).toBe('CDATA Title');
  });

  it('limits to 5 items', () => {
    let xml = '';
    for (let i = 0; i < 10; i++) {
      xml += `<item><title>Post ${i}</title></item>`;
    }
    const result = transformSubstack(xml, 'pub');
    expect(result).toHaveLength(5);
  });

  it('decodes HTML entities', () => {
    const xml = `<item><title>Rock &amp; Roll &mdash; Live</title></item>`;
    const result = transformSubstack(xml, 'pub');
    expect(result[0].title).toBe('Rock & Roll \u2014 Live');
  });
});

// ═══ transformKick ═══

describe('transformKick', () => {
  it('returns empty array when channel is null', () => {
    expect(transformKick(null, 'test')).toEqual([]);
  });

  it('returns empty array when stream is not live', () => {
    expect(transformKick({
      id: 1, slug: 'test', user: { username: 'test' },
      livestream: { id: 1, session_title: 'Test', viewer_count: 100, is_live: false },
    }, 'test')).toEqual([]);
  });

  it('returns empty array when no livestream exists', () => {
    expect(transformKick({
      id: 1, slug: 'test', user: { username: 'test' },
    }, 'test')).toEqual([]);
  });

  it('transforms a live Kick stream', () => {
    const result = transformKick({
      id: 1,
      slug: 'streamer',
      user: { username: 'CoolStreamer' },
      livestream: {
        id: 100,
        session_title: 'Late Night Gaming',
        viewer_count: 8500,
        is_live: true,
        categories: [{ name: 'Fortnite' }],
      },
    }, 'streamer');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ki-streamer',
      type: 'live',
      platform: 'kick',
      title: 'Late Night Gaming',
      subtitle: 'Fortnite',
      author: 'CoolStreamer',
      viewers: '8.5K',
      isLive: true,
    });
    expect(result[0].tags).toContain('fortnite');
  });

  it('uses fallback title when session_title is empty', () => {
    const result = transformKick({
      id: 1, slug: 's', user: { username: 'Streamer' },
      livestream: { id: 1, session_title: '', viewer_count: 100, is_live: true },
    }, 's');
    expect(result[0].title).toBe('Streamer is live');
  });
});
