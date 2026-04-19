'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { E, accentColors } from '@/lib/constants';
import { type ContentItem } from '@/lib/content';
import { useContentData } from '@/lib/ContentProvider';
import { getTraces } from '@/lib/traces';
import { collectSignals, computeFeedHealth } from '@/lib/harness';

const ease = [0.16, 1, 0.3, 1] as const;

interface ActivityItem {
  id: string;
  type: 'like' | 'save' | 'view' | 'live' | 'new_content' | 'preference' | 'health' | 'notification';
  icon: React.ReactNode;
  text: string;
  ts: number;
  accent: string;
  contentId?: string;
  read: boolean;
}

interface ActivityViewProps {
  onDetailOpen?: (item: ContentItem) => void;
}

export default function ActivityView({ onDetailOpen }: ActivityViewProps) {
  const p = useStore((s) => s.p);
  const likedItems = useStore((s) => s.likedItems);
  const bookmarkedItems = useStore((s) => s.bookmarkedItems);
  const viewedItems = useStore((s) => s.viewedItems);
  const hiddenItems = useStore((s) => s.hiddenItems);
  const readActivityIds = useStore((s) => s.readActivityIds);
  const markActivityRead = useStore((s) => s.markActivityRead);
  const setUnreadActivityCount = useStore((s) => s.setUnreadActivityCount);
  const { allItems } = useContentData();

  const itemMap = useMemo(() => {
    const m = new Map<string, ContentItem>();
    allItems.forEach((c) => m.set(c.id, c));
    return m;
  }, [allItems]);

  const traces = getTraces();

  // Build trace timestamp map: most recent trace per itemId+kind
  const traceTs = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of traces) {
      if (t.itemId) {
        const key = `${t.kind}:${t.itemId}`;
        m.set(key, Math.max(m.get(key) || 0, t.ts));
      }
    }
    return m;
  }, [traces]);

  const [renderTs] = useState(() => Date.now());

  const { yourActivity, intelligence } = useMemo(() => {
    const yourActivity: ActivityItem[] = [];
    const now = renderTs;

    // Likes
    for (const id of likedItems) {
      const item = itemMap.get(id);
      if (!item) continue;
      const ts = traceTs.get(`like:${id}`) || now;
      yourActivity.push({
        id: `like-${id}`,
        type: 'like',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={accentColors.red} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
        text: `You liked ${item.title} by ${item.author}`,
        ts,
        accent: accentColors.red,
        contentId: id,
        read: readActivityIds.has(`like-${id}`),
      });
    }

    // Bookmarks
    for (const id of bookmarkedItems) {
      const item = itemMap.get(id);
      if (!item) continue;
      const ts = traceTs.get(`bookmark:${id}`) || now;
      yourActivity.push({
        id: `save-${id}`,
        type: 'save',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={accentColors.amber} stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>,
        text: `You saved ${item.title}`,
        ts,
        accent: accentColors.amber,
        contentId: id,
        read: readActivityIds.has(`save-${id}`),
      });
    }

    // Views (most recent 5 only)
    const viewedArr = [...viewedItems];
    for (const id of viewedArr.slice(-5)) {
      const item = itemMap.get(id);
      if (!item) continue;
      const ts = traceTs.get(`detail_open:${id}`) || now;
      yourActivity.push({
        id: `view-${id}`,
        type: 'view',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
        text: `You viewed ${item.title}`,
        ts,
        accent: p.txM,
        contentId: id,
        read: readActivityIds.has(`view-${id}`),
      });
    }

    yourActivity.sort((a, b) => b.ts - a.ts);

    // Feed Intelligence
    const intelligence: ActivityItem[] = [];
    const signals = collectSignals(traces, likedItems, bookmarkedItems, viewedItems, hiddenItems, allItems);
    const health = computeFeedHealth(signals, allItems);

    if (signals.confidence >= 0.05) {
      const topTag = [...signals.tagAffinities.entries()].filter(([, v]) => v > 2).sort((a, b) => b[1] - a[1])[0];
      if (topTag) {
        intelligence.push({
          id: 'pref-top',
          type: 'preference',
          icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColors.green} strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
          text: `Your feed learned: you prefer ${topTag[0]} content`,
          ts: now - 5000,
          accent: accentColors.green,
          read: readActivityIds.has('pref-top'),
        });
      }
      intelligence.push({
        id: 'health-div',
        type: 'health',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColors.teal} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
        text: `Feed diversity: ${health.diversity}%`,
        ts: now - 10000,
        accent: accentColors.teal,
        read: readActivityIds.has('health-div'),
      });
    }

    return { yourActivity, intelligence };
  }, [likedItems, bookmarkedItems, viewedItems, hiddenItems, readActivityIds, itemMap, traceTs, traces, p.txM]);

  // Update unread count
  const allActivity = [...yourActivity, ...intelligence];
  const unreadCount = allActivity.filter((a) => !a.read).length;
  useEffect(() => { setUnreadActivityCount(unreadCount); }, [unreadCount, setUnreadActivityCount]);

  const [showCount, setShowCount] = useState(10);
  const hasContent = yourActivity.length > 0;

  const handleTap = (a: ActivityItem) => {
    markActivityRead(a.id);
    if (a.contentId && onDetailOpen) {
      const item = itemMap.get(a.contentId);
      if (item) onDetailOpen(item);
    }
  };

  const renderItem = (a: ActivityItem, i: number, baseDelay: number) => (
    <motion.div
      key={a.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: baseDelay + i * 0.05, duration: 0.35, ease }}
      onClick={() => handleTap(a)}
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: '14px 16px',
        background: p.card,
        borderRadius: 12,
        border: `1px solid ${p.cardB}`,
        cursor: a.contentId ? 'pointer' : 'default',
        transition: `border-color .2s ${E}`,
      }}
      onMouseEnter={(e) => { (e.currentTarget).style.borderColor = a.accent + '20'; }}
      onMouseLeave={(e) => { (e.currentTarget).style.borderColor = p.cardB; }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: a.accent + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: a.accent }}>
        {a.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.tx, lineHeight: 1.45, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.text}</p>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF, marginTop: 4, display: 'block' }}>
          {a.type === 'notification' ? '' : formatTimeAgo(a.ts)}
        </span>
      </div>
      {!a.read && (
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.accent, marginTop: 8, flexShrink: 0 }} />
      )}
    </motion.div>
  );

  const sectionLabel = (text: string, delay: number) => (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: p.txM, display: 'block', margin: '22px 0 12px' }}
    >
      {text}
    </motion.span>
  );

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 22, letterSpacing: '-0.025em', fontWeight: 400, color: p.tx, marginBottom: 20 }}>Activity</h2>

      {!hasContent && intelligence.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 16 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="1.5" strokeLinecap="round" opacity={0.4}>
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 18, fontStyle: 'italic', color: p.txM }}>No activity yet</span>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF, letterSpacing: '.06em' }}>Your interactions will appear here</span>
        </motion.div>
      ) : (
        <>
          {yourActivity.length > 0 && (
            <>
              {sectionLabel('Your Activity', 0)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {yourActivity.slice(0, showCount).map((a, i) => renderItem(a, i, 0.1))}
              </div>
              {yourActivity.length > showCount && (
                <button
                  onClick={() => setShowCount((c) => c + 10)}
                  style={{
                    display: 'block',
                    margin: '12px auto 0',
                    padding: '8px 20px',
                    borderRadius: 4,
                    border: `1px solid ${p.bdr}`,
                    background: 'transparent',
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 10,
                    color: p.txS,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: `all .18s ${E}`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.borderColor = p.tc + '50'; (e.currentTarget).style.color = p.tc; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.borderColor = p.bdr; (e.currentTarget).style.color = p.txS; }}
                >
                  [ load {Math.min(10, yourActivity.length - showCount)} more ]
                </button>
              )}
            </>
          )}

          {intelligence.length > 0 && (
            <>
              {sectionLabel('Feed Intelligence', 0.5)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {intelligence.map((a, i) => renderItem(a, i, 0.6))}
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
