'use client';

import { useStore } from '@/lib/store';

interface SkeletonProps {
  h?: number;
  radius?: number;
}

export default function Skeleton({ h = 200, radius = 14 }: SkeletonProps) {
  const p = useStore((s) => s.p);
  return (
    <div
      style={{
        height: h,
        borderRadius: radius,
        overflow: 'hidden',
        backgroundImage: `linear-gradient(90deg, ${p.skelA} 25%, ${p.skelB} 50%, ${p.skelA} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s ease infinite',
      }}
    />
  );
}

export function SkeletonFeed() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 20 }}>
      <Skeleton h={280} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Skeleton h={240} />
        <Skeleton h={240} />
      </div>
      <Skeleton h={100} radius={12} />
    </div>
  );
}
