import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// traces.ts has module-level state. We use vi.resetModules() + dynamic import
// to get a fresh module for each test.

const STORAGE_KEY = 'meta-everything-traces';
const STRATEGY_LOG_KEY = 'meta-everything-strategy-log';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function loadTraces() {
  return await import('@/lib/traces');
}

// ═══ pushTrace / getTraces ═══

describe('pushTrace & getTraces', () => {
  it('appends a trace event with auto-generated timestamp', async () => {
    vi.setSystemTime(new Date('2026-04-08T12:00:00Z'));
    const { pushTrace, getTraces } = await loadTraces();
    pushTrace({ kind: 'tap', itemId: 'item-1' });

    const traces = getTraces();
    // At least 1 trace (may include session_start from init)
    const tapTraces = traces.filter((t) => t.kind === 'tap');
    expect(tapTraces).toHaveLength(1);
    expect(tapTraces[0].itemId).toBe('item-1');
    expect(tapTraces[0].ts).toBe(new Date('2026-04-08T12:00:00Z').getTime());
  });

  it('preserves metadata on trace events', async () => {
    const { pushTrace, getTraces } = await loadTraces();
    pushTrace({ kind: 'dwell', itemId: 'item-2', meta: { dwellMs: 45000 } });

    const traces = getTraces();
    const dwell = traces.find((t) => t.kind === 'dwell');
    expect(dwell?.meta?.dwellMs).toBe(45000);
  });

  it('accumulates multiple traces', async () => {
    const { pushTrace, getTraces } = await loadTraces();
    pushTrace({ kind: 'tap', itemId: 'a' });
    pushTrace({ kind: 'like', itemId: 'b' });
    pushTrace({ kind: 'bookmark', itemId: 'c' });

    const traces = getTraces();
    const userTraces = traces.filter((t) => t.kind !== 'session_start');
    expect(userTraces.length).toBeGreaterThanOrEqual(3);
  });
});

// ═══ pruneTraces ═══

describe('pruneTraces', () => {
  it('removes events older than the cutoff', async () => {
    // Seed localStorage with old and recent traces
    const now = Date.now();
    const old = [
      { ts: now - 31 * 24 * 60 * 60 * 1000, kind: 'tap', itemId: 'old-1' },
      { ts: now - 32 * 24 * 60 * 60 * 1000, kind: 'tap', itemId: 'old-2' },
      { ts: now - 1000, kind: 'tap', itemId: 'recent-1' },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));

    const { getTraces } = await loadTraces();
    const traces = getTraces();
    // Old traces should be pruned by init()
    const oldTraces = traces.filter((t) => t.itemId?.startsWith('old-'));
    expect(oldTraces).toHaveLength(0);
    // Recent should survive
    const recentTraces = traces.filter((t) => t.itemId === 'recent-1');
    expect(recentTraces).toHaveLength(1);
  });

  it('accepts custom maxAgeDays parameter', async () => {
    const now = Date.now();
    const traces = [
      { ts: now - 2 * 24 * 60 * 60 * 1000, kind: 'tap', itemId: 'two-days' },
      { ts: now - 1000, kind: 'tap', itemId: 'recent' },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(traces));

    const mod = await loadTraces();
    // Force init by calling getTraces first
    mod.getTraces();
    // Then prune with 1-day cutoff
    mod.pruneTraces(1);

    const result = mod.getTraces();
    expect(result.some((t) => t.itemId === 'two-days')).toBe(false);
    expect(result.some((t) => t.itemId === 'recent')).toBe(true);
  });
});

// ═══ Session start detection ═══

describe('session_start detection', () => {
  it('emits session_start when last trace was >30min ago', async () => {
    const now = Date.now();
    // Seed with a trace from 1 hour ago
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { ts: now - 60 * 60 * 1000, kind: 'tap', itemId: 'old' },
    ]));

    const { getTraces } = await loadTraces();
    const traces = getTraces();
    const sessionStarts = traces.filter((t) => t.kind === 'session_start');
    expect(sessionStarts.length).toBeGreaterThanOrEqual(1);
  });

  it('does not emit session_start when last trace was <30min ago', async () => {
    const now = Date.now();
    // Seed with a very recent trace
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { ts: now - 5 * 60 * 1000, kind: 'tap', itemId: 'recent' },
    ]));

    const { getTraces } = await loadTraces();
    const traces = getTraces();
    const sessionStarts = traces.filter((t) => t.kind === 'session_start');
    expect(sessionStarts).toHaveLength(0);
  });

  it('emits session_start when localStorage is empty (first visit)', async () => {
    const { getTraces } = await loadTraces();
    const traces = getTraces();
    const sessionStarts = traces.filter((t) => t.kind === 'session_start');
    expect(sessionStarts.length).toBeGreaterThanOrEqual(1);
  });
});

// ═══ Strategy log ═══

describe('getStrategyLog / pushStrategyLog', () => {
  const makeEntry = (version: number, overrides?: Partial<{ outcome: { engagementRate: number; diversityScore: number; avgDwellMs: number } }>) => ({
    ts: Date.now(),
    version,
    params: { serendipityRate: 0.2, fatigueThreshold: 0.6, diversityCap: 0.4, recencyHalfLife: 12 },
    outcome: { engagementRate: 0.5, diversityScore: 50, avgDwellMs: 30000, ...overrides?.outcome },
  });

  it('returns empty array when nothing stored', async () => {
    const { getStrategyLog } = await loadTraces();
    expect(getStrategyLog()).toEqual([]);
  });

  it('round-trips entries through localStorage', async () => {
    const { getStrategyLog, pushStrategyLog } = await loadTraces();
    const entry = makeEntry(1);
    pushStrategyLog(entry);

    const log = getStrategyLog();
    expect(log).toHaveLength(1);
    expect(log[0].version).toBe(1);
  });

  it('trims log to 50 entries', async () => {
    const { getStrategyLog, pushStrategyLog } = await loadTraces();
    for (let i = 0; i < 55; i++) {
      pushStrategyLog(makeEntry(i));
    }

    const log = getStrategyLog();
    expect(log).toHaveLength(50);
    // Oldest entries trimmed — first entry should be version 5
    expect(log[0].version).toBe(5);
  });

  it('handles corrupt data gracefully', async () => {
    localStorage.setItem(STRATEGY_LOG_KEY, 'not-valid-json{{{');
    const { getStrategyLog } = await loadTraces();
    expect(getStrategyLog()).toEqual([]);
  });

  it('handles non-array data gracefully', async () => {
    localStorage.setItem(STRATEGY_LOG_KEY, JSON.stringify({ not: 'an array' }));
    const { getStrategyLog } = await loadTraces();
    expect(getStrategyLog()).toEqual([]);
  });
});
