'use client';

import { useStore } from '@/lib/store';
import { E, accentColors } from '@/lib/constants';
import { playTab } from '@/lib/sounds';

type NavTab = 'home' | 'explore' | 'activity' | 'profile';

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  const p = useStore((s) => s.p);
  const unreadCount = useStore((s) => s.unreadActivityCount);
  const hapticEnabled = useStore((s) => s.hapticEnabled);
  const soundEnabled = useStore((s) => s.soundEnabled);

  const items: { id: NavTab; label: string; icon: (a: boolean) => React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (a) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={a ? p.tc : 'none'} stroke={a ? p.tc : p.txM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: (a) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? p.tc : p.txM} strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill={a ? p.tc + '30' : 'none'} />
        </svg>
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: (a) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? p.tc : p.txM} strokeWidth="1.5" strokeLinecap="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (a) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? p.tc : p.txM} strokeWidth="1.5" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: p.navBg,
        borderTop: `1px solid ${p.bdrS}`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        transition: 'background .4s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '7px 0 env(safe-area-inset-bottom, 7px)',
        }}
      >
        {items.map((it) => {
          const a = active === it.id;
          return (
            <button
              key={it.id}
              role="tab"
              aria-selected={a}
              aria-label={it.label}
              onClick={() => {
                if (active !== it.id) {
                  if (hapticEnabled) navigator.vibrate?.(6);
                  if (soundEnabled) playTab();
                }
                onChange(it.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '6px 16px',
                minWidth: 44,
                minHeight: 44,
                transition: 'all .15s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              <div
                style={{
                  transition: 'transform .15s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  transform: a ? 'scale(1.08)' : 'scale(1)',
                  position: 'relative',
                }}
              >
                {it.icon(a)}
                {it.id === 'activity' && unreadCount > 0 && !a && (
                  <div style={{ position: 'absolute', top: -1, right: -3, width: 6, height: 6, borderRadius: '50%', background: accentColors.red }} />
                )}
              </div>
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 8.5,
                  letterSpacing: '.05em',
                  color: a ? p.tc : p.txM,
                  fontWeight: a ? 600 : 400,
                  transition: 'color .2s ease',
                }}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
