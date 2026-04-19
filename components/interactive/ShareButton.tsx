'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { E } from '@/lib/constants';
import { playShare } from '@/lib/sounds';
import { pushTrace } from '@/lib/traces';

interface ShareButtonProps {
  title?: string;
  subtitle?: string;
  itemId?: string;
  url?: string;
}

export default function ShareButton({ title, subtitle, itemId, url }: ShareButtonProps) {
  const p = useStore((s) => s.p);
  const addToast = useStore((s) => s.addToast);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const hapticEnabled = useStore((s) => s.hapticEnabled);
  const [pop, setPop] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hapticEnabled) navigator.vibrate?.(8);
    if (soundEnabled) playShare();
    setPop(true);
    setTimeout(() => setPop(false), 600);

    const text = title ? `${title}${subtitle ? ' — ' + subtitle : ''}` : 'Check this out on meta//everything';

    if (itemId) pushTrace({ kind: 'share' as never, itemId });

    if (navigator.share) {
      try {
        await navigator.share({ title: title || 'meta//everything', text, ...(url ? { url } : {}) });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url ? `${text}\n${url}` : text);
      addToast('Copied to clipboard');
    } catch {
      addToast('Could not copy');
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Share"
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
        fill="none"
        stroke={pop ? p.tc : p.txM}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: `all .25s ${E}`, transform: pop ? 'scale(1.15) rotate(-12deg)' : 'scale(1)' }}
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>
  );
}
