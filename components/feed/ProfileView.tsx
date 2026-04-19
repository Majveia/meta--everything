'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { useContentData } from '@/lib/ContentProvider';
import { E, accentColors } from '@/lib/constants';
import PlatformIcon from '@/components/atoms/PlatformIcon';

interface ProfileViewProps {
  onShowSaved?: () => void;
  onShowStats?: () => void;
}

export default function ProfileView({ onShowSaved, onShowStats }: ProfileViewProps) {
  const { p, isDark, toggleTheme } = useStore();
  const hapticEnabled = useStore((s) => s.hapticEnabled);
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const toggleHaptic = useStore((s) => s.toggleHaptic);
  const toggleNotifications = useStore((s) => s.toggleNotifications);
  const toggleSound = useStore((s) => s.toggleSound);
  const addToast = useStore((s) => s.addToast);
  const viewedItems = useStore((s) => s.viewedItems);
  const likedItems = useStore((s) => s.likedItems);
  const bookmarkedItems = useStore((s) => s.bookmarkedItems);
  const streak = useStore((s) => s.streak);
  const updateStreak = useStore((s) => s.updateStreak);
  const avatarUrl = useStore((s) => s.avatarUrl);
  const setAvatarUrl = useStore((s) => s.setAvatarUrl);
  const feedDensity = useStore((s) => s.feedDensity);
  const setFeedDensity = useStore((s) => s.setFeedDensity);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { updateStreak(); }, [updateStreak]);

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        addToast('Profile photo updated');
      }
    };
    reader.readAsDataURL(file);
  }, [setAvatarUrl, addToast]);

  return (
    <div>
      {/* Avatar + Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, marginBottom: 28 }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{ width: 72, height: 72, borderRadius: '50%', background: avatarUrl ? 'transparent' : `linear-gradient(135deg, ${p.tc}30, ${p.am}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: `2px solid ${p.tc}25`, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 28, color: p.tc }}>M</span>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
          </div>
          <input ref={fileRef} type="file" accept="image/*,.gif" onChange={handleAvatarUpload} style={{ display: 'none' }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 22, letterSpacing: '-0.02em', fontWeight: 400, color: p.tx, marginBottom: 4 }}>Majveia</h2>
        <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txM, letterSpacing: '.06em', marginBottom: 20 }}>Building meta//everything</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Viewed', String(viewedItems.size)], ['Liked', String(likedItems.size)], ['Saved', String(bookmarkedItems.size)]].map(([label, value], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 20, color: p.tx, display: 'block' }}>{value}</span>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txM, letterSpacing: '.05em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20, padding: '8px 16px', borderRadius: 10, background: `${p.tc}10`, border: `1px solid ${p.tc}15` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={p.tc} stroke="none"><path d="M12 23c-3.86 0-7-3.14-7-7 0-2.38 1.12-4.24 2.5-5.5.56-.5 1.15-.94 1.5-1.5.74-1.18.5-2.56.5-4 2 1.5 3.5 3.5 3.5 6 .5-.5 1-1.5 1-3 2.5 2 4 4.5 4 7 0 3.86-2.64 7-6 7z" /></svg>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: p.tc, letterSpacing: '.04em' }}>{streak} day streak</span>
        </div>
      )}

      {/* Settings */}
      <div style={{ background: p.card, borderRadius: 14, border: `1px solid ${p.cardB}`, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${p.bdrS}` }}>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: p.txM }}>
            <span style={{ opacity: 0.35 }}>[ </span>Settings<span style={{ opacity: 0.35 }}> ]</span>
          </span>
        </div>
        {[
          { label: 'Dark mode', value: isDark, toggle: toggleTheme },
          { label: 'Notifications', value: notificationsEnabled, toggle: () => { toggleNotifications(); addToast(notificationsEnabled ? 'Notifications off' : 'Notifications on'); } },
          { label: 'Haptic feedback', value: hapticEnabled, toggle: () => { toggleHaptic(); addToast(hapticEnabled ? 'Haptics off' : 'Haptics on'); } },
          { label: 'UI sounds', value: soundEnabled, toggle: () => { toggleSound(); addToast(soundEnabled ? 'Sounds off' : 'Sounds on'); } },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${p.bdrS}` }}>
            <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 14, color: p.tx }}>{s.label}</span>
            {/* Mechanical toggle — Nothing-style: square track, square thumb, inverted fill */}
            <div
              onClick={s.toggle}
              style={{
                width: 44,
                height: 24,
                borderRadius: 4,
                cursor: 'pointer',
                border: `1px solid ${s.value ? p.tx : p.bdrH}`,
                background: s.value ? p.tx : 'transparent',
                transition: 'all .15s cubic-bezier(0.25, 0.1, 0.25, 1)',
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 2,
                left: s.value ? 22 : 2,
                width: 18,
                height: 18,
                borderRadius: 2,
                background: s.value ? p.bg : p.txM,
                transition: 'left .15s cubic-bezier(0.25, 0.1, 0.25, 1), background .15s ease-out',
              }} />
            </div>
          </div>
        ))}
        {/* Feed density selector */}
        <div style={{ padding: '14px 18px' }}>
          <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 14, color: p.tx, display: 'block', marginBottom: 10 }}>Feed density</span>
          <div style={{ display: 'flex', gap: 6, padding: 3, borderRadius: 8, background: p.bgS, border: `1px solid ${p.bdrS}` }}>
            {(['compact', 'default', 'spacious'] as const).map((d) => {
              const active = feedDensity === d;
              return (
                <button
                  key={d}
                  onClick={() => { setFeedDensity(d); addToast(`Density: ${d}`); }}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: 5,
                    border: 'none',
                    background: active ? p.card : 'transparent',
                    color: active ? p.tx : p.txM,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all .15s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    boxShadow: active ? p.sh : 'none',
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      <ConnectedPlatforms />

      {/* Navigation links */}
      <div style={{ marginTop: 20, background: p.card, borderRadius: 14, border: `1px solid ${p.cardB}`, overflow: 'hidden' }}>
        {[
          { label: 'Saved items', action: onShowSaved },
          { label: 'Your stats', action: onShowStats },
          { label: 'Privacy' },
          { label: 'Help & Support' },
          { label: 'About meta//everything' },
        ].map((item, i, arr) => (
          <div
            key={i}
            onClick={item.action}
            style={{
              padding: '14px 18px',
              borderBottom: i < arr.length - 1 ? `1px solid ${p.bdrS}` : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: item.action ? 'pointer' : 'default',
              transition: 'background .12s ease',
            }}
            onMouseEnter={(e) => { if (item.action) (e.currentTarget).style.background = p.bgH; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
          >
            <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 14, color: p.tx }}>{item.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.txF} strokeWidth="1.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF, marginTop: 24, letterSpacing: '.04em' }}>v47.0 &middot; Made with love</p>
    </div>
  );
}

const platformNames: Record<string, string> = {
  youtube: 'YouTube',
  twitch: 'Twitch',
  x: 'X / Twitter',
  substack: 'Substack',
  kick: 'Kick',
};

function ConnectedPlatforms() {
  const p = useStore((s) => s.p);
  const { sources } = useContentData();

  const statusColor = (s: string) =>
    s === 'api' ? accentColors.green : s === 'error' ? accentColors.red : p.txF;
  const statusLabel = (s: string) =>
    s === 'api' ? 'Connected' : s === 'error' ? 'Error' : 'Not configured';

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ padding: '0 4px', marginBottom: 10 }}>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: p.txM }}>
          <span style={{ opacity: 0.35 }}>[ </span>Connected Platforms<span style={{ opacity: 0.35 }}> ]</span>
        </span>
      </div>
      <div style={{ background: p.card, borderRadius: 14, border: `1px solid ${p.cardB}`, overflow: 'hidden' }}>
        {(['youtube', 'twitch', 'x', 'substack', 'kick'] as const).map((pl, i, arr) => {
          const source = sources[pl] || 'unconfigured';
          return (
            <div
              key={pl}
              style={{
                padding: '12px 16px',
                borderBottom: i < arr.length - 1 ? `1px solid ${p.bdrS}` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <PlatformIcon platform={pl} size={16} />
              <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.tx, flex: 1 }}>
                {platformNames[pl]}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: 1, background: statusColor(source) }} />
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, color: statusColor(source), letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  {statusLabel(source)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
