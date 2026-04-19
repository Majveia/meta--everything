'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { E, MECH_EASE } from '@/lib/constants';
import { playTab } from '@/lib/sounds';
import { type ContentItem } from '@/lib/content';
import { useContentData } from '@/lib/ContentProvider';
import { pushTrace, getTraces } from '@/lib/traces';
import { collectSignals, evaluateStrategy, presentFeed, logStrategy } from '@/lib/harness';
import FeedSection from './FeedSection';
import InsightBanner from './InsightBanner';
import FollowingFeed from './FollowingFeed';

function FreshnessIndicator({ lastFetchTime, sources, color }: { lastFetchTime: number; sources: Record<string, string>; color: string }) {
  const [now] = useState(() => Date.now());
  const label = lastFetchTime > 0
    ? `Updated ${Math.max(1, Math.round((now - lastFetchTime) / 60000))}m ago`
    : Object.values(sources).every((s) => s === 'unconfigured')
      ? 'Using sample data'
      : '';
  if (!label) return null;
  return (
    <div style={{ textAlign: 'center', marginBottom: 10 }}>
      <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, letterSpacing: '.06em', color }}>{label}</span>
    </div>
  );
}

interface SwipeableFeedProps {
  onTap: (item: ContentItem) => void;
  onPlay?: (item: ContentItem) => void;
  onLongPress?: (item: ContentItem, x: number, y: number) => void;
}

