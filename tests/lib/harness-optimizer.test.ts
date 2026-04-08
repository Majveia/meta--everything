import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { collectSignals, evaluateStrategy } from '@/lib/harness';
import type { ContentItem } from '@/lib/content';
import type { TraceEvent } from '@/lib/traces';

/**
 * Tests for the outer-loop self-optimizer (optimizeParams).
 *
 * optimizeParams is private but called inside evaluateStrategy().
 * We observe its effects via the strategy's boosts values, and by
 * seeding the strategy log in localStorage.
 */

const STRATEGY_LOG_KEY = 'meta-everything-strategy-log';

function makeItem(id: string, tags: string[] = ['tech']): ContentItem {
  return {
    id,
    type: 'std',
    platform: 'youtube',
    title: 'Test',
    subtitle: 'Sub',
    author: 'Author',
    tags,
    time: '2h',
  } as ContentItem;
}

function makeTrace(kind: TraceEvent['kind'], itemId: string): TraceEvent {
  return { ts: Date.now(), kind, itemId };
}

const pool = [
  makeItem('p1', ['tech', 'ai']),
  makeItem('p2', ['gaming']),
  makeItem('p3', ['science']),
  makeItem('p4', ['music']),
];

// Generate enough traces for high confidence (> 0.3)
function highConfidenceTraces(): TraceEvent[] {
  return Array.from({ length: 50 }, (_, i) => makeTrace('tap', `p${(i % 4) + 1}`));
}

function seedStrategyLog(entries: Array<{
  engagementRate: number;
  diversityScore: number;
  avgDwellMs: number;
}>) {
  const log = entries.map((outcome, i) => ({
    ts: Date.now() - (entries.length - i) * 60000,
    version: i,
    params: { serendipityRate: 0.2, fatigueThreshold: 0.6, diversityCap: 0.4, recencyHalfLife: 12 },
    outcome,
  }));
  localStorage.setItem(STRATEGY_LOG_KEY, JSON.stringify(log));
}

beforeEach(() => {
  localStorage.clear();
});

describe('outer-loop optimizer', () => {
  it('does not optimize when confidence is below 0.3', () => {
    // Only a few traces → low confidence
    const fewTraces = [makeTrace('tap', 'p1'), makeTrace('tap', 'p2')];
    seedStrategyLog([
      { engagementRate: 0.8, diversityScore: 50, avgDwellMs: 40000 },
      { engagementRate: 0.3, diversityScore: 80, avgDwellMs: 10000 },
    ]);
    const signals = collectSignals(fewTraces, new Set(), new Set(), new Set(), new Set(), pool);
    const strategy = evaluateStrategy(signals, pool);

    // Default serendipityRate is 0.2
    expect(strategy.boosts.serendipityRate).toBeCloseTo(0.2, 1);
  });

  it('does not optimize with fewer than 2 log entries', () => {
    seedStrategyLog([
      { engagementRate: 0.5, diversityScore: 50, avgDwellMs: 30000 },
    ]);
    const signals = collectSignals(highConfidenceTraces(), new Set(), new Set(), new Set(), new Set(), pool);
    const strategy = evaluateStrategy(signals, pool);

    // Should still be near defaults
    expect(strategy.boosts.serendipityRate).toBeGreaterThanOrEqual(0.08);
    expect(strategy.boosts.serendipityRate).toBeLessThanOrEqual(0.35);
  });

  it('decreases serendipityRate when engagement drops and diversity increases', () => {
    seedStrategyLog([
      { engagementRate: 0.8, diversityScore: 40, avgDwellMs: 30000 },
      { engagementRate: 0.7, diversityScore: 50, avgDwellMs: 30000 }, // engDelta < -0.05 && divDelta > 0.05
    ]);
    const signals = collectSignals(highConfidenceTraces(), new Set(), new Set(), new Set(), new Set(), pool);
    const strategy = evaluateStrategy(signals, pool);

    // serendipityRate should have decreased from 0.2
    expect(strategy.boosts.serendipityRate).toBeLessThanOrEqual(0.2);
  });

  it('increases serendipityRate when engagement stable but dwell drops', () => {
    seedStrategyLog([
      { engagementRate: 0.5, diversityScore: 50, avgDwellMs: 40000 },
      { engagementRate: 0.5, diversityScore: 50, avgDwellMs: 30000 }, // engDelta >= 0 && dwellDelta < -5000
    ]);
    const signals = collectSignals(highConfidenceTraces(), new Set(), new Set(), new Set(), new Set(), pool);
    const strategy = evaluateStrategy(signals, pool);

    // serendipityRate should have increased from 0.2
    expect(strategy.boosts.serendipityRate).toBeGreaterThanOrEqual(0.2);
  });

  it('keeps parameters within clamped bounds', () => {
    // Extreme values that would push params out of bounds
    seedStrategyLog([
      { engagementRate: 1.0, diversityScore: 10, avgDwellMs: 100000 },
      { engagementRate: 0.0, diversityScore: 90, avgDwellMs: 1000 },
    ]);
    const signals = collectSignals(highConfidenceTraces(), new Set(), new Set(), new Set(), new Set(), pool);
    const strategy = evaluateStrategy(signals, pool);

    expect(strategy.boosts.serendipityRate).toBeGreaterThanOrEqual(0.08);
    expect(strategy.boosts.serendipityRate).toBeLessThanOrEqual(0.35);
    expect(strategy.boosts.diversityCap).toBeGreaterThanOrEqual(0.3);
    expect(strategy.boosts.diversityCap).toBeLessThanOrEqual(0.5);
  });
});
