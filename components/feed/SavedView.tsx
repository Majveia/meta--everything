'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { ContentItem } from '@/lib/content';
import { useContentData } from '@/lib/ContentProvider';
import LiveCard from './LiveCard';
import StdCard from './StdCard';
import CompactCard from './CompactCard';

const ease = [0.16, 1, 0.3, 1] as const;

interface SavedViewProps {
  onBack: () => void;
  onDetailOpen: (item: ContentItem) => void;
}

export default function SavedView({ onBack, onDetailOpen }: SavedViewProps) {
  const p = useStore((s) => s.p);
  const bookmarkedItems = useStore((s) => s.bookmarkedItems);
  const { allItems } = useContentData();

  const saved = allItems.filter((c) => bookmarkedItems.has(c.id));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          onClick={onBack}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background .1s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget).style.background = p.bgH; }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.txS} strokeWidth="1.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: p.txM }}>
          Saved Items
        </span>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF }}>
          {saved.length}
        </span>
      </div>

      {saved.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80,
            gap: 16,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={p.tc} strokeWidth="1.5" opacity={0.5}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontSize: 18,
              fontStyle: 'italic',
              color: p.txM,
              letterSpacing: '-0.01em',
            }}
          >
            Nothing saved yet
          </span>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF, letterSpacing: '.04em' }}>
            Bookmark content to find it here
          </span>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {saved.map((item) => {
            if (item.type === 'live') return <LiveCard key={item.id} item={{ ...item, delay: 0 }} onTap={onDetailOpen} />;
            if (item.type === 'compact') return <CompactCard key={item.id} item={{ ...item, delay: 0 }} onTap={onDetailOpen} />;
            return <StdCard key={item.id} item={{ ...item, delay: 0 }} onTap={onDetailOpen} />;
          })}
        </div>
      )}
    </div>
  );
}
