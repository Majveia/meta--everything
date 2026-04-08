'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { pushTrace } from '@/lib/traces';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { motion, AnimatePresence } from 'framer-motion';
import { platformColors, E, EXIT_EASE } from '@/lib/constants';
import { type ContentItem } from '@/lib/content';
import { useContentData } from '@/lib/ContentProvider';
import Thumbnail from '@/components/feed/Thumbnail';
import PlatformIcon from '@/components/atoms/PlatformIcon';
import Avatar from '@/components/atoms/Avatar';
import EngagementRow from '@/components/interactive/EngagementRow';
import CommentsSection from './CommentsSection';

interface DetailSheetProps {
  item: ContentItem | null;
  onClose: () => void;
  onSwitch?: (item: ContentItem) => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

export default function DetailSheet({ item, onClose, onSwitch }: DetailSheetProps) {
  return (
    <AnimatePresence>
      {item && <DetailSheetInner key={item.id} item={item} onClose={onClose} onSwitch={onSwitch} />}
    </AnimatePresence>
  );
}

function DetailSheetInner({ item, onClose, onSwitch }: { item: ContentItem; onClose: () => void; onSwitch?: (item: ContentItem) => void }) {
  const p = useStore((s) => s.p);
  const addToast = useStore((s) => s.addToast);
  const markViewed = useStore((s) => s.markViewed);
  const saveDetailReadPosition = useStore((s) => s.saveDetailReadPosition);
  const savedProgress = useStore((s) => s.detailReadPositions[item.id] ?? 0);
  const ac = platformColors[item.platform];

  const openTs = useRef(Date.now());
  const sheetRef = useRef<HTMLDivElement>(null);
  useFocusTrap(sheetRef, true);
  const [playing, setPlaying] = useState(false);
  const [readProgress, setReadProgress] = useState(savedProgress);
  const [expanded, setExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 640);
  const canPlay = !!(item.videoId || item.channelId);

  const readProgressRef = useRef(readProgress);
  readProgressRef.current = readProgress;

  useEffect(() => {
    markViewed(item.id);
    pushTrace({ kind: 'detail_open', itemId: item.id });
    openTs.current = Date.now();
    setPlaying(false);
    setExpanded(false);
    const prevTitle = document.title;
    document.title = `${item.title} — meta//everything`;

    // Restore saved scroll position after layout settles
    const restoredProgress = useStore.getState().detailReadPositions[item.id] ?? 0;
    setReadProgress(restoredProgress);
    if (restoredProgress > 0 && sheetRef.current) {
      requestAnimationFrame(() => {
        const el = sheetRef.current;
        if (!el) return;
        const max = el.scrollHeight - el.clientHeight;
        if (max > 0) el.scrollTop = restoredProgress * max;
      });
    }

    return () => {
      document.title = prevTitle;
      // Save reading position on close
      if (readProgressRef.current > 0.02) {
        saveDetailReadPosition(item.id, readProgressRef.current);
      }
      const dwellMs = Date.now() - openTs.current;
      pushTrace({ kind: 'dwell', itemId: item.id, meta: { dwellMs } });
      pushTrace({ kind: 'detail_close', itemId: item.id });
    };
  }, [item.id, item.title, markViewed, saveDetailReadPosition]);

  const { allItems } = useContentData();
  const related = useMemo(() => {
    if (!item.tags || item.tags.length === 0) return [];
    const tagSet = new Set(item.tags);
    return allItems
      .filter((c) => c.id !== item.id && c.tags && c.tags.some((t) => tagSet.has(t)))
      .slice(0, 3);
  }, [allItems, item.id, item.tags]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.6)' }}
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        initial={{ y: '100%' }}
        animate={{ y: 0, transition: { duration: 0.4, ease } }}
        exit={{ y: '100%', transition: { duration: 0.25, ease: EXIT_EASE } }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 160 || info.velocity.y > 500) {
            if (expanded) {
              setExpanded(false);
            } else {
              onClose();
            }
          } else if (info.offset.y < -100 || info.velocity.y < -500) {
            setExpanded(true);
          }
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const max = el.scrollHeight - el.clientHeight;
          if (max > 0) setReadProgress(Math.min(1, el.scrollTop / max));
        }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxWidth: expanded ? '100%' : 'var(--sheet-max-width, 640px)',
          margin: '0 auto',
          top: expanded ? 0 : undefined,
          zIndex: 151,
          maxHeight: expanded ? '100dvh' : '88vh',
          height: expanded ? '100dvh' : undefined,
          overflowY: 'auto',
          background: p.card,
          borderRadius: expanded ? 0 : '20px 20px 0 0',
          boxShadow: expanded ? 'none' : p.shL,
          transition: `max-height .4s ${E}, border-radius .4s ${E}, top .4s ${E}, box-shadow .4s ${E}`,
        }}
      >
        {/* Reading progress — Nothing-style segmented bar */}
        <div style={{ position: 'sticky', top: 0, left: 0, right: 0, height: 3, zIndex: 10, display: 'flex', gap: 2, padding: '0 1px', borderRadius: expanded ? 0 : '20px 20px 0 0', overflow: 'hidden' }}>
          {Array.from({ length: 20 }, (_, i) => {
            const segPct = (i + 1) / 20;
            const filled = readProgress >= segPct;
            const active = !filled && readProgress >= (i / 20) && readProgress < segPct;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '100%',
                  background: filled ? p.tc : active ? p.tcG : p.bdr,
                  transition: 'background 0.12s ease-out',
                  opacity: filled ? 1 : active ? 0.7 : 0.3,
                }}
              />
            );
          })}
        </div>

        {/* Drag handle + expand hint — keyboard accessible */}
        <div
          role="button"
          tabIndex={0}
          aria-label={expanded ? 'Minimize sheet' : 'Close sheet'}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: expanded ? '8px 0 4px' : '12px 0 4px', cursor: 'pointer' }}
          onClick={() => expanded ? setExpanded(false) : onClose()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expanded ? setExpanded(false) : onClose(); } }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 2, background: p.bdrH }} />
          {!expanded && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="2" strokeLinecap="round" style={{ marginTop: 4, opacity: 0.7 }}>
              <polyline points="18 15 12 9 6 15" />
            </svg>
          )}
        </div>

        {/* Minimize button when expanded */}
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            aria-label="Minimize"
            style={{
              position: 'absolute',
              top: 12,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${p.bdr}`,
              background: p.bgS,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              transition: `all .2s ${E}`,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = p.bgH; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = p.bgS; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        {/* Thumbnail / Video embed */}
        {playing && item.videoId && item.platform === 'youtube' ? (
          <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: p.bg }}>
            <iframe src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&mute=1`} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        ) : playing && item.channelId && item.platform === 'twitch' ? (
          <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: p.bg }}>
            <iframe src={`https://player.twitch.tv/?channel=${item.channelId}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&muted=true`} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          </div>
        ) : playing && item.channelId && item.platform === 'kick' ? (
          <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: p.bg }}>
            <iframe src={`https://player.kick.com/${item.channelId}`} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          </div>
        ) : (
          <Thumbnail platform={item.platform} h={expanded ? 260 : 200} hover={false} isLive={item.type === 'live'} videoId={item.videoId} channelId={item.channelId} />
        )}

        {/* Viewer count badge */}
        {item.viewers && (
          <div style={{ position: 'absolute', top: expanded ? 52 : 60, right: 24, padding: '5px 12px', borderRadius: 6, background: 'rgba(10,10,10,.5)', backdropFilter: 'blur(8px)', zIndex: 2 }}>
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.tx }}>{item.viewers}</span>
          </div>
        )}

        <div style={{ padding: '0 24px 32px' }}>
          {/* Author info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            {item.author && <Avatar name={item.author} color={ac} size={36} />}
            <div>
              {item.author && <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 14, fontWeight: 500, color: p.tx, display: 'block' }}>{item.author}</span>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <PlatformIcon platform={item.platform} size={12} />
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: ac }}>{item.platform}</span>
                {item.time && (
                  <>
                    <span style={{ color: p.txF, fontSize: 7 }}>&middot;</span>
                    <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF }}>{item.time}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Title + content */}
          <h2 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 'clamp(20px, 5.5vw, 28px)', letterSpacing: '-0.03em', color: p.tx, fontWeight: 400, marginBottom: 10, lineHeight: 1.25 }}>{item.title}</h2>
          <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 14, color: p.txS, lineHeight: 1.7, marginBottom: 6 }}>{item.subtitle}</p>
          {item.extra && <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 14, color: p.txS, lineHeight: 1.7 }}>{item.extra}</p>}

          {/* Tags — Nothing-style chips: border, no fill, monospace */}
          {item.tags && (
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {item.tags.map((t, i) => (
                <span key={i} style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, padding: '3px 10px', borderRadius: 4, border: `1px solid ${ac}30`, background: 'transparent', color: ac, letterSpacing: '.06em', textTransform: 'uppercase' }}>#{t}</span>
              ))}
            </div>
          )}

          {/* Engagement */}
          <EngagementRow itemId={item.id} views={item.views} likes={item.likes} comments={item.comments} title={item.title} subtitle={item.subtitle} />

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canPlay) setPlaying(!playing);
              }}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                border: 'none',
                background: playing ? p.bgH : ac,
                color: playing ? p.tx : '#fff',
                fontFamily: "var(--font-body), 'Outfit', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: `all .2s ${E}`,
                letterSpacing: '.01em',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.opacity = '0.9'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.opacity = '1'; }}
            >
              {playing ? 'Stop' : item.type === 'live' ? 'Watch Now' : item.platform === 'x' ? 'View Thread' : item.platform === 'substack' ? 'Read Article' : 'Watch'}
            </button>
            <button
              onClick={async () => {
                pushTrace({ kind: 'share', itemId: item.id });
                const text = `${item.title} — ${item.subtitle}`;
                if (navigator.share) {
                  try { await navigator.share({ title: item.title, text }); return; } catch {}
                }
                try { await navigator.clipboard.writeText(text); addToast('Copied to clipboard'); } catch { addToast('Could not copy'); }
              }}
              style={{ padding: '12px 16px', borderRadius: 10, border: `1px solid ${p.bdr}`, background: 'transparent', color: p.tx, fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, cursor: 'pointer' }}
            >
              Share
            </button>
          </div>

          {/* Comments Section */}
          <CommentsSection itemId={item.id} videoId={item.videoId} commentCount={item.comments} />

          {/* Related content */}
          {related.length > 0 && (
            <>
              <div style={{ margin: '28px 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: p.txM }}>
                  <span style={{ opacity: 0.35 }}>[ </span>Related<span style={{ opacity: 0.35 }}> ]</span>
                </span>
                <div style={{ flex: 1, height: 1, backgroundImage: `radial-gradient(circle, ${p.txF} 0.5px, transparent 0.5px)`, backgroundSize: '6px 6px', backgroundRepeat: 'repeat-x', opacity: 0.3 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {related.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onSwitch?.(r)}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: p.bgS,
                      borderRadius: 10,
                      border: `1px solid ${p.cardB}`,
                      cursor: 'pointer',
                      transition: `all .2s ${E}`,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.borderColor = platformColors[r.platform] + '20'; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.borderColor = p.cardB; }}
                  >
                    {r.author && <Avatar name={r.author} color={platformColors[r.platform]} size={28} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 14, color: p.tx, display: 'block', lineHeight: 1.3, marginBottom: 2 }}>{r.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <PlatformIcon platform={r.platform} size={10} />
                        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, color: platformColors[r.platform], letterSpacing: '.08em', textTransform: 'uppercase' }}>{r.platform}</span>
                        {r.time && <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, color: p.txF }}>&middot; {r.time}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
