import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatCount, relativeTime, transformYouTube } from '../lib/transforms';

// ── formatCount ──────────────────────────────────────────────

describe('formatCount', () => {
  it('returns raw number as string below 1K', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatCount(1000)).toBe('1K');
    expect(formatCount(1500)).toBe('1.5K');
    expect(formatCount(10000)).toBe('10K');
    expect(formatCount(999999)).toBe('1000K');
  });

  it('formats millions with M suffix', () => {
    expect(formatCount(1_000_000)).toBe('1M');
    expect(formatCount(2_500_000)).toBe('2.5M');
  });

  it('strips trailing .0 from formatted values', () => {
    expect(formatCount(2_000_000)).toBe('2M');
    expect(formatCount(5000)).toBe('5K');
  });
});

// ── relativeTime ─────────────────────────────────────────────

describe('relativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
  });

  it('returns minutes for recent timestamps', () => {
    const iso = new Date(Date.now() - 30 * 60_000).toISOString();
    expect(relativeTime(iso)).toBe('30m');
  });

  it('clamps to minimum 1m', () => {
    const iso = new Date(Date.now() - 5000).toISOString();
    expect(relativeTime(iso)).toBe('1m');
  });

  it('returns hours for timestamps within a day', () => {
    const iso = new Date(Date.now() - 3 * 3600_000).toISOString();
    expect(relativeTime(iso)).toBe('3h');
  });

  it('returns days for older timestamps', () => {
    const iso = new Date(Date.now() - 2 * 86400_000).toISOString();
    expect(relativeTime(iso)).toBe('2d');
  });
});

// ── transformYouTube ─────────────────────────────────────────

describe('transformYouTube', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));
  });

  it('returns empty array for empty or missing items', () => {
    expect(transformYouTube({})).toEqual([]);
    expect(transformYouTube({ items: [] })).toEqual([]);
  });

  it('maps a YouTube video to a ContentItem', () => {
    const items = transformYouTube({
      items: [{
        id: 'abc123',
        snippet: {
          title: 'Test Video',
          channelTitle: 'Test Channel',
          publishedAt: new Date(Date.now() - 3600_000).toISOString(),
          tags: ['gaming', 'fun'],
        },
        statistics: { viewCount: '1000000', likeCount: '50000', commentCount: '2000' },
      }],
    });

    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.id).toBe('yt-abc123');
    expect(item.platform).toBe('youtube');
    expect(item.type).toBe('std');
    expect(item.title).toBe('Test Video');
    expect(item.author).toBe('Test Channel');
    expect(item.views).toBe('1M');
    expect(item.likes).toBe('50K');
    expect(item.comments).toBe('2K');
    expect(item.videoId).toBe('abc123');
    expect(item.tags).toEqual(['gaming', 'fun']);
  });

  it('defaults tags to ["trending"] when no tags present', () => {
    const items = transformYouTube({
      items: [{
        id: 'xyz',
        snippet: { title: 'T', channelTitle: 'C', publishedAt: new Date().toISOString() },
      }],
    });
    expect(items[0].tags).toEqual(['trending']);
  });

  it('limits tags to 5', () => {
    const items = transformYouTube({
      items: [{
        id: 'xyz',
        snippet: {
          title: 'T', channelTitle: 'C', publishedAt: new Date().toISOString(),
          tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        },
      }],
    });
    expect(items[0].tags).toHaveLength(5);
  });
});
