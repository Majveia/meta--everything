'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useFocusTrap } from '@/lib/useFocusTrap';
import type { ContentItem } from '@/lib/content';
import Header from './Header';
import BottomNav from './BottomNav';
import { playTab } from '@/lib/sounds';
import { SkeletonFeed } from '@/components/atoms/Skeleton';
import ToastContainer from '@/components/atoms/Toast';

const CommandPalette = dynamic(() => import('@/components/overlays/CommandPalette'), { ssr: false });
const DetailSheet = dynamic(() => import('@/components/detail/DetailSheet'), { ssr: false });
const ContextMenu = dynamic(() => import('@/components/overlays/ContextMenu'), { ssr: false });

type NavTab = 'home' | 'explore' | 'activity' | 'profile';

interface ShellProps {
  children: (props: {
    activeTab: NavTab;
    loading: boolean;
    onDetailOpen: (item: ContentItem) => void;
    onContextMenu: (item: ContentItem, x: number, y: number) => void;
    showSaved: boolean;
    showStats: boolean;
    onShowSaved: () => void;
    onShowStats: () => void;
    onBackFromSaved: () => void;
    onBackFromStats: () => void;
  }) => React.ReactNode;
}

function tabFromPath(): NavTab {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.replace(/^\//, '').split('/')[0];
  if (path === 'explore' || path === 'activity' || path === 'profile') return path;
  return 'home';
}

export default function Shell({ children }: ShellProps) {
  const { p, isDark } = useStore();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [loading, setLoading] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [detail, setDetail] = useState<ContentItem | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ item: ContentItem; x: number; y: number } | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const shortcutsRef = useRef<HTMLDivElement>(null);
  useFocusTrap(shortcutsRef, shortcutsOpen);
  const toggleLike = useStore((s) => s.toggleLike);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const toggleLikeRef = useRef(toggleLike);
  const toggleBookmarkRef = useRef(toggleBookmark);
  useEffect(() => { toggleLikeRef.current = toggleLike; }, [toggleLike]);
  useEffect(() => { toggleBookmarkRef.current = toggleBookmark; }, [toggleBookmark]);

  // Sync tab from URL on mount + handle back/forward
  useEffect(() => {
    setActiveTab(tabFromPath());
    const onPop = () => {
      const tab = tabFromPath();
      setActiveTab(tab);
      setShowSaved(false);
      setShowStats(false);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Defer initial render past hydration so Zustand store + content context settle
  useEffect(() => { setLoading(false); }, []);

  // Update document title per active view
  useEffect(() => {
    const titles: Record<NavTab, string> = {
      home: 'meta//everything',
      explore: 'Explore — meta//everything',
      activity: 'Activity — meta//everything',
      profile: 'Profile — meta//everything',
    };
    document.title = titles[activeTab];
  }, [activeTab]);

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        setShowScrollTop(window.scrollY > 600);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId); };
  }, []);

  const saveScrollPosition = useStore((s) => s.saveScrollPosition);
  const soundEnabled = useStore((s) => s.soundEnabled);

  const switchNav = useCallback(
    (tab: NavTab) => {
      if (tab === activeTab && !showSaved && !showStats) return;
      if (soundEnabled) playTab();
      saveScrollPosition(activeTab, window.scrollY);
      setShowSaved(false);
      setShowStats(false);
      setLoading(true);
      setActiveTab(tab);
      const url = tab === 'home' ? '/' : `/${tab}`;
      window.history.pushState(null, '', url);
      window.scrollTo({ top: 0, behavior: 'auto' });
      setTimeout(() => {
        setLoading(false);
        const saved = useStore.getState().scrollPositions[tab] || 0;
        if (saved > 0) window.scrollTo({ top: saved, behavior: 'auto' });
      }, 400);
    },
    [activeTab, showSaved, showStats, saveScrollPosition, soundEnabled]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((o) => !o);
        return;
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setNotifOpen(false);
        setDetail(null);
        setShortcutsOpen(false);
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        setShortcutsOpen((o) => !o);
        return;
      }
      // Card navigation
      const cards = document.querySelectorAll('[data-card]');
      if (cards.length === 0) return;
      const focused = document.activeElement as HTMLElement;
      const idx = Array.from(cards).indexOf(focused);

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const next = Math.min(idx + 1, cards.length - 1);
        (cards[next] as HTMLElement)?.focus();
        (cards[next] as HTMLElement)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const prev = Math.max(idx <= 0 ? 0 : idx - 1, 0);
        (cards[prev] as HTMLElement)?.focus();
        (cards[prev] as HTMLElement)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Like / Save focused card
      if (idx >= 0) {
        const itemId = (cards[idx] as HTMLElement).getAttribute('data-item-id');
        if (itemId && e.key === 'l') { toggleLikeRef.current?.(itemId); }
        if (itemId && e.key === 's' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); toggleBookmarkRef.current?.(itemId); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
    <div
      suppressHydrationWarning
      data-theme={isDark ? 'dark' : 'light'}
      style={{
        background: p.bg,
        minHeight: '100vh',
        color: p.tx,
        fontFamily: "var(--font-body), 'Outfit', 'Helvetica Neue', sans-serif",
        position: 'relative',
        overflowX: 'hidden',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        transition: 'background .45s ease, color .45s ease',
      }}
    >
      {/* Halftone dot texture */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          opacity: p.ht,
          backgroundImage: `radial-gradient(circle, ${p.tx} .35px, transparent .35px)`,
          backgroundSize: '6px 6px',
          pointerEvents: 'none',
          animation: 'br 10s ease infinite',
          zIndex: 0,
        }}
      />

      {/* Ambient terracotta glow */}
      <div
        style={{
          position: 'fixed',
          top: -180,
          right: -80,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${p.tc}${p.gl} 0%, transparent 70%)`,
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Overlays */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onSelect={(item) => { setDetail(item); setCmdOpen(false); }} onNavigate={(tab) => { switchNav(tab as NavTab); setCmdOpen(false); }} />
      <DetailSheet item={detail} onClose={() => setDetail(null)} onSwitch={setDetail} />

      <Header
        onSearchOpen={() => setCmdOpen(true)}
        onNotifToggle={() => setNotifOpen((o) => !o)}
        notifOpen={notifOpen}
        onSwitchTab={(tab) => switchNav(tab as NavTab)}
      />

      <div
        id="main-content"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1100,
          margin: '0 auto',
          padding: '8px var(--shell-padding, 20px) 0',
        }}
      >
        {loading ? (
          <SkeletonFeed />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] } }}
            >
              {children({ activeTab, loading, onDetailOpen: setDetail, onContextMenu: (item, x, y) => setCtxMenu({ item, x, y }), showSaved, showStats, onShowSaved: () => setShowSaved(true), onShowStats: () => setShowStats(true), onBackFromSaved: () => setShowSaved(false), onBackFromStats: () => setShowStats(false) })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <ContextMenu item={ctxMenu?.item || null} x={ctxMenu?.x || 0} y={ctxMenu?.y || 0} onClose={() => setCtxMenu(null)} />
      <ToastContainer />
      <BottomNav active={activeTab} onChange={switchNav} />

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => { if (soundEnabled) playTab(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="Scroll to top"
            style={{
              position: 'fixed',
              bottom: 84,
              right: 20,
              zIndex: 40,
              width: 44,
              height: 44,
              borderRadius: 22,
              border: `1px solid ${p.bdr}`,
              background: p.card,
              boxShadow: p.sh,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: p.tc,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts overlay */}
      <AnimatePresence>
        {shortcutsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShortcutsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,5,5,.5)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              ref={shortcutsRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15, ease: [0.32, 0, 0.67, 0] } }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: p.card, borderRadius: 14, border: `1px solid ${p.cardB}`, boxShadow: p.shL, padding: '24px 28px', maxWidth: 360, width: '100%', margin: '0 16px' }}
            >
              <h3 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 18, color: p.tx, fontWeight: 400, marginBottom: 18, letterSpacing: '-0.02em' }}>
                Keyboard Shortcuts
              </h3>
              {[
                ['/', 'Quick search'],
                ['\u2318K', 'Toggle search'],
                ['?', 'Show shortcuts'],
                ['j / k', 'Navigate feed'],
                ['Enter', 'Open detail'],
                ['Esc', 'Close overlay'],
                ['L', 'Like focused card'],
                ['S', 'Save focused card'],
              ].map(([key, desc]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${p.bdrS}` }}>
                  <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.txS }}>{desc}</span>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txM, background: p.bgH, padding: '2px 8px', borderRadius: 4 }}>{key}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}
