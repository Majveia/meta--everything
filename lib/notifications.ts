import type { ContentItem, Notification } from './content';
import { platformColors } from './constants';

/** Parse metric strings like "1.2M", "420K", "89" into numbers */
function parseMetric(s?: string): number {
  if (!s) return 0;
  const clean = s.replace(/,/g, '').trim();
  if (clean.endsWith('M')) return parseFloat(clean) * 1_000_000;
  if (clean.endsWith('K')) return parseFloat(clean) * 1_000;
  return parseFloat(clean) || 0;
}

const platformIcons: Record<string, string> = {
  twitch: '\uD83D\uDD34',   // red circle
  youtube: '\u25B6\uFE0F',  // play button
  x: '\uD83D\uDD25',        // fire
  substack: '\uD83D\uDCF0', // newspaper
  kick: '\uD83D\uDFE2',     // green circle
};

/**
 * Generate notifications dynamically from actual content items.
 * Prioritizes: live streams > new items > high-engagement trending items.
 */
export function generateNotifications(items: ContentItem[]): Notification[] {
  const notifications: Notification[] = [];
  let id = 0;

  // Live streams → "X just went live"
  const liveItems = items.filter((i) => i.isLive || i.type === 'live');
  for (const item of liveItems) {
    notifications.push({
      id: `notif-${id++}`,
      icon: platformIcons[item.platform] || '\uD83D\uDD34',
      text: `${item.author} is live: ${item.title}`,
      app: capitalize(item.platform),
      time: item.time || 'now',
      accent: platformColors[item.platform] || '#888',
      read: false,
    });
  }

  // New items → "New from Author: Title"
  const newItems = items.filter((i) => i.isNew && i.type !== 'live');
  for (const item of newItems) {
    notifications.push({
      id: `notif-${id++}`,
      icon: platformIcons[item.platform] || '\uD83D\uDD25',
      text: `New from ${item.author}: ${item.title}`,
      app: capitalize(item.platform),
      time: item.time || 'recently',
      accent: platformColors[item.platform] || '#888',
      read: false,
    });
  }

  // High-engagement trending → "Trending: Title"
  const trending = items
    .filter((i) => !i.isLive && !i.isNew && parseMetric(i.views) > 500_000)
    .sort((a, b) => parseMetric(b.views) - parseMetric(a.views));
  for (const item of trending) {
    notifications.push({
      id: `notif-${id++}`,
      icon: '\uD83D\uDCC8',  // chart increasing
      text: `Trending: ${item.title} \u2014 ${item.views} views`,
      app: capitalize(item.platform),
      time: item.time || '',
      accent: platformColors[item.platform] || '#888',
      read: true,
    });
  }

  // Cap at 6 notifications
  return notifications.slice(0, 6);
}

function capitalize(s: string): string {
  if (s === 'x') return 'X';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
