'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { palettes, type Palette } from './theme';

export interface Toast {
  id: string;
  message: string;
  onUndo?: () => void;
}

interface AppState {
  isDark: boolean;
  p: Palette;
  toggleTheme: () => void;
  likedItems: Set<string>;
  bookmarkedItems: Set<string>;
  viewedItems: Set<string>;
  hiddenItems: Set<string>;
  toggleLike: (id: string) => void;
  toggleBookmark: (id: string) => void;
  markViewed: (id: string) => void;
  toggleHidden: (id: string) => void;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  toggleHaptic: () => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  strategyVersion: number;
  lastStrategyCompute: number;
  bumpStrategy: () => void;
  streak: number;
  lastOpenDate: string;
  readActivityIds: Set<string>;
  unreadActivityCount: number;
  updateStreak: () => void;
  markActivityRead: (id: string) => void;
  markAllActivityRead: (ids?: string[]) => void;
  setUnreadActivityCount: (count: number) => void;
  activeTab: 'home' | 'explore' | 'activity' | 'profile';
  setActiveTab: (tab: AppState['activeTab']) => void;
  toasts: Toast[];
  addToast: (message: string, onUndo?: () => void) => void;
  removeToast: (id: string) => void;
  scrollPositions: Record<string, number>;
  saveScrollPosition: (tab: string, y: number) => void;
  getScrollPosition: (tab: string) => number;
  detailReadPositions: Record<string, number>;
  saveDetailReadPosition: (itemId: string, progress: number) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  lastVisitTimestamp: number;
  updateLastVisit: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isDark: true,
      p: palettes.dark,
      toggleTheme: () =>
        set((state) => ({
          isDark: !state.isDark,
          p: state.isDark ? palettes.light : palettes.dark,
        })),
      likedItems: new Set<string>(),
      bookmarkedItems: new Set<string>(),
      viewedItems: new Set<string>(),
      hiddenItems: new Set<string>(),
      toggleLike: (id) =>
        set((state) => {
          const next = new Set(state.likedItems);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { likedItems: next };
        }),
      toggleBookmark: (id) =>
        set((state) => {
          const next = new Set(state.bookmarkedItems);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { bookmarkedItems: next };
        }),
      markViewed: (id) =>
        set((state) => {
          if (state.viewedItems.has(id)) return state;
          const next = new Set(state.viewedItems);
          next.add(id);
          return { viewedItems: next };
        }),
      toggleHidden: (id) =>
        set((state) => {
          const next = new Set(state.hiddenItems);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { hiddenItems: next };
        }),
      hapticEnabled: true,
      notificationsEnabled: true,
      soundEnabled: false,
      toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      strategyVersion: 0,
      lastStrategyCompute: 0,
      bumpStrategy: () => set((state) => ({ strategyVersion: state.strategyVersion + 1, lastStrategyCompute: Date.now() })),
      streak: 0,
      lastOpenDate: '',
      readActivityIds: new Set<string>(),
      unreadActivityCount: 0,
      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          if (state.lastOpenDate === today) return state;
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          return {
            streak: state.lastOpenDate === yesterday ? state.streak + 1 : 1,
            lastOpenDate: today,
          };
        }),
      markActivityRead: (id) =>
        set((state) => {
          const next = new Set(state.readActivityIds);
          next.add(id);
          return { readActivityIds: next };
        }),
      markAllActivityRead: (ids) =>
        set((state) => {
          const next = new Set(state.readActivityIds);
          if (ids) ids.forEach((id) => next.add(id));
          return { readActivityIds: next, unreadActivityCount: 0 };
        }),
      setUnreadActivityCount: (count) => set({ unreadActivityCount: count }),
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
      toasts: [],
      addToast: (message, onUndo) =>
        set((state) => ({
          toasts: [...state.toasts, { id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, message, onUndo }],
        })),
      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      scrollPositions: {},
      saveScrollPosition: (tab, y) =>
        set((state) => ({ scrollPositions: { ...state.scrollPositions, [tab]: y } })),
      getScrollPosition: (_tab: string) => 0, // use getScrollPosition export below instead
      detailReadPositions: {},
      saveDetailReadPosition: (itemId, progress) =>
        set((state) => ({ detailReadPositions: { ...state.detailReadPositions, [itemId]: progress } })),
      avatarUrl: '',
      setAvatarUrl: (url: string) => set({ avatarUrl: url }),
      lastVisitTimestamp: 0,
      updateLastVisit: () => set({ lastVisitTimestamp: Date.now() }),
    }),
    {
      name: 'meta-everything-storage',
      partialize: (state) => ({
        isDark: state.isDark,
        likedItems: [...state.likedItems],
        bookmarkedItems: [...state.bookmarkedItems],
        viewedItems: [...state.viewedItems],
        hiddenItems: [...state.hiddenItems],
        hapticEnabled: state.hapticEnabled,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
        strategyVersion: state.strategyVersion,
        lastStrategyCompute: state.lastStrategyCompute,
        streak: state.streak,
        lastOpenDate: state.lastOpenDate,
        readActivityIds: [...state.readActivityIds],
        scrollPositions: state.scrollPositions,
        detailReadPositions: state.detailReadPositions,
        avatarUrl: state.avatarUrl,
        lastVisitTimestamp: state.lastVisitTimestamp,
      }),
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown> | undefined;
        if (!p) return current;
        const isDark = typeof p.isDark === 'boolean' ? p.isDark : current.isDark;
        return {
          ...current,
          isDark,
          p: isDark ? palettes.dark : palettes.light,
          likedItems: new Set(Array.isArray(p.likedItems) ? (p.likedItems as string[]) : []),
          bookmarkedItems: new Set(Array.isArray(p.bookmarkedItems) ? (p.bookmarkedItems as string[]) : []),
          viewedItems: new Set(Array.isArray(p.viewedItems) ? (p.viewedItems as string[]) : []),
          hiddenItems: new Set(Array.isArray(p.hiddenItems) ? (p.hiddenItems as string[]) : []),
          hapticEnabled: typeof p.hapticEnabled === 'boolean' ? p.hapticEnabled : current.hapticEnabled,
          notificationsEnabled: typeof p.notificationsEnabled === 'boolean' ? p.notificationsEnabled : current.notificationsEnabled,
          soundEnabled: typeof p.soundEnabled === 'boolean' ? p.soundEnabled : current.soundEnabled,
          strategyVersion: typeof p.strategyVersion === 'number' ? p.strategyVersion : 0,
          lastStrategyCompute: typeof p.lastStrategyCompute === 'number' ? p.lastStrategyCompute : 0,
          streak: typeof p.streak === 'number' ? p.streak : 0,
          lastOpenDate: typeof p.lastOpenDate === 'string' ? p.lastOpenDate : '',
          readActivityIds: new Set(Array.isArray(p.readActivityIds) ? (p.readActivityIds as string[]) : []),
          scrollPositions: (p.scrollPositions && typeof p.scrollPositions === 'object') ? (p.scrollPositions as Record<string, number>) : {},
          detailReadPositions: (p.detailReadPositions && typeof p.detailReadPositions === 'object') ? (p.detailReadPositions as Record<string, number>) : {},
          avatarUrl: typeof p.avatarUrl === 'string' ? p.avatarUrl : '',
          lastVisitTimestamp: typeof p.lastVisitTimestamp === 'number' ? p.lastVisitTimestamp : 0,
        };
      },
    }
  )
);

/** Read scroll position outside of React render (avoids stale closure in store initializer) */
export const getScrollPosition = (tab: string): number =>
  useStore.getState().scrollPositions[tab] ?? 0;
