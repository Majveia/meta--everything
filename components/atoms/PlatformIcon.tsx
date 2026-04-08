'use client';

import { useStore } from '@/lib/store';

interface PlatformIconProps {
  platform: string;
  size?: number;
}

export default function PlatformIcon({ platform, size = 14 }: PlatformIconProps) {
  const p = useStore((s) => s.p);
  const s = size;

  const icons: Record<string, React.ReactNode> = {
    twitch: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#9146FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2H3v16h5v4l4-4h5l4-4V2zM11 11V7M16 11V7" />
      </svg>
    ),
    x: (
      <svg width={s - 1} height={s - 1} viewBox="0 0 24 24" fill={p.tx} opacity={0.8}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    youtube: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3 3 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3 3 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3 3 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3 3 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    substack: (
      <svg width={s - 1} height={s - 1} viewBox="0 0 24 24" fill={p.am}>
        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
      </svg>
    ),
    kick: (
      <svg width={s - 1} height={s - 1} viewBox="0 0 24 24" fill="#53FC18">
        <rect x="2" y="2" width="6" height="20" rx="1" />
        <path d="M10 12l6-8h6l-7 9 7 9h-6l-6-8z" />
      </svg>
    ),
  };

  return <>{icons[platform] || null}</>;
}
