'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { platformColors, E } from '@/lib/constants';
import { type ContentItem } from '@/lib/content';
import { useContentData } from '@/lib/ContentProvider';
import Avatar from '@/components/atoms/Avatar';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: ContentItem) => void;
  onNavigate?: (tab: string) => void;
}

export default function CommandPalette({ open, onClose, onSelect, onNavigate }: CommandPaletteProps) {
  const { p, toggleTheme } = useStore();
  const [q, setQ] = useState('');
  const [hlIdx, setHlIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);
  const { allItems } = useContentData();

  useEffect(() => {
    if (open) {
      setQ('');
      setHlIdx(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => { setHlIdx(0); }, [q]);

  // Scroll highlighted item into view
  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;
    const items = container.querySelectorAll('[data-cmd-item]');
    items[hlIdx]?.scrollIntoView({ block: 'nearest' });
  }, [hlIdx]);

  // Fuzzy score: matches characters in order, rewards consecutive matches
  const fuzzyScore = useCallback((query: string, target: string): number => {
    const ql = query.toLowerCase();
    const tl = target.toLowerCase();
    if (tl === ql) return 100;
    if (tl.startsWith(ql)) return 60;
    if (tl.includes(ql)) return 30;
    // Character-by-character fuzzy match
    let qi = 0;
    let consecutive = 0;
    let score = 0;
    for (let ti = 0; ti < tl.length && qi < ql.length; ti++) {
      if (tl[ti] === ql[qi]) {
        qi++;
        consecutive++;
        score += consecutive * 2; // reward consecutive chars
      } else {
        consecutive = 0;
      }
    }
    return qi === ql.length ? Math.min(score, 25) : 0;
  }, []);

  const results = q.length > 1
    ? allItems
        .map((c) => {
          const ql = q.toLowerCase();
          let score = fuzzyScore(ql, c.title);
          if (c.author) score += fuzzyScore(ql, c.author) * 0.5;
          if (c.tags?.some((t) => t.toLowerCase().includes(ql))) score += 5;
          if (c.platform.toLowerCase().includes(ql)) score += 3;
          return { item: c, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.item)
    : [];

  const cmds = [
    { n: 'Toggle theme', s: '\u2318D', i: '\u25D0', fn: toggleTheme },
    { n: 'Settings', s: '\u2318,', i: '\u2699', fn: () => onNavigate?.('profile') },
  ].filter((c) => !q || c.n.toLowerCase().includes(q.toLowerCase()));

  const contentItems = results.slice(0, 5);
  const searchItems: Array<{ type: 'content'; item: ContentItem } | { type: 'cmd'; cmd: typeof cmds[number] }> = [
    ...contentItems.map((item) => ({ type: 'content' as const, item })),
    ...cmds.map((c) => ({ type: 'cmd' as const, cmd: c })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHlIdx((i) => Math.min(i + 1, searchItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHlIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && searchItems.length > 0) {
      e.preventDefault();
      const sel = searchItems[hlIdx];
      if (sel?.type === 'content') { onSelect(sel.item); onClose(); }
      else if (sel?.type === 'cmd') { sel.cmd.fn?.(); onClose(); }
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(5,5,5,.5)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'fi .1s ease',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search content"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 'var(--cmd-max-w, 480px)',
          margin: '0 16px',
          background: p.card,
          borderRadius: 14,
          border: `1px solid ${p.cardB}`,
          boxShadow: p.shL,
          overflow: 'hidden',
          animation: `sd .2s ${E}`,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search input */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${p.bdrS}`, display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search content, creators, topics..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: p.tx,
              fontFamily: "var(--font-body), 'Outfit', sans-serif",
              fontSize: 14,
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.txM, fontSize: 16, padding: '0 4px' }}>
              &times;
            </button>
          )}
        </div>

        {/* Results */}
        <div ref={resultsRef} style={{ padding: 4, overflowY: 'auto', flex: 1 }}>
          {results.length > 0 && (
            <>
              <div style={{ padding: '8px 12px 4px' }}>
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txM, letterSpacing: '.08em' }}>CONTENT</span>
              </div>
              {contentItems.map((item, i) => (
                <div
                  key={item.id}
                  data-cmd-item=""
                  onClick={() => { onSelect(item); onClose(); }}
                  style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 12px', borderRadius: 8, cursor: 'pointer', transition: 'background .1s ease', background: hlIdx === i ? p.bgH : 'transparent' }}
                  onMouseEnter={() => setHlIdx(i)}
                >
                  {item.author && <Avatar name={item.author} color={platformColors[item.platform]} size={24} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.tx, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                    <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: platformColors[item.platform], letterSpacing: '.06em', textTransform: 'uppercase' }}>
                      {item.platform}{item.author && ` \u00B7 ${item.author}`}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Commands */}
          {(q.length < 2 || cmds.length > 0) && (
            <>
              {q.length > 1 && results.length > 0 && <div style={{ height: 1, background: p.bdrS, margin: '4px 12px' }} />}
              {cmds.map((c, i) => {
                const flatIdx = contentItems.length + i;
                return (
                <div
                  key={i}
                  data-cmd-item=""
                  onClick={() => { if (c.fn) c.fn(); onClose(); }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 11px', borderRadius: 7, cursor: 'pointer', transition: 'background .1s ease', background: hlIdx === flatIdx ? p.bgH : 'transparent' }}
                  onMouseEnter={() => setHlIdx(flatIdx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 12, width: 16, textAlign: 'center', color: p.tc }}>{c.i}</span>
                    <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.tx }}>{c.n}</span>
                  </div>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9.5, color: p.txF }}>{c.s}</span>
                </div>
                );
              })}
            </>
          )}

          {q.length > 1 && results.length === 0 && cmds.length === 0 && (
            <div style={{ padding: '20px 12px', textAlign: 'center' }}>
              <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.txM }}>No results for &ldquo;{q}&rdquo;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
