'use client';

import { useStore } from '@/lib/store';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';
import BookmarkButton from './BookmarkButton';
import AnimatedCount from '@/components/atoms/AnimatedCount';

interface EngagementRowProps {
  itemId: string;
  views?: string;
  likes?: string;
  comments?: string;
  title?: string;
  subtitle?: string;
}

export default function EngagementRow({ itemId, views, likes, comments, title, subtitle }: EngagementRowProps) {
  const p = useStore((s) => s.p);
  const labelStyle: React.CSSProperties = {
    fontFamily: "'SF Mono', monospace",
    fontSize: 9.5,
    color: p.txM,
    letterSpacing: '.02em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
  };

  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
      {views && (
        <span style={labelStyle}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <AnimatedCount value={views} />
        </span>
      )}
      <LikeButton itemId={itemId} count={likes} />
      {comments && (
        <span style={labelStyle}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <AnimatedCount value={comments} />
        </span>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        <ShareButton title={title} subtitle={subtitle} itemId={itemId} />
        <BookmarkButton itemId={itemId} />
      </div>
    </div>
  );
}
