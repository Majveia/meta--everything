export const E = 'cubic-bezier(.16,1,.3,1)';

export const platformColors: Record<string, string> = {
  twitch: '#9146FF',
  x: '#8B8580',
  youtube: '#FF0000',
  substack: '#E8A849',
  kick: '#53FC18',
};

/** Accent colors used across the app for consistent theming */
export const accentColors = {
  red: '#E84040',
  amber: '#E8A849',
  teal: '#3D8B8B',
  green: '#4A9B6E',
} as const;

/** Snappy exit animation curve — faster and more decisive than entrance */
export const EXIT_EASE = [0.32, 0, 0.67, 0] as const;

/** Mechanical ease — Nothing-inspired percussive timing (click, not swoosh) */
export const MECH_EASE = [0.25, 0.1, 0.25, 1] as const;

/** Mechanical duration — shorter, decisive */
export const MECH_DUR = 0.18;

/** Content type labels and reading time estimates */
export function contentMeta(platform: string, type: string, subtitle?: string, extra?: string): { typeLabel: string; readTime?: string } {
  const wordCount = ((subtitle || '').split(/\s+/).length + (extra || '').split(/\s+/).length);
  const readMins = Math.max(1, Math.ceil(wordCount / 200));

  switch (type) {
    case 'live':
      return { typeLabel: 'STREAM' };
    case 'compact':
      return { typeLabel: platform === 'x' ? 'THREAD' : 'POST', readTime: readMins > 1 ? `${readMins}m read` : undefined };
    default:
      if (platform === 'youtube') return { typeLabel: 'VIDEO' };
      if (platform === 'substack') return { typeLabel: 'ARTICLE', readTime: `${readMins}m read` };
      return { typeLabel: 'VIDEO' };
  }
}

/** Parse a relative time string ("5m", "2h", "1d") to milliseconds ago */
export function parseRelativeTimeMs(time?: string): number {
  if (!time) return Infinity;
  const num = parseInt(time);
  if (isNaN(num)) return Infinity;
  if (time.includes('m')) return num * 60_000;
  if (time.includes('d')) return num * 86_400_000;
  // default: hours
  return num * 3_600_000;
}

/**
 * Time-decay visual factor: returns 0.65–1.0 based on content age.
 * Recent content (< 1h) = 1.0, older content fades subtly.
 */
export function timeDecayFactor(time?: string): number {
  if (!time) return 0.85;
  const num = parseInt(time);
  if (isNaN(num)) return 0.85;
  let hours = num;
  if (time.includes('m')) hours = num / 60;
  else if (time.includes('d')) hours = num * 24;
  // Exponential decay: half-life of 12 hours, floor at 0.65
  return Math.max(0.65, 0.4 + 0.6 * Math.pow(0.5, hours / 12));
}
