'use client';

import { useState, useEffect, useCallback } from 'react';
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
let inflight: Promise<{ items: ContentItem[]; sources: PlatformSources }> | null = null;
const STALE_TIME = 60_000; // 1 minute

function mergeContent(apiItems: ContentItem[], sources?: PlatformSources): {
  allItems: ContentItem[];
  fyItems: ContentItem[];
  flItems: ContentItem[];
  exItems: ContentItem[];
} {
  // Filter out mock X posts when the X API isn't connected
  const xUnconfigured = !sources || sources.x === 'unconfigured';
  const stripMockX = (items: ContentItem[]) =>
    xUnconfigured ? items.filter((i) => i.platform !== 'x') : items;

  if (apiItems.length === 0) {
    return {
      allItems: stripMockX(allContent),
      fyItems: stripMockX(mockFyItems),
      flItems: stripMockX(mockFlItems),
      exItems: stripMockX(mockExItems),
    };
  }

  // Dedup: API items take priority (prefixed IDs won't collide with mock '0'-'31')
  const idSet = new Set(apiItems.map((i) => i.id));
  const mockFiltered = stripMockX(allContent.filter((i) => !idSet.has(i.id)));
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
    fyItems: fillPool(fyPool, stripMockX(mockFyItems), 8),
    flItems: fillPool(flPool, stripMockX(mockFlItems), 8),
    exItems: fillPool(exPool, stripMockX(mockExItems), 8),
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
      inflight = null;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Apply module-level cache immediately after hydration (no fetch needed)
    if (cachedItems && Date.now() - lastFetchTime < STALE_TIME) {
      setItems(cachedItems);
      setSources(cachedSources!);
      setLoading(false);
    } else {
      doFetch();
    }
    // Poll every 30s to keep feeds dynamic and constantly refreshing
    const interval = setInterval(() => doFetch(true), 30_000);
    return () => clearInterval(interval);
  }, [doFetch]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await doFetch(true);
  }, [doFetch]);

  const merged = mergeContent(items, sources);

  return {
    ...merged,
    loading,
    sources,
    refresh,
    lastFetchTime,
    fetchError,
  };
}
