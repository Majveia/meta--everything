'use client';

import dynamic from 'next/dynamic';
import { ContentProvider } from '@/lib/ContentProvider';
import Shell from '@/components/layout/Shell';
import SwipeableFeed from '@/components/feed/SwipeableFeed';

const ExploreView = dynamic(() => import('@/components/feed/ExploreView'));
const ActivityView = dynamic(() => import('@/components/feed/ActivityView'));
const ProfileView = dynamic(() => import('@/components/feed/ProfileView'));
const SavedView = dynamic(() => import('@/components/feed/SavedView'));
const StatsView = dynamic(() => import('@/components/feed/StatsView'));

export default function Home() {
  return (
    <ContentProvider>
    <Shell>
      {({ activeTab, onDetailOpen, onContextMenu, showSaved, showStats, onShowSaved, onShowStats, onBackFromSaved, onBackFromStats }) => (
        <>
          {activeTab === 'home' && <SwipeableFeed onTap={onDetailOpen} onLongPress={onContextMenu} />}
          {activeTab === 'explore' && <ExploreView onTap={onDetailOpen} onLongPress={onContextMenu} />}
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
