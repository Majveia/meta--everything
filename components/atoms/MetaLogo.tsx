'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useStore } from '@/lib/store';

export default function MetaLogo({ size = 26 }: { size?: number }) {
  const p = useStore((s) => s.p);
  const prefersReducedMotion = useReducedMotion();
  const [t, setT] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      // Wrap at ~900s to prevent float precision drift after long sessions
      setT(((now - startRef.current) / 1000) % 900);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [prefersReducedMotion]);

  const c = p.tc;

  // Static state for reduced-motion users
  if (prefersReducedMotion) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', flexShrink: 0 }}>
        <circle cx="50" cy="50" r="38" fill="none" stroke={c} strokeWidth="1" opacity={0.22} strokeDasharray="8 4" />
        <circle cx="50" cy="50" r="28" fill="none" stroke={c} strokeWidth="0.8" opacity={0.13} strokeDasharray="4 6" />
        {[0, 1, 2].map((i) => {
          const a = (i * 120 * Math.PI) / 180;
          return <circle key={i} cx={50 + Math.cos(a) * 20} cy={50 + Math.sin(a) * 20} r={2.5} fill={c} opacity={0.5} />;
        })}
        <circle cx="50" cy="50" r={5} fill={c} opacity={0.15} />
        <circle cx="50" cy="50" r={2.5} fill={p.tcG} opacity={0.7} />
        <line x1="44" y1="41" x2="47.5" y2="59" stroke={p.tx} strokeWidth="1.4" opacity={0.4} />
        <line x1="52.5" y1="41" x2="56" y2="59" stroke={p.tx} strokeWidth="1.4" opacity={0.4} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', flexShrink: 0 }}>
      {/* Outer breathing ring */}
      <circle
        cx="50" cy="50"
        r={38 + Math.sin(t * 0.7) * 3}
        fill="none" stroke={c} strokeWidth="1"
        opacity={0.22 + Math.sin(t * 0.5) * 0.08}
        strokeDasharray="8 4"
        strokeDashoffset={t * 12.5}
      />
      {/* Inner ring */}
      <circle
        cx="50" cy="50"
        r={28 + Math.sin(t * 1.1) * 2}
        fill="none" stroke={c} strokeWidth="0.8"
        opacity={0.13 + Math.sin(t * 0.8) * 0.06}
        strokeDasharray="4 6"
        strokeDashoffset={-t * 7.5}
      />
      {/* Orbital particles */}
      {[0, 1, 2].map((i) => {
        const a = ((t * 15 + i * 120) * Math.PI) / 180;
        const r = 20 + Math.sin(t * 0.9 + i) * 3;
        return (
          <circle key={i} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r={2.5 + Math.sin(t + i * 2) * 0.5} fill={c} opacity={0.4 + Math.sin(t * 1.3 + i) * 0.2} />
        );
      })}
      {/* Center glow */}
      <circle cx="50" cy="50" r={5 + Math.sin(t * 1.8)} fill={c} opacity={0.15} />
      <circle cx="50" cy="50" r={2.5} fill={p.tcG} opacity={0.7} />
      {/* Meta lines */}
      <line x1="44" y1="41" x2="47.5" y2="59" stroke={p.tx} strokeWidth="1.4" opacity={0.4 + Math.sin(t * 2) * 0.12} />
      <line x1="52.5" y1="41" x2="56" y2="59" stroke={p.tx} strokeWidth="1.4" opacity={0.4 + Math.sin(t * 2 + 0.5) * 0.12} />
    </svg>
  );
}
