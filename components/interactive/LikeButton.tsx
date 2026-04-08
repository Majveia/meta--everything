'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { accentColors, E } from '@/lib/constants';
import { playLike } from '@/lib/sounds';
import { pushTrace } from '@/lib/traces';

export default function LikeButton({ itemId, count }: { itemId: string; count?: string }) {
  const p = useStore((s) => s.p);
  const liked = useStore((s) => s.likedItems.has(itemId));
  const toggleLike = useStore((s) => s.toggleLike);
  const hapticEnabled = useStore((s) => s.hapticEnabled);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const [pop, setPop] = useState(false);

  return (
    <button
      aria-label={liked ? 'Unlike' : 'Like'}
      onClick={(e) => {
        e.stopPropagation();
        if (hapticEnabled) navigator.vibrate?.(10);
        if (soundEnabled) playLike();
        pushTrace({ kind: liked ? 'unlike' : 'like', itemId });
        toggleLike(itemId);
        setPop(true);
        setTimeout(() => setPop(false), 400);
      }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '10px 12px',
        borderRadius: 8,
        margin: '-10px -12px',
        transition: 'background .15s ease',
        fontFamily: "'SF Mono', monospace",
        fontSize: 9.5,
        color: liked ? accentColors.red : p.txM,
        letterSpacing: '.02em',
      }}
      onMouseEnter={(e) => { (e.currentTarget).style.background = liked ? accentColors.red + '10' : p.bgH; }}
      onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill={liked ? accentColors.red : 'none'}
        stroke={liked ? accentColors.red : p.txM}
        strokeWidth="2"
        style={{ transition: `all .3s ${E}`, transform: pop ? 'scale(1.4)' : 'scale(1)' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count || ''}
    </button>
  );
}
