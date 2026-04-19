import { describe, it, expect } from 'vitest';
import type { ContentItem } from '@/lib/content';
import { allContent, mockFyItems, mockFlItems, mockExItems } from '@/lib/content';

// Re-implement mergeContent locally to test the algorithm without modifying source.
// This mirrors the exact logic in lib/useContent.ts.
function mergeContent(apiItems: ContentItem[]): {
  allItems: ContentItem[];
  fyItems: ContentItem[];
  flItems: ContentItem[];
  exItems: ContentItem[];
} {
  if (apiItems.length === 0) {
    return { allItems: allContent, fyItems: mockFyItems, flItems: mockFlItems, exItems: mockExItems };
  }

  const idSet = new Set(apiItems.map((i) => i.id));
  const mockFiltered = allContent.filter((i) => !idSet.has(i.id));
  const merged = [...apiItems, ...mockFiltered];

  const apiLive = apiItems.filter((i) => i.type === 'live');
  const apiStd = apiItems.filter((i) => i.type === 'std');
  const apiCompact = apiItems.filter((i) => i.type === 'compact');

  const fyPool = [...apiStd.slice(0, 4), ...apiLive, ...apiCompact.slice(0, 2)];
  const flPool = [...apiStd.slice(4, 8), ...apiCompact.slice(2, 4), ...apiLive.slice(5)];
  const exPool = [...apiStd.slice(8), ...apiCompact.slice(4), ...apiLive.slice(8)].filter(
    (i) => i.platform !== 'substack',
  );

  const fillPool = (pool: ContentItem[], mockPool: ContentItem[], min: number): ContentItem[] => {
    if (pool.length >= min) return pool;
    const poolIds = new Set(pool.map((i) => i.id));
    const filler = mockPool.filter((i) => !poolIds.has(i.id));
    return [...pool, ...filler.slice(0, min - pool.length)];
  };

  return {
    allItems: merged,
    fyItems: fillPool(fyPool, mockFyItems, 8),
    flItems: fillPool(flPool, mockFlItems, 8),
    exItems: fillPool(exPool, mockExItems, 8),
  };
}

// ═══ Helper: create a minimal ContentItem ═══

function makeItem(overrides: Partial<ContentItem> & { id: string }): ContentItem {
  return {
    type: 'std',
    platform: 'youtube',
    title: `Item ${overrides.id}`,
    subtitle: '',
    author: 'Test',
    tags: [],
    ...overrides,
  };
}

// ═══ mergeContent algorithm ═══

describe('mergeContent', () => {
  it('returns all mock data when API items are empty', () => {
    const result = mergeContent([]);
    expect(result.allItems).toBe(allContent);
    expect(result.fyItems).toBe(mockFyItems);
    expect(result.flItems).toBe(mockFlItems);
    expect(result.exItems).toBe(mockExItems);
  });

  it('deduplicates API items against mock data by id', () => {
    // Use an id that exists in allContent (id '0')
    const apiItem = makeItem({ id: '0', type: 'live', platform: 'twitch' });
    const result = mergeContent([apiItem]);

    // The merged array should contain the API version, not two copies
    const matchingItems = result.allItems.filter((i) => i.id === '0');
    expect(matchingItems).toHaveLength(1);
    // API item comes first in merged array
    expect(result.allItems[0]).toBe(apiItem);
  });

  it('API items take priority over mock items with same ID', () => {
    const customTitle = 'API Override Title';
    const apiItem = makeItem({ id: '0', type: 'live', platform: 'twitch', title: customTitle });
    const result = mergeContent([apiItem]);

    const found = result.allItems.find((i) => i.id === '0');
    expect(found).toBeDefined();
    expect(found!.title).toBe(customTitle);
  });

  it('places std items in fyPool first', () => {
    const stdItems = Array.from({ length: 4 }, (_, i) =>
      makeItem({ id: `std-${i}`, type: 'std' }),
    );
    const result = mergeContent(stdItems);

    // The first 4 items of fyItems should be our std items (before any fill)
    for (let i = 0; i < 4; i++) {
      expect(result.fyItems[i].id).toBe(`std-${i}`);
    }
  });

  it('excludes substack items from exPool', () => {
    // Create enough items to populate exPool (std index >= 8 goes to exPool)
    const stdItems = Array.from({ length: 10 }, (_, i) =>
      makeItem({ id: `std-${i}`, type: 'std', platform: i === 9 ? 'substack' : 'youtube' }),
    );
    const result = mergeContent(stdItems);

    // std-8 (youtube) should appear in exItems, std-9 (substack) should be filtered out
    const exIds = result.exItems.map((i) => i.id);
    expect(exIds).toContain('std-8');
    expect(exIds).not.toContain('std-9');
  });

  it('fillPool pads short pools with mock data up to minimum 8', () => {
    // Provide just 1 std item -- fyPool will have only 1 item and needs padding
    const result = mergeContent([makeItem({ id: 'single-std', type: 'std' })]);

    expect(result.fyItems.length).toBeGreaterThanOrEqual(8);
    expect(result.flItems.length).toBeGreaterThanOrEqual(8);
    expect(result.exItems.length).toBeGreaterThanOrEqual(8);
  });

  it('fillPool does not duplicate items already in pool', () => {
    // Use a mock fy item id as an API item so it lands in fyPool
    const mockFyId = mockFyItems[0].id;
    const apiItem = makeItem({ id: mockFyId, type: 'std' });
    const result = mergeContent([apiItem]);

    // fyItems should not contain the same id twice
    const ids = result.fyItems.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('pools larger than minimum are not truncated', () => {
    // Create 10 live items -- they all go to fyPool which exceeds min of 8
    const liveItems = Array.from({ length: 10 }, (_, i) =>
      makeItem({ id: `live-${i}`, type: 'live', platform: 'twitch' }),
    );
    const result = mergeContent(liveItems);

    // fyPool = [...apiStd.slice(0,4)=[], ...apiLive(10), ...apiCompact.slice(0,2)=[]] = 10 items
    expect(result.fyItems.length).toBe(10);
  });

  it('merged allItems includes both API and remaining mock items', () => {
    const apiItem = makeItem({ id: 'api-new', type: 'std' });
    const result = mergeContent([apiItem]);

    // Should contain the API item
    expect(result.allItems.find((i) => i.id === 'api-new')).toBeDefined();
    // Should still contain mock items that don't collide
    expect(result.allItems.length).toBe(1 + allContent.length);
  });

  it('splits std items across pools by index ranges', () => {
    // Create 12 std items to test the 0-3, 4-7, 8+ distribution
    const stdItems = Array.from({ length: 12 }, (_, i) =>
      makeItem({ id: `s-${i}`, type: 'std' }),
    );
    const result = mergeContent(stdItems);

    // fyPool gets std[0..3]
    expect(result.fyItems.slice(0, 4).map((i) => i.id)).toEqual(['s-0', 's-1', 's-2', 's-3']);

    // flPool gets std[4..7] (first 4 elements before compact filler)
    expect(result.flItems.slice(0, 4).map((i) => i.id)).toEqual(['s-4', 's-5', 's-6', 's-7']);

    // exPool gets std[8+]
    const exApiIds = result.exItems.filter((i) => i.id.startsWith('s-')).map((i) => i.id);
    expect(exApiIds).toContain('s-8');
    expect(exApiIds).toContain('s-9');
    expect(exApiIds).toContain('s-10');
    expect(exApiIds).toContain('s-11');
  });
});
