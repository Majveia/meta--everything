'use client';

import { useStore } from '@/lib/store';
import { E } from '@/lib/constants';
import { playBookmark } from '@/lib/sounds';
import { pushTrace } from '@/lib/traces';

export default function BookmarkButton({ itemId }: { itemId: string }) {
  const p = useStore((s) => s.p);
  const saved = useStore((s) => s.bookmarkedItems.has(itemId));
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const addToast = useStore((s) => s.addToast);
  const hapticEnabled = useStore((s) => s.hapticEnabled);
  const soundEnabled = useStore((s) => s.soundEnabled);

  return (
    <button
      aria-label={saved ? 'Remove bookmark' : 'Bookmark'}
      onClick={(e) => {
        e.stopPropagation();
        if (hapticEnabled) navigator.vibrate?.(10);
        if (soundEnabled) playBookmark();
        const wasSaved = saved;
        pushTrace({ kind: wasSaved ? 'unbookmark' : 'bookmark', itemId });
        toggleBookmark(itemId);
        if (wasSaved) {
          addToast('Removed from bookmarks');
        } else {
          addToast('Saved to bookmarks', () => toggleBookmark(itemId));
        }
      }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 12px',
        borderRadius: 8,
        margin: '-10px -12px',
        transition: 'background .15s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget).style.background = p.bgH; }}
      onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill={saved ? p.am : 'none'}
        stroke={saved ? p.am : p.txM}
        strokeWidth="2"
        style={{ transition: `all .25s ${E}`, transform: saved ? 'scale(1.1)' : 'scale(1)' }}
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
