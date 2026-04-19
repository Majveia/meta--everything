'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { platformColors, E } from '@/lib/constants';
import PlatformIcon from '@/components/atoms/PlatformIcon';
import Avatar from '@/components/atoms/Avatar';
import type { ContentItem } from '@/lib/content';

interface ContinueSectionProps {
  pool: ContentItem[];
  onTap: (item: ContentItem) => void;
}

export default function ContinueSection({ pool, onTap }: ContinueSectionProps) {
  const p = useStore((s) => s.p);
  const detailReadPositions = useStore((s) => s.detailReadPositions);

  const items = useMemo(() => {
    const itemMap = new Map(pool.map((i) => [i.id, i]));
    return Object.entries(detailReadPositions)
      .filter(([, progress]) => progress >= 0.05 && progress <= 0.9)
      .sort((a, b) => b[1] - a[1])
      .map(([id, progress]) => {
        const item = itemMap.get(id);
        return item ? { item, progress } : null;
      })
      .filter((x): x is { item: ContentItem; progress: number } => x !== null)
      .slice(0, 8);
  }, [detailReadPositions, pool]);

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 2 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.tc, opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: p.txM }}>
          <span style={{ opacity: 0.35 }}>[ </span>Continue<span style={{ opacity: 0.35 }}> ]</span>
        </span>
        <div style={{ flex: 1, height: 1, marginLeft: 8, backgroundImage: `radial-gradient(circle, ${p.txF} 0.5px, transparent 0.5px)`, backgroundSize: '6px 6px', backgroundRepeat: 'repeat-x', opacity: 0.4 }} />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 6,
          paddingLeft: 2,
          paddingRight: 2,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map(({ item, progress }, i) => {
          const ac = platformColors[item.platform];
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={() => onTap(item)}
              style={{
                flexShrink: 0,
                width: 220,
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${p.cardB}`,
                background: p.card,
                cursor: 'pointer',
                transition: `all .2s ${E}`,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = ac + '30'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = p.cardB; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {item.author && <Avatar name={item.author} color={ac} size={18} />}
                <PlatformIcon platform={item.platform} size={10} />
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: ac, opacity: 0.8 }}>{item.platform}</span>
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, color: p.txF, marginLeft: 'auto' }}>{Math.round(progress * 100)}%</span>
              </div>
              <h4 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 14, letterSpacing: '-0.02em', color: p.tx, fontWeight: 400, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h4>
              {/* Segmented progress bar */}
              <div style={{ display: 'flex', gap: 1.5, height: 2, marginTop: 'auto' }}>
                {Array.from({ length: 12 }, (_, seg) => {
                  const segPct = (seg + 1) / 12;
                  const filled = progress >= segPct;
                  return (
                    <div
                      key={seg}
                      style={{
                        flex: 1,
                        height: '100%',
                        background: filled ? p.tc : p.bdr,
                        opacity: filled ? 1 : 0.4,
                        borderRadius: 0.5,
                      }}
                    />
                  );
                })}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
