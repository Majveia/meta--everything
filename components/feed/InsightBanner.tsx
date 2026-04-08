'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { Insight } from '@/lib/harness';

interface InsightBannerProps {
  insights: Insight[];
}

export default function InsightBanner({ insights }: InsightBannerProps) {
  const p = useStore((s) => s.p);
  const [dismissed, setDismissed] = useState(false);

  const topInsight = insights.find((i) => i.strength > 0.3);
  if (!topInsight || dismissed) return null;

  const icon = topInsight.kind === 'affinity' ? '~' : topInsight.kind === 'fatigue' ? '!' : topInsight.kind === 'suggestion' ? '?' : '/';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: 'auto', marginBottom: 14 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: p.bgH,
          borderRadius: 10,
          border: `1px solid ${p.bdrS}`,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflow: 'hidden',
        }}
      >
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: p.tc, fontWeight: 600, flexShrink: 0 }}>{icon}</span>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txS, letterSpacing: '.03em', lineHeight: 1.4, flex: 1 }}>
          {topInsight.label}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          aria-label="Dismiss insight"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            margin: -6,
            color: p.txF,
            flexShrink: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
