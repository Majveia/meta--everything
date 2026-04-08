/**
 * Meta-Harness Intelligence Layer
 *
 * Three-layer architecture inspired by:
 * - Stanford Meta-Harness (Lee et al.) — outer-loop optimization over harness code
 * - Anthropic Harness Design — separation of concerns (collector / evaluator / presenter)
 *
 * The app IS a harness: it determines what to store, retrieve, and present to the user.
 * This module replaces the naive tag-counting score() with a self-improving pipeline.
 */

import { type TraceEvent, getTraces, getStrategyLog, pushStrategyLog } from './traces';
import { allContent, type ContentItem } from './content';

// Default content pool — used when no pool is passed explicitly
const defaultPool = () => allContent;

// ═══ TYPES ═══

export interface UserSignals {
  tagAffinities: Map<string, number>;
  platformAffinities: Map<string, number>;
  typeAffinities: Map<string, number>;
  authorAffinities: Map<string, number>;
  engagementDepth: { avgDwellMs: number; detailOpenRate: number; likeRate: number };
  fatigueSignals: Map<string, number>;
  confidence: number;
}

export interface Insight {
  kind: 'affinity' | 'fatigue' | 'pattern' | 'suggestion';
  label: string;
  strength: number;
  tags?: string[];
}

export interface FeedStrategy {
  scores: Map<string, number>;
  boosts: { serendipityRate: number; freshnessBonus: number; diversityCap: number };
  insights: Insight[];
  confidence: number;
  strategyVersion: number;
}

// ═══ HARNESS PARAMETERS ═══

interface HarnessParams {
  serendipityRate: number;
  fatigueThreshold: number;
  diversityCap: number;
  recencyHalfLife: number;
}

const DEFAULT_PARAMS: HarnessParams = {
  serendipityRate: 0.2,
  fatigueThreshold: 0.6,
  diversityCap: 0.4,
  recencyHalfLife: 12, // hours
};

let currentParams: HarnessParams = { ...DEFAULT_PARAMS };
let strategyVersion = 0;

// ═══ LAYER 1: SIGNAL COLLECTOR ═══
// Pure data extraction, no judgment. Processes raw traces into structured signals.

const ACTION_WEIGHTS: Record<string, number> = {
  like: 3, bookmark: 4, dwell_long: 3, dwell_medium: 2, tap: 1, detail_open: 1,
  scroll_past: -1, hide: -5, unlike: -2, unbookmark: -1,
  preference_boost: 6, preference_suppress: -6,
};

