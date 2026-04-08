'use client';

import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

function parseCount(str: string): number {
  const clean = str.replace(/,/g, '').trim();
  const match = clean.match(/^([\d.]+)\s*([KkMmBb])?/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = (match[2] || '').toUpperCase();
  if (suffix === 'K') return num * 1_000;
  if (suffix === 'M') return num * 1_000_000;
  if (suffix === 'B') return num * 1_000_000_000;
  return num;
}

function formatCount(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.round(n).toString();
}

export default function AnimatedCount({ value }: { value: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const target = useRef(parseCount(value));
  const animated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion || animated.current) {
      setDisplay(value);
      return;
    }

    animated.current = true;
    const end = parseCount(value);
    target.current = end;
    if (end === 0) { setDisplay(value); return; }

    const duration = 400;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = end * eased;
      setDisplay(formatCount(current));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(value); // Use original string for final display
    };

    requestAnimationFrame(tick);
  }, [value, prefersReducedMotion]);

  return <>{display}</>;
}
