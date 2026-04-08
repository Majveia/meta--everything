'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { E, accentColors } from '@/lib/constants';
import Avatar from '@/components/atoms/Avatar';
import LiveDot from '@/components/atoms/LiveDot';

interface Comment {
  id: string;
  author: string;
  authorImage?: string;
  text: string;
  time: string;
  likes: number;
  replies?: number;
}

type SortMode = 'popular' | 'recent';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

function formatLikes(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export default function CommentsSection({ itemId, videoId, commentCount }: { itemId: string; videoId?: string; commentCount?: string }) {
  const p = useStore((s) => s.p);
  const [sort, setSort] = useState<SortMode>('popular');
  const [refreshing, setRefreshing] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('');

  const fetchComments = useCallback(async (sortMode: SortMode) => {
    if (!videoId) {
      setComments([]);
      setSource('none');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/comments?videoId=${videoId}&sort=${sortMode === 'popular' ? 'relevance' : 'time'}`);
      const data = await res.json();

      if (data.comments && data.comments.length > 0) {
        setComments(data.comments.map((c: { id: string; author: string; authorImage?: string; text: string; likes: number; publishedAt: string; replies?: number }) => ({
          id: c.id,
          author: c.author,
          authorImage: c.authorImage,
          text: c.text,
          time: relativeTime(c.publishedAt),
          likes: c.likes,
          replies: c.replies,
        })));
        setSource(data.source);
      } else {
        setComments([]);
        setSource('none');
      }
    } catch {
      setComments([]);
      setSource('error');
    }
    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    setLoading(true);
    fetchComments(sort);
  }, [sort, fetchComments]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComments(sort).then(() => setRefreshing(false));
  }, [sort, fetchComments]);

  const toggleLikeComment = useCallback((id: string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const sorted = sort === 'popular'
    ? [...comments].sort((a, b) => b.likes - a.likes)
    : comments; // API already sorted by time when sort=recent

  if (!videoId) return null;

  return (
    <div style={{ marginTop: 28 }}>
      {/* Header with sort + refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: p.txM }}>
            <span style={{ opacity: 0.35 }}>[ </span>Comments<span style={{ opacity: 0.35 }}> ]</span>
          </span>
          {commentCount && (
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF }}>{commentCount}</span>
          )}
          {source === 'youtube' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <LiveDot />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, letterSpacing: '.08em', textTransform: 'uppercase', color: accentColors.red }}>
                Live
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {(['popular', 'recent'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSort(mode)}
              style={{
                background: sort === mode ? p.bgH : 'transparent',
                border: `1px solid ${sort === mode ? p.bdr : 'transparent'}`,
                borderRadius: 6,
                padding: '3px 8px',
                cursor: 'pointer',
                fontFamily: "'SF Mono', monospace",
                fontSize: 8.5,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: sort === mode ? p.tx : p.txM,
                transition: `all .2s ${E}`,
              }}
            >
              {mode}
            </button>
          ))}
          <button
            onClick={handleRefresh}
            aria-label="Refresh comments"
            style={{
              background: refreshing ? `${p.tc}08` : 'transparent',
              border: `1px solid ${refreshing ? p.tc + '20' : 'transparent'}`,
              cursor: 'pointer',
              padding: '3px 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: `all .2s ${E}`,
            }}
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={refreshing ? p.tc : p.txM} strokeWidth="1.5" strokeLinecap="round"
              style={{ transition: `transform .4s ${E}`, transform: refreshing ? 'rotate(360deg)' : 'rotate(0deg)' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, letterSpacing: '.06em', textTransform: 'uppercase', color: refreshing ? p.tc : p.txM }}>
              {refreshing ? 'Refreshing' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, opacity: 0.4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.bgH, animation: 'shimmer 1.8s ease infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '40%', height: 10, borderRadius: 4, background: p.bgH, marginBottom: 6, animation: 'shimmer 1.8s ease infinite' }} />
                <div style={{ width: '90%', height: 10, borderRadius: 4, background: p.bgH, animation: 'shimmer 1.8s ease infinite' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No comments */}
      {!loading && comments.length === 0 && (
        <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txF, textAlign: 'center', padding: '20px 0' }}>
          {source === 'error' ? 'Failed to load comments' : 'No comments yet'}
        </p>
      )}

      {/* Comment list */}
      {!loading && sorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sorted.map((c, i) => {
            const isLiked = likedComments.has(c.id);
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: i < sorted.length - 1 ? `1px solid ${p.bdrS}` : 'none',
                  opacity: refreshing ? 0.4 : 1,
                  transition: `opacity .3s ${E}`,
                }}
              >
                {c.authorImage ? (
                  <img
                    src={c.authorImage}
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <Avatar name={c.author} color={p.txM} size={28} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 12, fontWeight: 500, color: p.tx }}>{c.author}</span>
                    <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, color: p.txF }}>{c.time}</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.txS, lineHeight: 1.5, margin: 0 }}>{c.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                    <button
                      onClick={() => toggleLikeComment(c.id)}
                      aria-label={isLiked ? `Unlike comment by ${c.author}` : `Like comment by ${c.author}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill={isLiked ? accentColors.red : 'none'} stroke={isLiked ? accentColors.red : p.txM} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, color: isLiked ? accentColors.red : p.txM }}>{formatLikes(c.likes + (isLiked ? 1 : 0))}</span>
                    </button>
                    {c.replies !== undefined && c.replies > 0 && (
                      <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, color: p.txF }}>
                        {c.replies} {c.replies === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