export function collectSignals(
  traces: TraceEvent[],
  likedItems: Set<string>,
  bookmarkedItems: Set<string>,
  viewedItems: Set<string>,
  hiddenItems: Set<string>,
  contentPool?: ContentItem[],
): UserSignals {
  const tagAff = new Map<string, number>();
  const platAff = new Map<string, number>();
  const typeAff = new Map<string, number>();
  const authAff = new Map<string, number>();
  const fatigue = new Map<string, { scrollPast: number; total: number }>();

  let totalDwell = 0;
  let dwellCount = 0;
  let detailOpens = 0;
  let likes = 0;
  let totalItems = 0;

  // Build a lookup for content items by ID
  const itemMap = new Map<string, ContentItem>();
  (contentPool || defaultPool()).forEach((c) => itemMap.set(c.id, c));

  for (const trace of traces) {
    const item = trace.itemId ? itemMap.get(trace.itemId) : null;
    if (!item && trace.kind !== 'session_start' && trace.kind !== 'pull_refresh' && trace.kind !== 'tab_switch') continue;

    let weight = 0;

    switch (trace.kind) {
      case 'like': weight = ACTION_WEIGHTS.like; likes++; break;
      case 'unlike': weight = ACTION_WEIGHTS.unlike; break;
      case 'bookmark': weight = ACTION_WEIGHTS.bookmark; break;
      case 'unbookmark': weight = ACTION_WEIGHTS.unbookmark; break;
      case 'hide': weight = ACTION_WEIGHTS.hide; break;
      case 'detail_open': weight = ACTION_WEIGHTS.detail_open; detailOpens++; break;
      case 'tap': weight = ACTION_WEIGHTS.tap; break;
      case 'preference_boost': weight = ACTION_WEIGHTS.preference_boost; break;
      case 'preference_suppress': weight = ACTION_WEIGHTS.preference_suppress; break;
      case 'scroll_past': {
        weight = ACTION_WEIGHTS.scroll_past;
        if (item) {
          for (const tag of item.tags) {
            const f = fatigue.get(tag) || { scrollPast: 0, total: 0 };
            f.scrollPast++;
            f.total++;
            fatigue.set(tag, f);
          }
        }
        break;
      }
      case 'dwell': {
        const ms = (trace.meta?.dwellMs as number) || 0;
        totalDwell += ms;
        dwellCount++;
        weight = ms > 60000 ? ACTION_WEIGHTS.dwell_long : ms > 30000 ? ACTION_WEIGHTS.dwell_medium : 0.5;
        break;
      }
      default: continue;
    }

    if (item && weight !== 0) {
      // Apply weight to tag affinities
      for (const tag of item.tags) {
        tagAff.set(tag, (tagAff.get(tag) || 0) + weight);
        // Track impressions for fatigue
        const f = fatigue.get(tag) || { scrollPast: 0, total: 0 };
        if (trace.kind !== 'scroll_past') f.total++;
        fatigue.set(tag, f);
      }
      // Platform affinity
      platAff.set(item.platform, (platAff.get(item.platform) || 0) + weight);
      // Type affinity
      typeAff.set(item.type, (typeAff.get(item.type) || 0) + weight);
      // Author affinity
      if (item.author) authAff.set(item.author, (authAff.get(item.author) || 0) + weight);
      totalItems++;
    }
  }

  // Also factor in current liked/bookmarked items (for cold-start compat)
  for (const id of likedItems) {
    const item = itemMap.get(id);
    if (item) {
      for (const tag of item.tags) tagAff.set(tag, (tagAff.get(tag) || 0) + 2);
      platAff.set(item.platform, (platAff.get(item.platform) || 0) + 2);
    }
  }
  for (const id of bookmarkedItems) {
    const item = itemMap.get(id);
    if (item) {
      for (const tag of item.tags) tagAff.set(tag, (tagAff.get(tag) || 0) + 3);
    }
  }

  // Compute fatigue signals
  const fatigueSignals = new Map<string, number>();
  for (const [tag, f] of fatigue) {
    if (f.total > 0) fatigueSignals.set(tag, f.scrollPast / f.total);
  }

  // Confidence: 0 at <5 events, 1.0 at >50
  const eventCount = traces.filter((t) => t.itemId).length;
  const confidence = Math.min(1, Math.max(0, (eventCount - 5) / 45));

  return {
    tagAffinities: tagAff,
    platformAffinities: platAff,
    typeAffinities: typeAff,
    authorAffinities: authAff,
    engagementDepth: {
      avgDwellMs: dwellCount > 0 ? totalDwell / dwellCount : 0,
      detailOpenRate: totalItems > 0 ? detailOpens / totalItems : 0,
      likeRate: totalItems > 0 ? likes / totalItems : 0,
    },
    fatigueSignals,
    confidence,
  };
}

// ═══ LAYER 2: SIGNAL EVALUATOR ═══
// Interprets signals into a feed strategy. Separate from collection (no leniency bias).

function parseTimeToHours(time?: string): number {
  if (!time) return 24;
  const num = parseInt(time);
  if (isNaN(num)) return 24;
  if (time.includes('m')) return num / 60;
  if (time.includes('h')) return num;
  if (time.includes('d')) return num * 24;
  return num;
}

export function evaluateStrategy(signals: UserSignals, contentPool: ContentItem[]): FeedStrategy {
  const scores = new Map<string, number>();
  const insights: Insight[] = [];

  // Run the outer-loop optimizer first
  optimizeParams(signals);

  // Score each item
  for (const item of contentPool) {
    let score = 0;

    // 1. Affinity scoring (diminishing returns via log1p)
    for (const tag of item.tags) {
      const aff = signals.tagAffinities.get(tag) || 0;
      score += Math.log1p(Math.max(0, aff)) * 1.5;
    }
    const platAff = signals.platformAffinities.get(item.platform) || 0;
    score += Math.log1p(Math.max(0, platAff)) * 0.8;
    const typeAff = signals.typeAffinities.get(item.type) || 0;
    score += Math.log1p(Math.max(0, typeAff)) * 0.5;
    if (item.author) {
      const authAff = signals.authorAffinities.get(item.author) || 0;
      score += Math.log1p(Math.max(0, authAff)) * 0.6;
    }

    // 2. Recency decay
    const hours = parseTimeToHours(item.time);
    const halfLife = currentParams.recencyHalfLife;
    const recencyFactor = Math.pow(0.5, hours / halfLife);
    score *= (0.4 + 0.6 * recencyFactor); // floor at 40% of score

    // Live items get a recency bonus
    if (item.isLive || item.type === 'live') score *= 1.3;

    // Time-of-day awareness
    if (typeof window !== 'undefined') {
      const h = new Date().getHours();
      if ((h >= 19 || h < 2) && (item.isLive || item.type === 'live')) score *= 1.15;
      if (h >= 6 && h < 12 && item.platform === 'substack') score *= 1.1;
    }

    // 3. Fatigue penalty
    for (const tag of item.tags) {
      const fatigue = signals.fatigueSignals.get(tag) || 0;
      if (fatigue > currentParams.fatigueThreshold) {
        score *= (1 - 0.3 * (fatigue - currentParams.fatigueThreshold) / (1 - currentParams.fatigueThreshold));
      }
    }

    // 4. New item bonus
    if (item.isNew) score += 0.5;

    scores.set(item.id, score);
  }

  // 5. Discover insights
  discoverInsights(signals, insights);

  strategyVersion++;

  return {
    scores,
    boosts: {
      serendipityRate: currentParams.serendipityRate,
      freshnessBonus: 0.5,
      diversityCap: currentParams.diversityCap,
    },
    insights,
    confidence: signals.confidence,
    strategyVersion,
  };
}

