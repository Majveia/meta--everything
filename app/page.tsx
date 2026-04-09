'use client';

import { ContentProvider } from '@/lib/ContentProvider';
import Shell from '@/components/layout/Shell';
import SwipeableFeed from '@/components/feed/SwipeableFeed';
import ExploreView from '@/components/feed/ExploreView';
import ActivityView from '@/components/feed/ActivityView';
import ProfileView from '@/components/feed/ProfileView';
import SavedView from '@/components/feed/SavedView';
import StatsView from '@/components/feed/StatsView';

export default function Home() {
  return (
    <ContentProvider>
    <Shell>
      {({ activeTab, onDetailOpen, onPlayOpen, onContextMenu, showSaved, showStats, onShowSaved, onShowStats, onBackFromSaved, onBackFromStats }) => (
        <>
          {activeTab === 'home' && <SwipeableFeed onTap={onDetailOpen} onPlay={onPlayOpen} onLongPress={onContextMenu} />}
          {activeTab === 'explore' && <ExploreView onTap={onDetailOpen} onPlay={onPlayOpen} onLongPress={onContextMenu} />}
          {activeTab === 'activity' && <ActivityView onDetailOpen={onDetailOpen} />}
          {activeTab === 'profile' && !showSaved && !showStats && <ProfileView onShowSaved={onShowSaved} onShowStats={onShowStats} />}
          {activeTab === 'profile' && showSaved && <SavedView onBack={onBackFromSaved} onDetailOpen={onDetailOpen} />}
          {activeTab === 'profile' && showStats && <StatsView onBack={onBackFromStats} />}
        </>
      )}
    </Shell>
    </ContentProvider>
  );
}
