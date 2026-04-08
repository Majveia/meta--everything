'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { platformColors, accentColors, timeDecayFactor, E } from '@/lib/constants';
import { useTextLayout } from '@/lib/useTextLayout';
import PlatformIcon from '@/components/atoms/PlatformIcon';
import Avatar from '@/components/atoms/Avatar';
import EngagementRow from '@/components/interactive/EngagementRow';
import { useLongPress } from '@/lib/useLongPress';
import type { ContentItem } from '@/lib/content';

interface CompactCardProps {
  item: ContentItem;
  onTap: (item: ContentItem) => void;
  onLongPress?: (item: ContentItem, x: number, y: number) => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

function CompactCard({ item, onTap, onLongPress: onLP }: CompactCardProps) {
  const p = useStore((s) => s.p);
  const viewed = useStore((s) => s.viewedItems.has(item.id));
  const [hover, setHover] = useState(false);
  const ac = platformColors[item.platform];
  const decay = timeDecayFactor(item.time);
  const longPress = useLongPress((x, y) => onLP?.(item, x, y));
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(244); // default minus padding

  // Pretext: measure subtitle to detect truncation (3 lines max)
  const subtitleLayout = useTextLayout(
    item.subtitle,
    '12px Outfit, sans-serif',
    cardWidth,
    12 * 1.55,
    3
  );

  // Track card width for Pretext measurement
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      // Card width minus horizontal padding (18px * 2)
      setCardWidth(entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      role="article"
      aria-label={`${item.title} by ${item.author} on ${item.platform}`}
      tabIndex={0}
      data-card=""
      data-item-id={item.id}
      onClick={() => onTap(item)}
      onKeyDown={(e) => { if (e.key === 'Enter') onTap(item); }}
      onMouseDown={longPress.onMouseDown}
      onTouchStart={longPress.onTouchStart}
      onMouseUp={longPress.onMouseUp}
      onTouchEnd={longPress.onTouchEnd}
      onClickCapture={longPress.onClickCapture}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); longPress.onMouseLeave(); }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: (item.delay || 0) / 1000, duration: 0.35, ease }}
      style={{
        background: p.card,
        borderRadius: 12,
        border: `1px solid ${hover ? ac + '1C' : viewed ? p.bdrS : p.cardB}`,
        padding: '16px 18px',
        opacity: viewed ? 0.85 * decay : decay,
        cursor: 'pointer',
        transition: 'border-color .18s cubic-bezier(0.25,0.1,0.25,1), box-shadow .18s cubic-bezier(0.25,0.1,0.25,1)',
        position: 'relative',
      }}
    >
      {/* Dot-grid texture overlay — Nothing-inspired */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 12, backgroundImage: `radial-gradient(circle, var(--dotgrid-color) var(--dotgrid-dot), transparent var(--dotgrid-dot))`, backgroundSize: 'var(--dotgrid-size) var(--dotgrid-size)', opacity: hover ? 0.04 : 0.02, pointerEvents: 'none', transition: 'opacity .4s ease' }} />
      {/* Signal badge — bracketed ASCII */}
      {item.signalBadge && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, padding: '2px 8px', borderRadius: 3, background: item.signalBadge.type === 'affinity' ? p.tc : item.signalBadge.type === 'fresh' ? accentColors.green : item.signalBadge.type === 'serendipity' ? accentColors.teal : accentColors.amber, border: '1px solid rgba(255,255,255,.08)' }}>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8, color: '#fff', letterSpacing: '.1em', fontWeight: 500, textTransform: 'uppercase' }}>
            <span style={{ opacity: 0.5 }}>[ </span>{item.signalBadge.label}<span style={{ opacity: 0.5 }}> ]</span>
          </span>
        </div>
      )}
      {/* NEW badge — bracketed ASCII */}
      {item.isNew && !viewed && !item.signalBadge && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3, padding: '2px 8px', borderRadius: 3, background: p.tc, border: '1px solid rgba(255,255,255,.08)' }}>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8, color: '#fff', letterSpacing: '.1em', fontWeight: 500 }}>
            <span style={{ opacity: 0.5 }}>[ </span>NEW<span style={{ opacity: 0.5 }}> ]</span>
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        {item.author && <Avatar name={item.author} color={ac} size={26} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          {item.author && <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 12.5, fontWeight: 500, color: p.tx }}>{item.author}</span>}
          <PlatformIcon platform={item.platform} size={11} />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: ac, opacity: 0.8 }}>{item.platform}</span>
          {item.time && (
            <>
              <span style={{ color: p.txF, fontSize: 7 }}>·</span>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: decay < 0.9 ? p.txF : p.txM }}>{item.time}</span>
            </>
          )}
        </div>
      </div>
      <div ref={cardRef}>
        <h3 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 'clamp(13.5px, 3.5vw, 16.5px)', letterSpacing: '-0.015em', color: p.tx, fontWeight: 400, marginBottom: 5, lineHeight: 1.35, opacity: viewed ? 0.6 : 1, transition: 'opacity .3s ease' }}>{item.title}</h3>
        <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 12, color: p.txS, lineHeight: 1.55, opacity: viewed ? 0.7 : 1, transition: 'opacity .3s ease', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.subtitle}
        </p>
        {/* Pretext-measured truncation indicator */}
        {subtitleLayout.ready && subtitleLayout.truncated && (
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF, letterSpacing: '.08em', marginTop: 2, display: 'inline-block' }}>
            <span style={{ opacity: 0.4 }}>[ </span>+{subtitleLayout.lineCount - 3} more<span style={{ opacity: 0.4 }}> ]</span>
          </span>
        )}
      </div>
      <EngagementRow itemId={item.id} views={item.views} likes={item.likes} comments={item.comments} title={item.title} subtitle={item.subtitle} />
    </motion.div>
  );
}

export default memo(CompactCard);
