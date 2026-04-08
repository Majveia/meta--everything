'use client';

import { useStore } from '@/lib/store';
import LiveDot from '@/components/atoms/LiveDot';

interface SectionLabelProps {
  label: string;
  live?: boolean;
}

export default function SectionLabel({ label, live }: SectionLabelProps) {
  const p = useStore((s) => s.p);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '22px 0 12px', paddingLeft: 2, position: 'relative' }}>
      {live && <LiveDot />}
      <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: live ? p.tc : p.txM }}>
        <span style={{ opacity: 0.35 }}>[ </span>{label}<span style={{ opacity: 0.35 }}> ]</span>
      </span>
      {/* Dot-grid accent line — Nothing-inspired */}
      <div style={{ flex: 1, height: 1, marginLeft: 8, backgroundImage: `radial-gradient(circle, ${live ? p.tc : p.txF} 0.5px, transparent 0.5px)`, backgroundSize: '6px 6px', backgroundRepeat: 'repeat-x', opacity: 0.4 }} />
    </div>
  );
}
