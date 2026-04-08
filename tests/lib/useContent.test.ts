import { describe, it, expect } from 'vitest';
import { mergeContent } from '@/lib/useContent';
import { allContent, mockFyItems, mockFlItems, mockExItems, type ContentItem } from '@/lib/content';

function makeItem(overrides: Partial<ContentItem> & { id: string; type: ContentItem['type']; platform: ContentItem['platform'] }): ContentItem {
  return {
    title: 'Test',
    subtitle: 'Sub',
    author: 'Author',
    tags: ['test'],
    ...overrides,
  } as ContentItem;
}

// ═══ mergeContent ═══

describe('mergeContent', () => {
  it('returns mock data pools when apiItems is empty', () => {
    const result = mergeContent([]);
    expect(result.allItems).toBe(allContent);
    expect(result.fyItems).toBe(mockFyItems);
    expect(result.flItems).toBe(mockFlItems);
    expect(result.exItems).toBe(mockExItems);
  });

  it('deduplicates API items over mock items with same ID', () => {
    const apiItem = makeItem({ id: '0', type: 'std', platform: 'youtube', title: 'API Version' });
    const result = mergeContent([apiItem]);
    // The merged allItems should contain the API version, not the mock version
    const found = result.allItems.find((i) => i.id === '0');
    expect(found?.title).toBe('API Version');
    // Mock items with different IDs are still present
    expect(result.allItems.length).toBeGreaterThan(1);
  });

  it('merges API items before mock items in allItems', () => {
    const apiItems = [
      makeItem({ id: 'api-1', type: 'std', platform: 'youtube' }),
      makeItem({ id: 'api-2', type: 'live', platform: 'twitch' }),
    ];
    const result = mergeContent(apiItems);
    // API items come first
    expect(result.allItems[0].id).toBe('api-1');
    expect(result.allItems[1].id).toBe('api-2');
    // Mock items follow
    expect(result.allItems.length).toBe(allContent.length + 2);
  });

  it('splits std items into fyPool (first 4) and flPool (4-8)', () => {
    const stdItems = Array.from({ length: 10 }, (_, i) =>
      makeItem({ id: `std-${i}`, type: 'std', platform: 'youtube' })
    );
    const result = mergeContent(stdItems);

    // fyPool gets first 4 std items
    expect(result.fyItems.some((i) => i.id === 'std-0')).toBe(true);
    expect(result.fyItems.some((i) => i.id === 'std-3')).toBe(true);

    // flPool gets items 4-7
    expect(result.flItems.some((i) => i.id === 'std-4')).toBe(true);
    expect(result.flItems.some((i) => i.id === 'std-7')).toBe(true);

    // exPool gets items 8+
    expect(result.exItems.some((i) => i.id === 'std-8')).toBe(true);
    expect(result.exItems.some((i) => i.id === 'std-9')).toBe(true);
  });

  it('puts live items into fyPool', () => {
    const items = [
      makeItem({ id: 'live-1', type: 'live', platform: 'twitch', isLive: true }),
      makeItem({ id: 'live-2', type: 'live', platform: 'kick', isLive: true }),
    ];
    const result = mergeContent(items);
    expect(result.fyItems.some((i) => i.id === 'live-1')).toBe(true);
    expect(result.fyItems.some((i) => i.id === 'live-2')).toBe(true);
  });

  it('puts first 2 compact items into fyPool, next 2 into flPool', () => {
    const items = Array.from({ length: 6 }, (_, i) =>
      makeItem({ id: `compact-${i}`, type: 'compact', platform: 'x' })
    );
    const result = mergeContent(items);

    // First 2 compact → fyPool
    expect(result.fyItems.some((i) => i.id === 'compact-0')).toBe(true);
    expect(result.fyItems.some((i) => i.id === 'compact-1')).toBe(true);

    // Items 2-3 → flPool
    expect(result.flItems.some((i) => i.id === 'compact-2')).toBe(true);
    expect(result.flItems.some((i) => i.id === 'compact-3')).toBe(true);

    // Items 4+ → exPool
    expect(result.exItems.some((i) => i.id === 'compact-4')).toBe(true);
    expect(result.exItems.some((i) => i.id === 'compact-5')).toBe(true);
  });

  it('excludes Substack items from explore pool', () => {
    const items = [
      makeItem({ id: 'ss-1', type: 'std', platform: 'substack' }),
      // Push it into exPool range (index 8+)
      ...Array.from({ length: 8 }, (_, i) =>
        makeItem({ id: `filler-${i}`, type: 'std', platform: 'youtube' })
      ),
      makeItem({ id: 'ss-2', type: 'std', platform: 'substack' }),
    ];
    const result = mergeContent(items);
    expect(result.exItems.some((i) => i.platform === 'substack')).toBe(false);
  });

  it('fills pools to minimum size 8 with mock data', () => {
    // Only 2 API items — all pools should be padded to at least 8
    const items = [
      makeItem({ id: 'api-1', type: 'std', platform: 'youtube' }),
      makeItem({ id: 'api-2', type: 'live', platform: 'twitch' }),
    ];
    const result = mergeContent(items);
    expect(result.fyItems.length).toBeGreaterThanOrEqual(8);
    expect(result.flItems.length).toBeGreaterThanOrEqual(8);
    expect(result.exItems.length).toBeGreaterThanOrEqual(8);
  });

  it('does not add filler duplicates to pools', () => {
    const items = [
      makeItem({ id: 'api-1', type: 'std', platform: 'youtube' }),
    ];
    const result = mergeContent(items);
    // Each pool should have unique IDs
    const fyIds = result.fyItems.map((i) => i.id);
    expect(new Set(fyIds).size).toBe(fyIds.length);
  });

  it('does not pad pools that already meet minimum size', () => {
    // 10 std + 5 live + 5 compact = enough for all pools
    const items = [
      ...Array.from({ length: 10 }, (_, i) => makeItem({ id: `s-${i}`, type: 'std', platform: 'youtube' })),
      ...Array.from({ length: 5 }, (_, i) => makeItem({ id: `l-${i}`, type: 'live', platform: 'twitch' })),
      ...Array.from({ length: 5 }, (_, i) => makeItem({ id: `c-${i}`, type: 'compact', platform: 'x' })),
    ];
    const result = mergeContent(items);
    // fyPool: 4 std + 5 live + 2 compact = 11 — no filler needed
    const fyMockIds = result.fyItems.filter((i) => !i.id.startsWith('s-') && !i.id.startsWith('l-') && !i.id.startsWith('c-'));
    expect(fyMockIds.length).toBe(0);
  });

  it('handles all items being one type', () => {
    const items = Array.from({ length: 3 }, (_, i) =>
      makeItem({ id: `live-${i}`, type: 'live', platform: 'twitch', isLive: true })
    );
    const result = mergeContent(items);
    // Should not crash, pools should be filled with mock data
    expect(result.fyItems.length).toBeGreaterThanOrEqual(3);
    expect(result.allItems.length).toBeGreaterThan(3);
  });
});
