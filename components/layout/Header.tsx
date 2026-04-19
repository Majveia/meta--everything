'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { E, accentColors } from '@/lib/constants';
import MetaLogo from '@/components/atoms/MetaLogo';
import NotifDropdown from '@/components/overlays/NotifDropdown';

interface HeaderProps {
  onSearchOpen: () => void;
  onNotifToggle: () => void;
  notifOpen: boolean;
  onSwitchTab?: (tab: string) => void;
}

export default function Header({ onSearchOpen, onNotifToggle, notifOpen, onSwitchTab }: HeaderProps) {
  const { p, isDark, toggleTheme } = useStore();
  const unreadCount = useStore((s) => s.unreadActivityCount);
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: scrolled ? p.navBg : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? `1px solid ${p.bdrS}` : '1px solid transparent',
        transition: 'all .18s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '12px var(--shell-padding, 20px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: ready ? 1 : 0,
          transition: `opacity .7s ${E}`,
        }}
      >
        {/* Left: Logo + Wordmark */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => { onSwitchTab?.('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <MetaLogo size={scrolled ? 22 : 26} />
          <motion.h1
            data-wordmark=""
            initial={{ opacity: 0, filter: 'blur(14px)', y: 4 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontSize: scrolled ? 15 : 16,
              letterSpacing: '-0.03em',
              fontWeight: 400,
              color: p.tx,
              transition: 'font-size .3s ease',
            }}
          >
            meta<span style={{ color: p.tc }}>{"//"}</span>everything
          </motion.h1>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .1s ease',
              color: p.txM,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = p.bgH; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Search */}
          <button
            onClick={onSearchOpen}
            aria-label="Search"
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background .1s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = p.bgH; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>

          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={onNotifToggle}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background .1s ease',
                background: notifOpen ? p.bgH : 'transparent',
              }}
              onMouseEnter={(e) => { if (!notifOpen) (e.currentTarget as HTMLButtonElement).style.background = p.bgH; }}
              onMouseLeave={(e) => { if (!notifOpen) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={notifOpen ? p.tc : p.txM}
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ transition: 'stroke .2s ease' }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 5,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    background: accentColors.red,
                    border: `1.5px solid ${scrolled ? 'transparent' : p.bg}`,
                    transition: 'border-color .3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                  }}
                >
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8, color: '#fff', fontWeight: 600 }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </button>
            <NotifDropdown open={notifOpen} onClose={() => onNotifToggle()} onViewAll={() => onSwitchTab?.('activity')} onNotifTap={() => onSwitchTab?.('activity')} />
          </div>
        </div>
      </div>
    </header>
  );
}
