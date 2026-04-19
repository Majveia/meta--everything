'use client';

import { createContext, useContext } from 'react';
import { useContent, type ContentState } from './useContent';
import { allContent, mockFyItems, mockFlItems, mockExItems } from './content';

const defaultState: ContentState = {
  allItems: allContent,
  fyItems: mockFyItems,
  flItems: mockFlItems,
  exItems: mockExItems,
  rankablePool: allContent,
  loading: false,
  sources: { youtube: 'unconfigured', twitch: 'unconfigured', x: 'unconfigured', substack: 'unconfigured', kick: 'unconfigured' },
  refresh: () => {},
  lastFetchTime: 0,
};

const ContentContext = createContext<ContentState>(defaultState);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const state = useContent();
  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

export function useContentData(): ContentState {
  return useContext(ContentContext);
}
