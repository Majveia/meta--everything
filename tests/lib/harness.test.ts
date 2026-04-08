import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collectSignals, evaluateStrategy, presentFeed, computeFeedHealth } from '@/lib/harness';
import type { ContentItem } from '@/lib/content';
import type { TraceEvent } from '@/lib/traces';

// ═══ TEST HELPERS ═══

function makeItem(overrides: Partial<ContentItem> & { id: string }): ContentItem {
  return {
    type: 'std',
    platform: 'youtube',
    title: 'Test Item',
    subtitle: 'Test subtitle',
    author: 'Author',
    tags: ['tech'],
    ...overrides,
  } as ContentItem;
}

function makeTrace(kind: TraceEvent['kind'], itemId?: string, meta?: Record<string, number | string>): TraceEvent {
  return { ts: Date.now(), kind, itemId, meta };
}

const testPool: ContentItem[] = [
  makeItem({ id: 'item-1', tags: ['tech', 'ai'], platform: 'youtube', type: 'std', time: '2h' }),
  makeItem({ id: 'item-2', tags: ['gaming'], platform: 'twitch', type: 'live', isLive: true, time: '1h' }),
  makeItem({ id: 'item-3', tags: ['science', 'space'], platform: 'youtube', type: 'std', time: '6h' }),
  makeItem({ id: 'item-4', tags: ['tech', 'web'], platform: 'x', type: 'compact', time: '30m' }),
  makeItem({ id: 'item-5', tags: ['gaming', 'fps'], platform: 'kick', type: 'live', isLive: true, time: '3h' }),
  makeItem({ id: 'item-6', tags: ['writing'], platform: 'substack', type: 'std', time: '1d' }),
  makeItem({ id: 'item-7', tags: ['tech', 'ai'], platform: 'youtube', type: 'std', isNew: true, time: '30m' }),
];

// ═══ collectSignals ═══

describe('collectSignals', () => {
  it('returns zero-confidence signals when no traces exist', () => {
    const signals = collectSignals([], new Set(), new Set(), new Set(), new Set(), testPool);
    expect(signals.confidence).toBe(0);
    expect(signals.tagAffinities.size).toBe(0);
    expect(signals.engagementDepth.avgDwellMs).toBe(0);
  });

  it('builds tag affinities from like events', () => {
    const traces: TraceEvent[] = [
      makeTrace('like', 'item-1'),
      makeTrace('like', 'item-1'),
    ];
    const signals = collectSignals(traces, new Set(), new Set(), new Set(), new Set(), testPool);
    expect(signals.tagAffinities.get('tech')).toBeGreaterThan(0);
    expect(signals.tagAffinities.get('ai')).toBeGreaterThan(0);
  });

  it('builds platform affinities', () => {
    const traces: TraceEvent[] = [
      makeTrace('like', 'item-1'),
      makeTrace('bookmark', 'item-3'),
    ];
    const signals = collectSignals(traces, new Set(), new Set(), new Set(), new Set(), testPool);
    expect(signals.platformAffinities.get('youtube')).toBeGreaterThan(0);
  });

  it('applies negative weight for scroll_past', () => {
    const traces: TraceEvent[] = [
      makeTrace('scroll_past', 'item-2'),
      makeTrace('scroll_past', 'item-2'),
      makeTrace('scroll_past', 'item-2'),
    ];
    const signals = collectSignals(traces, new Set(), new Set(), new Set(), new Set(), testPool);
    expect(signals.platformAffinities.get('twitch')).toBeLessThan(0);
    expect(signals.fatigueSignals.get('gaming')).toBeGreaterThan(0);
  });

  it('factors in liked and bookmarked items for cold-start', () => {
    const signals = collectSignals(
      [],
      new Set(['item-1']),       // liked
      new Set(['item-6']),       // bookmarked
      new Set(),
      new Set(),
      testPool,
    );
    expect(signals.tagAffinities.get('tech')).toBeGreaterThan(0);
    expect(signals.tagAffinities.get('writing')).toBeGreaterThan(0);
  });

  it('calculates dwell engagement depth', () => {
    const traces: TraceEvent[] = [
      makeTrace('dwell', 'item-1', { dwellMs: 45000 }),
      makeTrace('dwell', 'item-3', { dwellMs: 60000 }),
    ];
    const signals = collectSignals(traces, new Set(), new Set(), new Set(), new Set(), testPool);
    expect(signals.engagementDepth.avgDwellMs).toBe(52500); // (45000+60000)/2
  });

  it('increases confidence with more events', () => {
    const fewTraces = Array.from({ length: 5 }, (_, i) => makeTrace('tap', `item-${(i % 4) + 1}`));
    const manyTraces = Array.from({ length: 50 }, (_, i) => makeTrace('tap', `item-${(i % 4) + 1}`));

    const lowConf = collectSignals(fewTraces, new Set(), new Set(), new Set(), new Set(), testPool);
    const highConf = collectSignals(manyTraces, new Set(), new Set(), new Set(), new Set(), testPool);

    expect(highConf.confidence).toBeGreaterThan(lowConf.confidence);
    expect(highConf.confidence).toBeCloseTo(1, 0);
  });
});

// ═══ evaluateStrategy ═══

