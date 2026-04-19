'use client';

import { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { platformColors, accentColors, timeDecayFactor, E, MECH_EASE, contentMeta } from '@/lib/constants';
import Thumbnail from './Thumbnail';
import PlatformIcon from '@/components/atoms/PlatformIcon';
import Avatar from '@/components/atoms/Avatar';
import EngagementRow from '@/components/interactive/EngagementRow';
import { useLongPress } from '@/lib/useLongPress';
import type { ContentItem } from '@/lib/content';

interface StdCardProps {
  item: ContentItem;
  onTap: (item: ContentItem) => void;
  onLongPress?: (item: ContentItem, x: number, y: number) => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

const DENSITY_THUMB: Record<string, number> = { compact: 100, default: 145, spacious: 200 };
const DENSITY_PAD: Record<string, string> = { compact: '8px 14px 12px', default: '10px 18px 16px', spacious: '14px 22px 20px' };

function StdCard({ item, onTap, onLongPress: onLP }: StdCardProps) {
  const p = useStore((s) => s.p);
  const toggleLike = useStore((s) => s.toggleLike);
  const hapticEnabled = useStore((s) => s.hapticEnabled);
  const viewed = useStore((s) => s.viewedItems.has(item.id));
  const density = useStore((s) => s.feedDensity);
  const [hover, setHover] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ac = platformColors[item.platform];
  const decay = timeDecayFactor(item.time);
  const longPress = useLongPress((x, y) => onLP?.(item, x, y));
  const meta = contentMeta(item.platform, item.type, item.subtitle, item.extra);

  const handleThumbTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    tapCountRef.current++;
    if (tapCountRef.current === 1) {
      // Wait to see if a second tap arrives
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
        // Single tap — open detail
        onTap(item);
      }, 250);
    } else if (tapCountRef.current >= 2) {
      // Double-tap — like
      clearTimeout(tapTimerRef.current);
      tapCountRef.current = 0;
      toggleLike(item.id);
      if (hapticEnabled) navigator.vibrate?.(10);
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 700);
    }
  };

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: (item.delay || 0) / 1000, duration: 0.4, ease }}
      style={{
        background: p.card,
        borderRadius: 14,
        border: `1px solid ${hover ? ac + '22' : viewed ? p.bdrS : p.cardB}`,
        boxShadow: hover ? p.sh : 'none',
        opacity: viewed ? 0.85 * decay : decay,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color .18s cubic-bezier(0.25,0.1,0.25,1), box-shadow .18s cubic-bezier(0.25,0.1,0.25,1)',
        position: 'relative',
      }}
    >
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

      <div onClick={handleThumbTap} style={{ position: 'relative' }}>
        <Thumbnail platform={item.platform} h={DENSITY_THUMB[density]} hover={hover} videoId={item.videoId} channelId={item.channelId} />
        <AnimatePresence>
          {heartPop && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill={accentColors.red} stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dot-grid texture on content area */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', backgroundImage: `radial-gradient(circle, var(--dotgrid-color) var(--dotgrid-dot), transparent var(--dotgrid-dot))`, backgroundSize: 'var(--dotgrid-size) var(--dotgrid-size)', opacity: hover ? 0.04 : 0.02, pointerEvents: 'none', transition: 'opacity .4s ease' }} />
      <div style={{ padding: DENSITY_PAD[density] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
          {item.author && <Avatar name={item.author} color={ac} size={20} />}
          <PlatformIcon platform={item.platform} size={11} />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: ac, opacity: 0.8 }}>{item.platform}</span>
          {item.time && (
            <>
              <span style={{ color: p.txF, fontSize: 7 }}>·</span>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: decay < 0.9 ? p.txF : p.txM }}>{item.time}</span>
            </>
          )}
          {meta.readTime && (
            <>
              <span style={{ color: p.txF, fontSize: 7 }}>·</span>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF, letterSpacing: '.04em' }}>{meta.readTime}</span>
            </>
          )}
        </div>
        <h3 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 'clamp(14.5px, 3.8vw, 18px)', letterSpacing: '-0.02em', color: p.tx, fontWeight: 400, marginBottom: 5, lineHeight: 1.3, opacity: viewed ? 0.6 : 1, transition: 'opacity .3s ease' }}>{item.title}</h3>
        <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 12, color: p.txS, lineHeight: 1.55, opacity: viewed ? 0.7 : 1, transition: 'opacity .3s ease' }}>{item.subtitle}</p>
        <EngagementRow itemId={item.id} views={item.views} likes={item.likes} comments={item.comments} title={item.title} subtitle={item.subtitle} />
      </div>
    </motion.div>
  );
}

export default memo(StdCard);
