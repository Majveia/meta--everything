'use client';

import { useStore } from '@/lib/store';
import { useScrollPastTracker } from '@/lib/traces';
import { parseRelativeTimeMs } from '@/lib/constants';
import SectionLabel from './SectionLabel';
import LiveCard from './LiveCard';
import StdCard from './StdCard';
import CompactCard from './CompactCard';
import type { ContentItem } from '@/lib/content';

interface FeedSectionProps {
  items: ContentItem[];
  onTap: (item: ContentItem) => void;
  onPlay?: (item: ContentItem) => void;
  onLongPress?: (item: ContentItem, x: number, y: number) => void;
}

function TrackedCard({ item, onTap, onPlay, onLongPress }: { item: ContentItem; onTap: (item: ContentItem) => void; onPlay?: (item: ContentItem) => void; onLongPress?: (item: ContentItem, x: number, y: number) => void }) {
  const ref = useScrollPastTracker(item.id);
  const card = item.type === 'live'
    ? <LiveCard item={item} onTap={onTap} onPlay={onPlay} onLongPress={onLongPress} />
    : item.type === 'compact'
    ? <CompactCard item={item} onTap={onTap} onLongPress={onLongPress} />
    : <StdCard item={item} onTap={onTap} onPlay={onPlay} onLongPress={onLongPress} />;
  return (
    <div ref={ref} style={item.type === 'live' ? { gridColumn: '1 / -1' } : undefined}>
      {card}
    </div>
  );
}

// Type-aware stagger delays: live=instant, std=80ms, compact=120ms
function withTypeDelay(items: ContentItem[]): ContentItem[] {
  let liveIdx = 0, stdIdx = 0, compactIdx = 0;
  return items.map((item) => {
    let delay: number;
    if (item.type === 'live') { delay = liveIdx * 40; liveIdx++; }
    else if (item.type === 'compact') { delay = compactIdx * 120; compactIdx++; }
    else { delay = stdIdx * 80; stdIdx++; }
    return { ...item, delay };
  });
}

function renderCard(item: ContentItem, onTap: (item: ContentItem) => void, onPlay?: (item: ContentItem) => void, onLongPress?: (item: ContentItem, x: number, y: number) => void) {
  return <TrackedCard key={item.id} item={item} onTap={onTap} onPlay={onPlay} onLongPress={onLongPress} />;
}

function NewSinceDivider({ count, color, accent }: { count: number; color: string; accent: string }) {
  if (count <= 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 10px', padding: '0 4px' }}>
      <div style={{ flex: 1, height: 1, background: accent + '25' }} />
      <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, letterSpacing: '.06em', color, textTransform: 'uppercase', flexShrink: 0 }}>
        {count} new since last visit
      </span>
      <div style={{ flex: 1, height: 1, background: accent + '25' }} />
    </div>
  );
}

export default function FeedSection({ items, onTap, onPlay, onLongPress }: FeedSectionProps) {
  const p = useStore((s) => s.p);
  const hiddenItems = useStore((s) => s.hiddenItems);
  const toggleHidden = useStore((s) => s.toggleHidden);
  const lastVisit = useStore((s) => s.lastVisitTimestamp);
  const visible = withTypeDelay(items.filter((i) => !hiddenItems.has(i.id)));
  const live = visible.filter((i) => i.type === 'live');
  const recent = visible.filter((i) => i.type !== 'live' && i.time && !i.time.includes('d') && parseInt(i.time) < 7);
  const earlier = visible.filter((i) => !live.includes(i) && !recent.includes(i));

  // Count items newer than last visit
  const msSinceLastVisit = lastVisit > 0 ? Date.now() - lastVisit : 0;
  const newCount = lastVisit > 0
    ? visible.filter((i) => parseRelativeTimeMs(i.time) < msSinceLastVisit).length
    : 0;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(var(--grid-min-col, 280px), 1fr))',
    gap: 'var(--grid-gap, 14px)',
  };

  if (visible.length === 0) {
    const hiddenCount = items.filter((i) => hiddenItems.has(i.id)).length;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 12, opacity: 0.3 }}>~</div>
        <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txM, letterSpacing: '.04em', marginBottom: 12 }}>
          {hiddenCount > 0 ? `${hiddenCount} item${hiddenCount > 1 ? 's' : ''} hidden` : 'Nothing here yet'}
        </p>
        {hiddenCount > 0 && (
          <button
            onClick={() => items.forEach((i) => { if (hiddenItems.has(i.id)) toggleHidden(i.id); })}
            style={{
              fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.tc,
              background: 'transparent', border: `1px solid ${p.tc}30`,
              borderRadius: 4, padding: '5px 14px', cursor: 'pointer',
              letterSpacing: '.06em', textTransform: 'uppercase',
            }}
          >
            [ unhide all ]
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {newCount > 0 && <NewSinceDivider count={newCount} color={p.tc} accent={p.tc} />}
      {recent.length > 0 && (
        <>
          <SectionLabel label="Recent" />
          <div style={gridStyle}>{recent.map((f) => renderCard(f, onTap, onPlay, onLongPress))}</div>
        </>
      )}
      {live.length > 0 && (
        <>
          <SectionLabel label="Live Now" live />
          <div style={gridStyle}>{live.map((f) => renderCard(f, onTap, onPlay, onLongPress))}</div>
        </>
      )}
      {earlier.length > 0 && (
        <>
          <SectionLabel label="Earlier" />
          <div style={gridStyle}>{earlier.map((f) => renderCard(f, onTap, onPlay, onLongPress))}</div>
        </>
      )}
    </div>
  );
}
