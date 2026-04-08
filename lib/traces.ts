'use client';

import { useEffect, useRef } from 'react';

// ═══ TYPES ═══

export type TraceKind =
  | 'tap'
  | 'detail_open'
  | 'detail_close'
  | 'like'
  | 'unlike'
  | 'bookmark'
  | 'unbookmark'
  | 'hide'
  | 'scroll_past'
  | 'dwell'
  | 'share'
  | 'pull_refresh'
  | 'tab_switch'
  | 'session_start'
  | 'preference_boost'
  | 'preference_suppress';

export interface TraceEvent {
  ts: number;
  kind: TraceKind;
  itemId?: string;
  meta?: Record<string, number | string>;
}

// ═══ MODULE-LEVEL STORAGE ═══
// Traces live outside Zustand — they are write-heavy, read-rare.
// Persisted to localStorage under a separate key, debounced.

const STORAGE_KEY = 'meta-everything-traces';
const STRATEGY_LOG_KEY = 'meta-everything-strategy-log';
const MAX_AGE_DAYS = 30;

let traces: TraceEvent[] = [];
let dirty = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

// ═══ INITIALIZATION ═══

function loadTraces(): TraceEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function init() {
  if (initialized) return;
  initialized = true;
  traces = loadTraces();
  pruneTraces();

  // Emit session_start if last event was >30min ago
  const last = traces[traces.length - 1];
  const gap = last ? Date.now() - last.ts : Infinity;
  if (gap > 30 * 60 * 1000) {
    pushTrace({ kind: 'session_start' });
  }

  // Flush on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushNow);
  }
}

// ═══ PERSISTENCE ═══

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushNow();
    flushTimer = null;
  }, 5000);
}

function flushNow() {
  if (!dirty || typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(traces));
    dirty = false;
  } catch {
    // localStorage full — prune aggressively and retry
    traces = traces.slice(-200);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(traces)); } catch { /* give up */ }
  }
}

// ═══ PUBLIC API ═══

export function pushTrace(event: Omit<TraceEvent, 'ts'>) {
  if (typeof window === 'undefined') return;
  init();
  traces.push({ ...event, ts: Date.now() });
  dirty = true;
  scheduleFlush();
}

export function getTraces(): TraceEvent[] {
  init();
  return traces;
}

export function pruneTraces(maxAgeDays = MAX_AGE_DAYS) {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const before = traces.length;
  traces = traces.filter((t) => t.ts >= cutoff);
  if (traces.length !== before) {
    dirty = true;
    scheduleFlush();
  }
}

// ═══ STRATEGY LOG (persisted alongside traces) ═══

export interface StrategyLogEntry {
  ts: number;
  version: number;
  params: { serendipityRate: number; fatigueThreshold: number; diversityCap: number; recencyHalfLife: number };
  outcome: { engagementRate: number; diversityScore: number; avgDwellMs: number };
}

export function getStrategyLog(): StrategyLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STRATEGY_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushStrategyLog(entry: StrategyLogEntry) {
  if (typeof window === 'undefined') return;
  const log = getStrategyLog();
  log.push(entry);
  // Keep last 50 entries
  const trimmed = log.slice(-50);
  try { localStorage.setItem(STRATEGY_LOG_KEY, JSON.stringify(trimmed)); } catch { /* full */ }
}

// ═══ SCROLL-PAST TRACKER HOOK ═══
// Shared singleton IntersectionObserver — one observer for all cards instead of one per card.

const cardTimers = new Map<Element, { itemId: string; timer: ReturnType<typeof setTimeout> | null; tapped: boolean }>();

let sharedObserver: IntersectionObserver | null = null;
function getSharedObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const state = cardTimers.get(entry.target);
        if (!state) continue;
        if (entry.isIntersecting) {
          state.timer = setTimeout(() => {
            if (!state.tapped) {
              pushTrace({ kind: 'scroll_past', itemId: state.itemId, meta: { visibleMs: 2000 } });
            }
            state.timer = null;
          }, 2000);
        } else if (state.timer) {
          clearTimeout(state.timer);
          state.timer = null;
        }
      }
    },
    { threshold: 0.5 }
  );
  return sharedObserver;
}

export function useScrollPastTracker(itemId: string) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getSharedObserver();
    const state = { itemId, timer: null as ReturnType<typeof setTimeout> | null, tapped: false };
    cardTimers.set(el, state);
    observer.observe(el);

    const onClick = () => { state.tapped = true; };
    el.addEventListener('click', onClick, true);

    return () => {
      observer.unobserve(el);
      if (state.timer) clearTimeout(state.timer);
      cardTimers.delete(el);
      el.removeEventListener('click', onClick, true);
    };
  }, [itemId]);

  return ref;
}
