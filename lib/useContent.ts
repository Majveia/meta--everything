'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ContentItem } from './content';
import { allContent, mockFyItems, mockFlItems, mockExItems } from './content';
import type { PlatformSources } from './fetchers';

export interface ContentState {
  allItems: ContentItem[];
  fyItems: ContentItem[];
  flItems: ContentItem[];
  exItems: ContentItem[];
  loading: boolean;
  sources: PlatformSources;
  refresh: () => void;
  lastFetchTime: number;
  fetchError: string | null;
}

// Module-level cache to avoid re-fetching across re-renders
let cachedItems: ContentItem[] | null = null;
let cachedSources: PlatformSources | null = null;
let lastFetchTime = 0;
const STALE_TIME = 60_000; // 1 minute

function mergeContent(apiItems: ContentItem[]): {
  allItems: ContentItem[];
  fyItems: ContentItem[];
  flItems: ContentItem[];
  exItems: ContentItem[];
} {
  if (apiItems.length === 0) {
    return { allItems: allContent, fyItems: mockFyItems, flItems: mockFlItems, exItems: mockExItems };
  }

  // Dedup: API items take priority (prefixed IDs won't collide with mock '0'-'31')
  const idSet = new Set(apiItems.map((i) => i.id));
  const mockFiltered = allContent.filter((i) => !idSet.has(i.id));
  const merged = [...apiItems, ...mockFiltered];

  // Split API items into pools by type
  const apiLive = apiItems.filter((i) => i.type === 'live');
  const apiStd = apiItems.filter((i) => i.type === 'std');
  const apiCompact = apiItems.filter((i) => i.type === 'compact');

  // Build pools: YouTube/std first, then live, then compact
  const fyPool = [...apiStd.slice(0, 4), ...apiLive, ...apiCompact.slice(0, 2)];
  const flPool = [...apiStd.slice(4, 8), ...apiCompact.slice(2, 4), ...apiLive.slice(5)];
  // Explore: no Substacks, focus on YouTube trending + live
  const exPool = [...apiStd.slice(8), ...apiCompact.slice(4), ...apiLive.slice(8)].filter((i) => i.platform !== 'substack');

  // Fill with mock data to ensure minimum pool sizes
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

export function useContent(): ContentState {
  // Always start with empty items to match server render (avoids hydration mismatch).
  // Cached data is applied in the useEffect after hydration.
  const [items, setItems] = useState<ContentItem[]>([]);
  const [sources, setSources] = useState<PlatformSources>(
    { youtube: 'unconfigured', twitch: 'unconfigured', x: 'unconfigured', substack: 'unconfigured', kick: 'unconfigured' }
  );
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const doFetch = useCallback(async (force = false) => {
    if (fetchingRef.current) return;
    if (!force && cachedItems && Date.now() - lastFetchTime < STALE_TIME) return;

    fetchingRef.current = true;
    setFetchError(null);
    try {
      const res = await fetch('/api/content', { signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      cachedItems = json.items || [];
      cachedSources = json.sources || {};
      lastFetchTime = Date.now();
      setItems(cachedItems!);
      setSources(cachedSources!);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      console.warn('[useContent] fetch failed, using mock data:', msg);
      setFetchError(msg);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Apply module-level cache immediately after hydration (no fetch needed)
    if (cachedItems && Date.now() - lastFetchTime < STALE_TIME) {
      setItems(cachedItems);
      setSources(cachedSources!);
      setLoading(false);
      return;
    }
    doFetch();
  }, [doFetch]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await doFetch(true);
  }, [doFetch]);

  const merged = mergeContent(items);

  return {
    ...merged,
    loading,
    sources,
    refresh,
    lastFetchTime,
    fetchError,
  };
}