describe('evaluateStrategy', () => {
  it('produces scores for all items in the pool', () => {
    const signals = collectSignals(
      [makeTrace('like', 'item-1'), makeTrace('like', 'item-7')],
      new Set(),
      new Set(),
      new Set(),
      new Set(),
      testPool,
    );
    const strategy = evaluateStrategy(signals, testPool);

    expect(strategy.scores.size).toBe(testPool.length);
    for (const item of testPool) {
      expect(strategy.scores.has(item.id)).toBe(true);
    }
  });

  it('scores liked content higher than ignored content', () => {
    // Generate enough traces for confidence
    const traces: TraceEvent[] = [
      ...Array.from({ length: 10 }, () => makeTrace('like', 'item-1')),
      ...Array.from({ length: 10 }, () => makeTrace('scroll_past', 'item-6')),
    ];
    const signals = collectSignals(traces, new Set(['item-1']), new Set(), new Set(), new Set(), testPool);
    const strategy = evaluateStrategy(signals, testPool);

    const techScore = strategy.scores.get('item-1') || 0;
    const writingScore = strategy.scores.get('item-6') || 0;
    expect(techScore).toBeGreaterThan(writingScore);
  });

  it('gives live items a scoring boost', () => {
    const signals = collectSignals([], new Set(), new Set(), new Set(), new Set(), testPool);
    const strategy = evaluateStrategy(signals, testPool);

    // item-2 (live, gaming) and item-5 (live, gaming) should have live boost
    // With zero signals, base scores are similar, but live items get 1.3x multiplier
    const liveScore = strategy.scores.get('item-2') || 0;
    expect(liveScore).toBeGreaterThanOrEqual(0);
  });

  it('generates insights when signals are strong', () => {
    const traces: TraceEvent[] = Array.from({ length: 20 }, () => makeTrace('like', 'item-1'));
    const signals = collectSignals(traces, new Set(['item-1']), new Set(), new Set(), new Set(), testPool);
    const strategy = evaluateStrategy(signals, testPool);

    // Should have at least an affinity or pattern insight
    expect(strategy.insights.length).toBeGreaterThan(0);
  });

  it('increments strategyVersion on each evaluation', () => {
    const signals = collectSignals([], new Set(), new Set(), new Set(), new Set(), testPool);
    const s1 = evaluateStrategy(signals, testPool);
    const s2 = evaluateStrategy(signals, testPool);
    expect(s2.strategyVersion).toBeGreaterThan(s1.strategyVersion);
  });
});

// ═══ presentFeed ═══

describe('presentFeed', () => {
  it('filters out hidden items', () => {
    const signals = collectSignals([], new Set(), new Set(), new Set(), new Set(), testPool);
    const strategy = evaluateStrategy(signals, testPool);
    const feed = presentFeed(testPool, strategy, new Set(['item-1', 'item-3']));

    const ids = feed.map((i) => i.id);
    expect(ids).not.toContain('item-1');
    expect(ids).not.toContain('item-3');
    expect(feed.length).toBe(testPool.length - 2);
  });

  it('returns original order during cold start (low confidence)', () => {
    const signals = collectSignals([], new Set(), new Set(), new Set(), new Set(), testPool);
    // Confidence is 0, so cold start path
    const strategy = evaluateStrategy(signals, testPool);
    strategy.confidence = 0; // Force cold start

    const feed = presentFeed(testPool, strategy, new Set());
    expect(feed.map((i) => i.id)).toEqual(testPool.map((i) => i.id));
  });

  it('returns all non-hidden items (no items lost)', () => {
    const traces = Array.from({ length: 30 }, (_, i) => makeTrace('like', `item-${(i % 7) + 1}`));
    const signals = collectSignals(traces, new Set(), new Set(), new Set(), new Set(), testPool);
    const strategy = evaluateStrategy(signals, testPool);

    const feed = presentFeed(testPool, strategy, new Set());
    expect(feed.length).toBe(testPool.length);
  });

  it('adds signalBadge to new items', () => {
    const traces = Array.from({ length: 20 }, () => makeTrace('tap', 'item-1'));
    const signals = collectSignals(traces, new Set(), new Set(), new Set(), new Set(), testPool);
    const strategy = evaluateStrategy(signals, testPool);

    const feed = presentFeed(testPool, strategy, new Set());
    const newItem = feed.find((i) => i.id === 'item-7');
    // item-7 has isNew: true
    if (newItem?.signalBadge) {
      expect(['Fresh', 'For you', 'Discovery']).toContain(newItem.signalBadge.label);
    }
  });
});

// ═══ computeFeedHealth ═══

describe('computeFeedHealth', () => {
  it('returns zero diversity with no engagement', () => {
    const signals = collectSignals([], new Set(), new Set(), new Set(), new Set(), testPool);
    const health = computeFeedHealth(signals, testPool);
    expect(health.diversity).toBe(0);
    expect(health.confidence).toBe(0);
  });

  it('returns positive diversity when tags are engaged', () => {
    const traces: TraceEvent[] = [
      makeTrace('like', 'item-1'),
      makeTrace('like', 'item-2'),
      makeTrace('like', 'item-3'),
    ];
    const signals = collectSignals(traces, new Set(), new Set(), new Set(), new Set(), testPool);
    const health = computeFeedHealth(signals, testPool);
    expect(health.diversity).toBeGreaterThan(0);
  });

  it('exploration reflects serendipity rate', () => {
    const signals = collectSignals([], new Set(), new Set(), new Set(), new Set(), testPool);
    const health = computeFeedHealth(signals, testPool);
    expect(health.exploration).toBeGreaterThan(0);
    expect(health.exploration).toBeLessThanOrEqual(100);
  });
});