function discoverInsights(signals: UserSignals, insights: Insight[]) {
  // Affinity insights
  const sortedTags = [...signals.tagAffinities.entries()]
    .filter(([, v]) => v > 2)
    .sort((a, b) => b[1] - a[1]);

  if (sortedTags.length > 0) {
    const [topTag, topScore] = sortedTags[0];
    const avg = sortedTags.reduce((s, [, v]) => s + v, 0) / sortedTags.length;
    if (topScore > avg * 2) {
      insights.push({
        kind: 'affinity',
        label: `Strong preference for ${topTag} content`,
        strength: Math.min(1, topScore / 20),
        tags: [topTag],
      });
    }
  }

  // Fatigue insights
  for (const [tag, fatigue] of signals.fatigueSignals) {
    if (fatigue > 0.5) {
      insights.push({
        kind: 'fatigue',
        label: `Declining engagement with ${tag}`,
        strength: fatigue,
        tags: [tag],
      });
    }
  }

  // Platform pattern insights
  const sortedPlats = [...signals.platformAffinities.entries()]
    .filter(([, v]) => v > 3)
    .sort((a, b) => b[1] - a[1]);
  if (sortedPlats.length > 0) {
    insights.push({
      kind: 'pattern',
      label: `Most engaged with ${sortedPlats[0][0]} content`,
      strength: Math.min(1, sortedPlats[0][1] / 15),
    });
  }

  // Dwell depth insight
  if (signals.engagementDepth.avgDwellMs > 30000) {
    insights.push({
      kind: 'pattern',
      label: 'Deep reader — you spend quality time with content',
      strength: Math.min(1, signals.engagementDepth.avgDwellMs / 60000),
    });
  }

  // Suggestion: if user has few liked tags, suggest exploration
  if (signals.tagAffinities.size < 3 && signals.confidence > 0.3) {
    insights.push({
      kind: 'suggestion',
      label: 'Try exploring more topics to diversify your feed',
      strength: 0.5,
    });
  }

  // Limit to 5
  insights.splice(5);
}

// ═══ LAYER 3: SIGNAL PRESENTER ═══
// Applies strategy to produce the final ordered feed.

