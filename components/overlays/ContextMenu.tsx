'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { pushTrace } from '@/lib/traces';
import type { ContentItem } from '@/lib/content';

const ease = [0.16, 1, 0.3, 1] as const;

interface ContextMenuProps {
  item: ContentItem | null;
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({ item, x, y, onClose }: ContextMenuProps) {
  const p = useStore((s) => s.p);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const toggleHidden = useStore((s) => s.toggleHidden);
  const addToast = useStore((s) => s.addToast);
  const isSaved = useStore((s) => item ? s.bookmarkedItems.has(item.id) : false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;
    const handle = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('mousedown', handle);
    window.addEventListener('touchstart', handle);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handle);
      window.removeEventListener('touchstart', handle);
      window.removeEventListener('keydown', handleKey);
    };
  }, [item, onClose]);

  // Clamp position to viewport
  const menuW = 180;
  const menuH = 264;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const clampedX = Math.min(x, vw - menuW - 12);
  const clampedY = y + menuH > vh - 80 ? y - menuH : y;

  const actions = [
    {
      label: isSaved ? 'Unsave' : 'Save',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill={isSaved ? p.am : 'none'} stroke={isSaved ? p.am : p.txS} strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
      action: () => {
        if (!item) return;
        const wasSaved = isSaved;
        toggleBookmark(item.id);
        addToast(wasSaved ? 'Removed from bookmarks' : 'Saved to bookmarks', wasSaved ? undefined : () => toggleBookmark(item.id));
      },
    },
    {
      label: 'Share',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.txS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      ),
      action: async () => {
        if (!item) return;
        const text = `${item.title} — ${item.subtitle}`;
        if (navigator.share) {
          try { await navigator.share({ title: item.title, text }); return; } catch {}
        }
        try { await navigator.clipboard.writeText(text); addToast('Copied to clipboard'); } catch { addToast('Could not copy'); }
      },
    },
    {
      label: 'More like this',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.txS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      ),
      action: () => {
        if (!item) return;
        pushTrace({ kind: 'preference_boost', itemId: item.id, meta: { tags: item.tags.join(',') } });
        addToast("You'll see more like this");
      },
    },
    {
      label: 'Less like this',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.txS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
          <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
        </svg>
      ),
      action: () => {
        if (!item) return;
        pushTrace({ kind: 'preference_suppress', itemId: item.id, meta: { tags: item.tags.join(',') } });
        addToast("You'll see less like this");
      },
    },
    {
      label: 'Hide',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.txS} strokeWidth="2" strokeLinecap="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        </svg>
      ),
      action: () => {
        if (!item) return;
        pushTrace({ kind: 'hide', itemId: item.id });
        toggleHidden(item.id);
        addToast('Hidden from feed', () => toggleHidden(item.id));
      },
    },
    {
      label: 'Report',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.txS} strokeWidth="2" strokeLinecap="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      ),
      action: () => addToast('Reported'),
    },
  ];

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease }}
          style={{
            position: 'fixed',
            left: clampedX,
            top: clampedY,
            zIndex: 200,
            width: menuW,
            background: p.card,
            border: `1px solid ${p.cardB}`,
            borderRadius: 10,
            boxShadow: p.shL,
            overflow: 'hidden',
          }}
        >
          {actions.map((a, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); a.action(); onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                cursor: 'pointer',
                borderBottom: i < actions.length - 1 ? `1px solid ${p.bdrS}` : 'none',
                transition: 'background .1s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.background = p.bgH; }}
              onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
            >
              {a.icon}
              <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.tx }}>{a.label}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