export default function SwipeableFeed({ onTap, onPlay, onLongPress }: SwipeableFeedProps) {
  const p = useStore((s) => s.p);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const likedItems = useStore((s) => s.likedItems);
  const bookmarkedItems = useStore((s) => s.bookmarkedItems);
  const viewedItems = useStore((s) => s.viewedItems);
  const hiddenItems = useStore((s) => s.hiddenItems);
  const strategyVersion = useStore((s) => s.strategyVersion);
  const bumpStrategy = useStore((s) => s.bumpStrategy);
  const { fyItems, flItems, allItems, refresh: refreshContent, lastFetchTime, sources } = useContentData();

  const [tab, setTab] = useState(0);
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const [containerWidth, setContainerWidth] = useState(400);
  const startX = useRef(0);
  const startTime = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setContainerWidth(el.offsetWidth);
    const obs = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Pull-to-refresh state
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);
  const pullThreshold = 60;

  const onPullStart = useCallback((y: number) => {
    if (window.scrollY <= 0 && !refreshing) {
      pullStartY.current = y;
      isPulling.current = true;
    }
  }, [refreshing]);

  const onPullMove = useCallback((y: number) => {
    if (!isPulling.current || refreshing) return;
    const dy = y - pullStartY.current;
    if (dy > 0 && window.scrollY <= 0) {
      setPulling(true);
      setPullY(Math.min(dy * 0.45, 120));
    } else {
      setPulling(false);
      setPullY(0);
    }
  }, [refreshing]);

  const onPullEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullY >= pullThreshold) {
      pushTrace({ kind: 'pull_refresh' });
      setRefreshing(true);
      setPullY(pullThreshold);
      bumpStrategy();
      try {
        await refreshContent();
      } catch {
        // API might not be configured — harness re-evaluation still refreshes feed order
      }
      // Minimum visual duration so the spinner feels intentional
      await new Promise((r) => setTimeout(r, 400));
      setRefreshing(false);
      setPullY(0);
      setPulling(false);
      setRefreshKey((k) => k + 1);
    } else {
      setPullY(0);
      setPulling(false);
    }
  }, [pullY, pullThreshold, bumpStrategy, refreshContent]);

  const onStart = useCallback((x: number) => {
    startX.current = x;
    startTime.current = Date.now();
    setDrag(true);
  }, []);

  const onMove = useCallback(
    (x: number) => {
      if (!drag) return;
      let d = x - startX.current;
      if ((tab === 0 && d > 0) || (tab === 1 && d < 0)) d *= 0.12;
      setDx(d);
    },
    [drag, tab]
  );

  const onEnd = useCallback(() => {
    if (!drag) return;
    setDrag(false);
    const v = Math.abs(dx) / (Date.now() - startTime.current);
    const th = v > 0.3 ? 30 : 80;
    if (dx < -th && tab === 0) { if (soundEnabled) playTab(); setTab(1); }
    else if (dx > th && tab === 1) { if (soundEnabled) playTab(); setTab(0); }
    setDx(0);
  }, [drag, dx, tab, soundEnabled]);

  useEffect(() => {
    if (!drag) return;
    const mm = (e: MouseEvent) => onMove(e.clientX);
    const mu = () => onEnd();
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
    };
  }, [drag, onMove, onEnd]);

  const w = ref.current?.offsetWidth || 400;
  const tx = -tab * 50 + (dx / w) * 50;
  const soundEnabled = useStore((s) => s.soundEnabled);
  const likedItems = useStore((s) => s.likedItems);
  const bookmarkedItems = useStore((s) => s.bookmarkedItems);
  const viewedItems = useStore((s) => s.viewedItems);
  const hiddenItems = useStore((s) => s.hiddenItems);
  const strategyVersion = useStore((s) => s.strategyVersion);
  const bumpStrategy = useStore((s) => s.bumpStrategy);
  const { fyItems, flItems, allItems, refresh: refreshContent, lastFetchTime, sources, fetchError } = useContentData();
  const addToast = useStore((s) => s.addToast);

  // Harness pipeline: collect → evaluate → present
  const { fy, fl, insights } = useMemo(() => {
    const traces = getTraces();
    const signals = collectSignals(traces, likedItems, bookmarkedItems, viewedItems, hiddenItems, allItems);
    const strategy = evaluateStrategy(signals, [...fyItems, ...flItems]);
    logStrategy(signals, allItems);
    return {
      fy: presentFeed(fyItems, strategy, hiddenItems),
      fl: presentFeed(flItems, strategy, hiddenItems),
      insights: strategy.insights,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyVersion, likedItems.size, bookmarkedItems.size, hiddenItems.size, fyItems, flItems]);

  useEffect(() => {
    if (fetchError) addToast('Live data unavailable — showing sample content');
  }, [fetchError, addToast]);

  const updateLastVisit = useStore((s) => s.updateLastVisit);

  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    // Update last visit after a short delay so "new since" divider renders first
    const t = setTimeout(updateLastVisit, 3000);
    return () => clearTimeout(t);
  }, [updateLastVisit]);

  return (
    <div>
      {/* Greeting — Claude-style blur-to-focus word reveal */}
      <h2 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 'clamp(19px, 5vw, 24px)', letterSpacing: '-0.025em', fontWeight: 400, color: p.tx, marginBottom: 14, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.3em', flexWrap: 'wrap' }}>
        {greeting.split(' ').map((word, i) => (
          <motion.span
            key={word + i}
            initial={prefersReducedMotion ? false : { opacity: 0, filter: 'blur(12px)', y: 8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 + i * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {word}
          </motion.span>
        ))}
      </h2>

      {/* Tab headers — staggered blur entrance */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 18 }}>
        {['For You', 'Following'].map((label, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, filter: 'blur(10px)', y: 6 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ delay: 0.6 + i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={() => { pushTrace({ kind: 'tab_switch', meta: { tab: i === 0 ? 'for_you' : 'following' } }); if (soundEnabled) playTab(); setTab(i); setDx(0); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 4px',
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontSize: 18,
              letterSpacing: '-0.02em',
              color: tab === i ? p.tx : p.txF,
              fontWeight: 400,
              transition: `color .3s ${E}`,
              position: 'relative',
            }}
          >
            {label}
            {/* Mechanical underline — snaps, doesn't spring */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                left: '15%',
                right: '15%',
                height: 2,
                borderRadius: 0,
                background: p.tc,
                transform: `scaleX(${tab === i ? 1 : 0})`,
                transition: 'transform .18s cubic-bezier(0.25, 0.1, 0.25, 1)',
                transformOrigin: tab === i ? 'center' : i === 0 ? 'right' : 'left',
              }}
            />
          </motion.button>
        ))}
      </div>

      {/* Content freshness indicator */}
      <FreshnessIndicator lastFetchTime={lastFetchTime} sources={sources} color={p.txF} />

      {/* Harness insight banner */}
      <InsightBanner insights={insights} />

      {/* Screen reader announcement for refresh */}
      <div role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {refreshing ? 'Refreshing feed...' : ''}
      </div>

      {/* Pull-to-refresh indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: pulling || refreshing ? pullY : 0,
          overflow: 'hidden',
          transition: pulling ? 'none' : `height .3s ${E}`,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `2px solid ${p.tc}`,
            borderTopColor: 'transparent',
            opacity: Math.min(pullY / pullThreshold, 1),
            transform: `scale(${Math.min(pullY / pullThreshold, 1)})${refreshing ? '' : ` rotate(${pullY * 4}deg)`}`,
            transition: pulling ? 'none' : `all .3s ${E}`,
            animation: refreshing ? 'ptr-spin .6s linear infinite' : 'none',
          }}
        />
      </div>

      {/* Empty state */}
      {fy.length === 0 && fl.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.4 }}>:/</div>
          <h3 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 18, color: p.tx, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8 }}>Nothing here yet</h3>
          <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txM, letterSpacing: '.04em', lineHeight: 1.6 }}>Pull to refresh or check back later</p>
        </div>
      )}

      {/* Swipeable area */}
      <div
        ref={ref}
        onTouchStart={(e) => { onStart(e.touches[0].clientX); onPullStart(e.touches[0].clientY); }}
        onTouchMove={(e) => { onMove(e.touches[0].clientX); onPullMove(e.touches[0].clientY); }}
        onTouchEnd={() => { onEnd(); onPullEnd(); }}
        onMouseDown={(e) => { e.preventDefault(); onStart(e.clientX); }}
        style={{
          overflow: 'hidden',
          cursor: drag ? 'grabbing' : 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '200%',
            transform: `translateX(${tx}%)`,
            transition: drag ? 'none' : `transform .5s ${E}`,
            willChange: 'transform',
          }}
        >
          <div style={{ width: '50%', paddingRight: 8 }}>
            <FeedSection key={`fy-${tab}-${refreshKey}`} items={fy} onTap={onTap} onPlay={onPlay} onLongPress={onLongPress} />
          </div>
          <div style={{ width: '50%', paddingLeft: 8 }}>
            <FollowingFeed key={`fl-${tab}-${refreshKey}`} onTap={onTap} onLongPress={onLongPress} />
          </div>
        </div>
      </div>
    </div>
  );
}
