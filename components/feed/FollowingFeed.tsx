'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { E } from '@/lib/constants';
import { platformColors } from '@/lib/constants';
import { useScrollPastTracker } from '@/lib/traces';
import { getFollowingSections, type FollowingSection } from '@/lib/following-data';
import SectionLabel from './SectionLabel';
import LiveCard from './LiveCard';
import StdCard from './StdCard';
import CompactCard from './CompactCard';
import type { ContentItem } from '@/lib/content';

interface FollowingFeedProps {
  onTap: (item: ContentItem) => void;
  onLongPress?: (item: ContentItem, x: number, y: number) => void;
}

type FilterChip = 'all' | 'live' | 'youtube' | 'fortnite' | 'irl' | 'music' | 'souls';

const FILTER_CHIPS: { id: FilterChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'fortnite', label: 'Fortnite' },
  { id: 'irl', label: 'IRL' },
  { id: 'music', label: 'Music' },
  { id: 'souls', label: 'Souls' },
];

function TrackedCard({ item, onTap, onLongPress }: { item: ContentItem; onTap: (item: ContentItem) => void; onLongPress?: (item: ContentItem, x: number, y: number) => void }) {
  const ref = useScrollPastTracker(item.id);
  const card = item.type === 'live'
    ? <LiveCard item={item} onTap={onTap} onLongPress={onLongPress} />
    : item.type === 'compact'
    ? <CompactCard item={item} onTap={onTap} onLongPress={onLongPress} />
    : <StdCard item={item} onTap={onTap} onLongPress={onLongPress} />;
  return (
    <div ref={ref} style={item.type === 'live' ? { gridColumn: '1 / -1' } : undefined}>
      {card}
    </div>
  );
}

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

function filterSection(section: FollowingSection, chip: FilterChip): ContentItem[] {
  if (chip === 'all') return section.items;
  if (chip === 'live') return section.items.filter((i) => i.isLive);
  if (chip === 'youtube') return section.platform === 'youtube' ? section.items : [];
  if (chip === 'fortnite') return section.id === 'tw-fortnite_comp' ? section.items : [];
  if (chip === 'irl') return section.id === 'tw-irl_chatting' ? section.items : [];
  if (chip === 'music') return section.id === 'tw-music_priority' ? section.items : [];
  if (chip === 'souls') return section.id === 'tw-souls_priority' ? section.items : [];
  return section.items;
}

export default function FollowingFeed({ onTap, onLongPress }: FollowingFeedProps) {
  const p = useStore((s) => s.p);
  const hiddenItems = useStore((s) => s.hiddenItems);
  const [activeChip, setActiveChip] = useState<FilterChip>('all');

  const sections = useMemo(() => getFollowingSections(), []);

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(var(--grid-min-col, 280px), 1fr))',
    gap: 14,
  };

  return (
    <div>
      {/* Filter chips — horizontal scroll */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 14,
          paddingLeft: 2,
          paddingRight: 2,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {FILTER_CHIPS.map((chip, i) => {
          const active = activeChip === chip.id;
          return (
            <motion.button
              key={chip.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={() => setActiveChip(chip.id)}
              style={{
                flexShrink: 0,
                padding: '5px 14px',
                borderRadius: 8,
                border: `1px solid ${active ? p.tc : p.bdr}`,
                background: active ? `${p.tc}18` : 'transparent',
                color: active ? p.tc : p.txS,
                fontFamily: "'SF Mono', monospace",
                fontSize: 10,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: `all .2s ${E}`,
                whiteSpace: 'nowrap',
              }}
            >
              {chip.label}
            </motion.button>
          );
        })}
      </div>

      {/* Sections */}
      {sections.map((section, sIdx) => {
        const filtered = filterSection(section, activeChip);
        const visible = withTypeDelay(filtered.filter((i) => !hiddenItems.has(i.id)));
        if (visible.length === 0) return null;

        const live = visible.filter((i) => i.isLive);
        const rest = visible.filter((i) => !i.isLive);
        const hasLive = live.length > 0;

        // Platform accent dot color
        const platformColor = section.platform === 'youtube' ? platformColors.youtube : platformColors.twitch;

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + sIdx * 0.06, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '22px 0 12px', paddingLeft: 2 }}>
              {/* Platform dot */}
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: platformColor, opacity: 0.7, flexShrink: 0 }} />
              {hasLive && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E84040', animation: 'livePulse 2s infinite', flexShrink: 0 }} />
              )}
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: p.txM }}>
                <span style={{ opacity: 0.35 }}>[ </span>
                {section.label}
                {section.totalCount && section.totalCount > visible.length && (
                  <span style={{ color: p.txF, marginLeft: 6, fontSize: 9 }}>
                    {visible.length} / {section.totalCount}
                  </span>
                )}
                <span style={{ opacity: 0.35 }}> ]</span>
              </span>
              {/* Dot-grid accent line */}
              <div style={{ flex: 1, height: 1, marginLeft: 8, backgroundImage: `radial-gradient(circle, ${p.txF} 0.5px, transparent 0.5px)`, backgroundSize: '6px 6px', backgroundRepeat: 'repeat-x', opacity: 0.4 }} />
            </div>

            {/* Live items first */}
            {hasLive && (
              <div style={gridStyle}>
                {live.map((item) => (
                  <TrackedCard key={item.id} item={item} onTap={onTap} onLongPress={onLongPress} />
                ))}
              </div>
            )}

            {/* Rest of items */}
            {rest.length > 0 && (
              <div style={{ ...gridStyle, marginTop: hasLive ? 14 : 0 }}>
                {rest.map((item) => (
                  <TrackedCard key={item.id} item={item} onTap={onTap} onLongPress={onLongPress} />
                ))}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Empty state for filtered view */}
      {activeChip !== 'all' && sections.every((s) => filterSection(s, activeChip).filter((i) => !hiddenItems.has(i.id)).length === 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 12, opacity: 0.3 }}>~</div>
          <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txM, letterSpacing: '.04em' }}>
            No {activeChip} content right now
          </p>
        </div>
      )}
    </div>
  );
}
