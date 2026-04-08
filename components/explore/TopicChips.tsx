'use client';

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { E } from '@/lib/constants';

interface TopicChipsProps {
  topics: string[];
  active: string | null;
  onSelect: (topic: string | null) => void;
}

export default function TopicChips({ topics, active, onSelect }: TopicChipsProps) {
  const p = useStore((s) => s.p);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  return (
    <div style={{ position: 'relative', margin: '0 -20px' }}>
      {/* Left fade */}
      {canScrollLeft && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 32, background: `linear-gradient(to right, ${p.bg}, transparent)`, zIndex: 2, pointerEvents: 'none' }} />
      )}
      {/* Right fade */}
      {canScrollRight && (
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, background: `linear-gradient(to left, ${p.bg}, transparent)`, zIndex: 2, pointerEvents: 'none' }} />
      )}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 20px 16px', scrollbarWidth: 'none' }}
      >
        {topics.map((t, i) => {
          const isActive = active === t || (t === 'All' && !active);
          return (
            <button
              key={i}
              onClick={() => onSelect(t === 'All' ? null : t)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: `1px solid ${isActive ? p.tc + '50' : p.bdr}`,
                background: isActive ? p.tc + '12' : p.bgS,
                fontFamily: "var(--font-body), 'Outfit', sans-serif",
                fontSize: 12,
                color: isActive ? p.tc : p.txS,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
                transition: `all .25s ${E}`,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