export function presentFeed(
  items: ContentItem[],
  strategy: FeedStrategy,
  hiddenItems: Set<string>,
): ContentItem[] {
  // Filter hidden
  const visible = items.filter((i) => !hiddenItems.has(i.id));

  if (strategy.confidence < 0.05) {
    // Cold start: return in original order
    return visible;
  }

  // Sort by score
  const scored = [...visible].sort((a, b) => {
    const sa = strategy.scores.get(a.id) || 0;
    const sb = strategy.scores.get(b.id) || 0;
    return sb - sa;
  });

  // Apply diversity constraint: no tag > diversityCap of feed
  const maxPerTag = Math.ceil(scored.length * strategy.boosts.diversityCap);
  const tagCounts = new Map<string, number>();
  const diverse: ContentItem[] = [];
  const demoted: ContentItem[] = [];

  for (const item of scored) {
    const dominated = item.tags.some((t) => (tagCounts.get(t) || 0) >= maxPerTag);
    if (dominated) {
      demoted.push(item);
    } else {
      diverse.push(item);
      for (const t of item.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }

  // Serendipity injection: pick low-affinity items and insert at strategic positions
  const serendipityCount = Math.max(1, Math.floor(diverse.length * strategy.boosts.serendipityRate));
  const serendipityPicks: ContentItem[] = [];

  // Find items with lowest affinity scores that aren't already in top positions
  const lowAffinityPool = [...demoted, ...diverse.slice(Math.floor(diverse.length * 0.6))];
  const shuffled = lowAffinityPool.sort(() => Math.random() - 0.5);
  for (const item of shuffled) {
    if (serendipityPicks.length >= serendipityCount) break;
    if (!serendipityPicks.includes(item) && !diverse.slice(0, 3).includes(item)) {
      serendipityPicks.push(item);
    }
  }

  // Insert serendipity picks at positions 3, 7, 12, etc.
  const result = [...diverse];
  const insertPositions = [3, 7, 12, 18];
  for (let i = 0; i < serendipityPicks.length && i < insertPositions.length; i++) {
    const pos = Math.min(insertPositions[i], result.length);
    // Remove this item if it's already in result
    const idx = result.indexOf(serendipityPicks[i]);
    if (idx !== -1) result.splice(idx, 1);
    result.splice(pos, 0, serendipityPicks[i]);
  }

  // Append any remaining demoted items
  for (const item of demoted) {
    if (!result.includes(item)) result.push(item);
  }

  // Tag items with signal badges
  const serendipityPositions = new Set(insertPositions.slice(0, serendipityPicks.length));
  const topScored = [...strategy.scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  return result.map((item, idx) => {
    let signalBadge: ContentItem['signalBadge'];
    if (serendipityPositions.has(idx) && serendipityPicks.some((s) => s.id === item.id)) {
      signalBadge = { label: 'Discovery', type: 'serendipity' };
    } else if (item.isNew) {
      signalBadge = { label: 'Fresh', type: 'fresh' };
    } else if (strategy.confidence > 0.1 && topScored.includes(item.id)) {
      signalBadge = { label: 'For you', type: 'affinity' };
    }
    return signalBadge ? { ...item, signalBadge } : item;
  });
}

// ═══ OUTER-LOOP SELF-OPTIMIZER ═══
// Adjusts harness parameters based on measured outcomes. Simple hill-climbing.

function optimizeParams(signals: UserSignals) {
  if (signals.confidence < 0.3) return; // not enough data

  const log = getStrategyLog();
  if (log.length < 2) return;

  const prev = log[log.length - 1];
  const prevPrev = log.length >= 2 ? log[log.length - 2] : null;

  if (!prevPrev) return;

  const engDelta = prev.outcome.engagementRate - prevPrev.outcome.engagementRate;
  const divDelta = prev.outcome.diversityScore - prevPrev.outcome.diversityScore;
  const dwellDelta = prev.outcome.avgDwellMs - prevPrev.outcome.avgDwellMs;

  // Hill-climbing rules
  if (engDelta < -0.05 && divDelta > 0.05) {
    // Engagement dropped, diversity increased → serendipity too high
    currentParams.serendipityRate = Math.max(0.08, currentParams.serendipityRate - 0.03);
  } else if (engDelta >= 0 && dwellDelta < -5000) {
    // Engagement stable but dwell dropped → content getting stale
    currentParams.serendipityRate = Math.min(0.35, currentParams.serendipityRate + 0.03);
  }

  if (prev.outcome.diversityScore < 30) {
    currentParams.diversityCap = Math.max(0.3, currentParams.diversityCap - 0.02);
  } else if (prev.outcome.diversityScore > 70) {
    currentParams.diversityCap = Math.min(0.5, currentParams.diversityCap + 0.02);
  }

  // Clamp all params
  currentParams.serendipityRate = clamp(currentParams.serendipityRate, 0.08, 0.35);
  currentParams.fatigueThreshold = clamp(currentParams.fatigueThreshold, 0.4, 0.8);
  currentParams.diversityCap = clamp(currentParams.diversityCap, 0.3, 0.5);
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

// ═══ STRATEGY LOGGING ═══
// Called after strategy computation to record params + outcomes for the outer loop.

export function logStrategy(signals: UserSignals, contentPool?: ContentItem[]) {
  const uniqueTags = new Set<string>();
  for (const [tag, aff] of signals.tagAffinities) {
    if (aff > 0) uniqueTags.add(tag);
  }

  const allTags = new Set<string>();
  (contentPool || defaultPool()).forEach((c) => c.tags.forEach((t) => allTags.add(t)));

  pushStrategyLog({
    ts: Date.now(),
    version: strategyVersion,
    params: { ...currentParams },
    outcome: {
      engagementRate: signals.engagementDepth.detailOpenRate + signals.engagementDepth.likeRate,
      diversityScore: allTags.size > 0 ? (uniqueTags.size / allTags.size) * 100 : 50,
      avgDwellMs: signals.engagementDepth.avgDwellMs,
    },
  });
}

// ═══ CONVENIENCE: COMPUTE FEED HEALTH METRICS ═══

export function computeFeedHealth(signals: UserSignals, contentPool?: ContentItem[]): { diversity: number; exploration: number; confidence: number } {
  const allTags = new Set<string>();
  (contentPool || defaultPool()).forEach((c) => c.tags.forEach((t) => allTags.add(t)));

  const engagedTags = new Set<string>();
  for (const [tag, aff] of signals.tagAffinities) {
    if (aff > 0) engagedTags.add(tag);
  }

  return {
    diversity: allTags.size > 0 ? Math.round((engagedTags.size / allTags.size) * 100) : 0,
    exploration: Math.round(currentParams.serendipityRate * 100),
    confidence: signals.confidence,
  };
}
