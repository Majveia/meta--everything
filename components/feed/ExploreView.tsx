'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { E } from '@/lib/constants';
import { type ContentItem } from '@/lib/content';
import { useContentData } from '@/lib/ContentProvider';
import TopicChips from '@/components/explore/TopicChips';
import SectionLabel from './SectionLabel';
import LiveCard from './LiveCard';
import StdCard from './StdCard';
import CompactCard from './CompactCard';

interface ExploreViewProps {
  onTap: (item: ContentItem) => void;
  onLongPress?: (item: ContentItem, x: number, y: number) => void;
}

function renderCard(item: ContentItem, onTap: (item: ContentItem) => void, onLongPress?: (item: ContentItem, x: number, y: number) => void) {
  if (item.type === 'live') return <LiveCard key={item.id} item={item} onTap={onTap} onLongPress={onLongPress} />;
  if (item.type === 'compact') return <CompactCard key={item.id} item={item} onTap={onTap} onLongPress={onLongPress} />;
  return <StdCard key={item.id} item={item} onTap={onTap} onLongPress={onLongPress} />;
}

export default function ExploreView({ onTap, onLongPress }: ExploreViewProps) {
  const p = useStore((s) => s.p);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const { exItems, allItems } = useContentData();
  const topics = ['All', 'AI', 'Science', 'Coding', 'Gaming', 'Startups', 'Philosophy', 'Design', 'Music', 'Culture'];
  // Explore = no Substacks, YouTube trending focus
  const explorePool = exItems.filter((c) => c.platform !== 'substack');
  const filtered = activeTopic
    ? allItems.filter((c) => c.platform !== 'substack' && c.tags && c.tags.includes(activeTopic.toLowerCase()))
    : explorePool;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 14,
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Dot-grid decorative background — Nothing-inspired atmosphere */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, backgroundImage: `radial-gradient(circle, var(--dotgrid-color) var(--dotgrid-dot), transparent var(--dotgrid-dot))`, backgroundSize: 'var(--dotgrid-size) var(--dotgrid-size)', opacity: 0.03, pointerEvents: 'none', maskImage: 'radial-gradient(ellipse at top right, black 20%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at top right, black 20%, transparent 70%)' }} />
      <h2 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 22, letterSpacing: '-0.025em', fontWeight: 400, color: p.tx, marginBottom: 18 }}>Explore</h2>

      {/* Trending button */}
      {!activeTopic && (
        <button
          onClick={() => setActiveTopic('All')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            marginBottom: 16,
            borderRadius: 10,
            border: `1px solid ${p.tc}30`,
            background: `${p.tc}08`,
            cursor: 'pointer',
            transition: `all .25s ${E}`,
            fontFamily: "'SF Mono', monospace",
            fontSize: 10,
            letterSpacing: '.08em',
            textTransform: 'uppercase' as const,
            color: p.tc,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = `${p.tc}14`; e.currentTarget.style.borderColor = `${p.tc}50`; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${p.tc}08`; e.currentTarget.style.borderColor = `${p.tc}30`; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span style={{ opacity: 0.5 }}>[ </span>Trending<span style={{ opacity: 0.5 }}> ]</span>
        </button>
      )}

      <TopicChips topics={topics} active={activeTopic} onSelect={setActiveTopic} />
      <SectionLabel label={activeTopic ? 'Results' : 'All Content'} />
      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 14 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={p.txF} strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <p style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 16, color: p.txS, letterSpacing: '-0.02em', textAlign: 'center' }}>
            No results for &ldquo;{activeTopic}&rdquo;
          </p>
          <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.txM, textAlign: 'center' }}>
            Try a different topic
          </p>
        </div>
      ) : (
        <div style={gridStyle}>
          {filtered.map((f, i) => renderCard({ ...f, delay: i * 80 }, onTap, onLongPress))}
        </div>
      )}
    </div>
  );
}
