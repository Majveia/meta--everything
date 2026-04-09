import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStore, getScrollPosition } from '@/lib/store';

// Reset the store before each test
beforeEach(() => {
  const { setState } = useStore;
  setState({
    isDark: true,
    likedItems: new Set<string>(),
    bookmarkedItems: new Set<string>(),
    viewedItems: new Set<string>(),
    hiddenItems: new Set<string>(),
    hapticEnabled: true,
    notificationsEnabled: true,
    soundEnabled: false,
    strategyVersion: 0,
    lastStrategyCompute: 0,
    streak: 0,
    lastOpenDate: '',
    readActivityIds: new Set<string>(),
    unreadActivityCount: 0,
    activeTab: 'home',
    toasts: [],
    scrollPositions: {},
    detailReadPositions: {},
    avatarUrl: '',
    lastVisitTimestamp: 0,
  });
});

// ═══ Theme toggling ═══

describe('theme', () => {
  it('starts in dark mode', () => {
    expect(useStore.getState().isDark).toBe(true);
  });

  it('toggles between dark and light', () => {
    useStore.getState().toggleTheme();
    expect(useStore.getState().isDark).toBe(false);
    expect(useStore.getState().p.bg).toBeDefined();

    useStore.getState().toggleTheme();
    expect(useStore.getState().isDark).toBe(true);
  });
});

// ═══ Like / Bookmark / Hidden ═══

describe('engagement toggles', () => {
  it('toggleLike adds and removes items', () => {
    useStore.getState().toggleLike('item-1');
    expect(useStore.getState().likedItems.has('item-1')).toBe(true);

    useStore.getState().toggleLike('item-1');
    expect(useStore.getState().likedItems.has('item-1')).toBe(false);
  });

  it('toggleBookmark adds and removes items', () => {
    useStore.getState().toggleBookmark('item-2');
    expect(useStore.getState().bookmarkedItems.has('item-2')).toBe(true);

    useStore.getState().toggleBookmark('item-2');
    expect(useStore.getState().bookmarkedItems.has('item-2')).toBe(false);
  });

  it('markViewed is idempotent', () => {
    useStore.getState().markViewed('item-1');
    useStore.getState().markViewed('item-1');
    expect(useStore.getState().viewedItems.has('item-1')).toBe(true);
    expect(useStore.getState().viewedItems.size).toBe(1);
  });

  it('toggleHidden adds and removes items', () => {
    useStore.getState().toggleHidden('item-3');
    expect(useStore.getState().hiddenItems.has('item-3')).toBe(true);

    useStore.getState().toggleHidden('item-3');
    expect(useStore.getState().hiddenItems.has('item-3')).toBe(false);
  });

  it('multiple items can be liked independently', () => {
    useStore.getState().toggleLike('a');
    useStore.getState().toggleLike('b');
    useStore.getState().toggleLike('c');
    expect(useStore.getState().likedItems.size).toBe(3);

    useStore.getState().toggleLike('b');
    expect(useStore.getState().likedItems.size).toBe(2);
    expect(useStore.getState().likedItems.has('b')).toBe(false);
  });
});

// ═══ Settings toggles ═══

describe('settings', () => {
  it('toggles haptic, notifications, and sound', () => {
    expect(useStore.getState().hapticEnabled).toBe(true);
    useStore.getState().toggleHaptic();
    expect(useStore.getState().hapticEnabled).toBe(false);

    expect(useStore.getState().notificationsEnabled).toBe(true);
    useStore.getState().toggleNotifications();
    expect(useStore.getState().notificationsEnabled).toBe(false);

    expect(useStore.getState().soundEnabled).toBe(false);
    useStore.getState().toggleSound();
    expect(useStore.getState().soundEnabled).toBe(true);
  });
});

// ═══ Strategy version ═══

describe('strategy', () => {
  it('bumpStrategy increments version and updates timestamp', () => {
    const before = Date.now();
    useStore.getState().bumpStrategy();
    const state = useStore.getState();
    expect(state.strategyVersion).toBe(1);
    expect(state.lastStrategyCompute).toBeGreaterThanOrEqual(before);
  });
});

// ═══ Streak ═══

describe('streak', () => {
  it('starts a new streak on first visit', () => {
    useStore.getState().updateStreak();
    expect(useStore.getState().streak).toBe(1);
    expect(useStore.getState().lastOpenDate).toBe(new Date().toISOString().slice(0, 10));
  });

  it('does not double-count same day', () => {
    useStore.getState().updateStreak();
    useStore.getState().updateStreak();
    expect(useStore.getState().streak).toBe(1);
  });

  it('increments streak for consecutive days', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    useStore.setState({ streak: 5, lastOpenDate: yesterday });
    useStore.getState().updateStreak();
    expect(useStore.getState().streak).toBe(6);
  });

  it('resets streak after a gap', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
    useStore.setState({ streak: 10, lastOpenDate: twoDaysAgo });
    useStore.getState().updateStreak();
    expect(useStore.getState().streak).toBe(1);
  });
});

// ═══ Activity ═══

describe('activity', () => {
  it('marks individual activities as read', () => {
    useStore.getState().markActivityRead('act-1');
    useStore.getState().markActivityRead('act-2');
    expect(useStore.getState().readActivityIds.size).toBe(2);
  });

  it('marks all activities as read and resets unread count', () => {
    useStore.setState({ unreadActivityCount: 5 });
    useStore.getState().markAllActivityRead(['a', 'b', 'c']);
    expect(useStore.getState().readActivityIds.size).toBe(3);
    expect(useStore.getState().unreadActivityCount).toBe(0);
  });
});

// ═══ Tabs ═══

describe('tabs', () => {
  it('switches active tab', () => {
    useStore.getState().setActiveTab('explore');
    expect(useStore.getState().activeTab).toBe('explore');
  });
});

// ═══ Toasts ═══

describe('toasts', () => {
  it('adds and removes toasts', () => {
    useStore.getState().addToast('Hello!');
    expect(useStore.getState().toasts).toHaveLength(1);
    expect(useStore.getState().toasts[0].message).toBe('Hello!');

    const id = useStore.getState().toasts[0].id;
    useStore.getState().removeToast(id);
    expect(useStore.getState().toasts).toHaveLength(0);
  });

  it('supports undo callback on toast', () => {
    const onUndo = vi.fn();
    useStore.getState().addToast('Undo me', onUndo);
    expect(useStore.getState().toasts[0].onUndo).toBe(onUndo);
  });
});

// ═══ Scroll positions ═══

describe('scroll positions', () => {
  it('saves and retrieves scroll positions', () => {
    useStore.getState().saveScrollPosition('home', 250);
    expect(getScrollPosition('home')).toBe(250);
  });

  it('returns 0 for unknown tabs', () => {
    expect(getScrollPosition('unknown-tab')).toBe(0);
  });
});

// ═══ Detail read positions ═══

describe('detail read positions', () => {
  it('saves read progress for items', () => {
    useStore.getState().saveDetailReadPosition('item-1', 0.75);
    expect(useStore.getState().detailReadPositions['item-1']).toBe(0.75);
  });
});

// ═══ Avatar ═══

describe('avatar', () => {
  it('sets avatar URL', () => {
    useStore.getState().setAvatarUrl('https://example.com/avatar.png');
    expect(useStore.getState().avatarUrl).toBe('https://example.com/avatar.png');
  });
});
