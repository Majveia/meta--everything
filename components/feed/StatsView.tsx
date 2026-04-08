'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useContentData } from '@/lib/ContentProvider';
import { platformColors, accentColors } from '@/lib/constants';
import { getTraces } from '@/lib/traces';
import { collectSignals, evaluateStrategy, computeFeedHealth, type Insight } from '@/lib/harness';

const ease = [0.16, 1, 0.3, 1] as const;

interface StatsViewProps {
  onBack: () => void;
}

export default function StatsView({ onBack }: StatsViewProps) {
  const p = useStore((s) => s.p);
  const viewedItems = useStore((s) => s.viewedItems);
  const likedItems = useStore((s) => s.likedItems);
  const bookmarkedItems = useStore((s) => s.bookmarkedItems);

  const hiddenItems = useStore((s) => s.hiddenItems);
  const { allItems } = useContentData();

  // Harness signals
  const traces = getTraces();
  const signals = collectSignals(traces, likedItems, bookmarkedItems, viewedItems, hiddenItems, allItems);
  const strategy = evaluateStrategy(signals, allItems);
  const health = computeFeedHealth(signals, allItems);

  const viewed = allItems.filter((c) => viewedItems.has(c.id));
  const platforms = ['twitch', 'youtube', 'x', 'substack', 'kick'] as const;
  const platformCounts = platforms.map((pl) => ({
    name: pl,
    count: viewed.filter((c) => c.platform === pl).length,
    color: platformColors[pl],
  }));
  const maxCount = Math.max(...platformCounts.map((p) => p.count), 1);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div
          onClick={onBack}
          style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .1s ease' }}
          onMouseEnter={(e) => { (e.currentTarget).style.background = p.bgH; }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.txS} strokeWidth="1.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: p.txM }}>
          Your Stats
        </span>
      </div>

      {/* Big numbers */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Viewed', value: viewedItems.size },
          { label: 'Liked', value: likedItems.size },
          { label: 'Saved', value: bookmarkedItems.size },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease }}
            style={{
              flex: 1,
              background: p.card,
              border: `1px solid ${p.cardB}`,
              borderRadius: 14,
              padding: '20px 18px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 32, color: p.tx, display: 'block', letterSpacing: '-0.02em' }}>{stat.value}</span>
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txM, letterSpacing: '.06em', textTransform: 'uppercase' }}>{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Platform breakdown */}
      <div style={{ background: p.card, border: `1px solid ${p.cardB}`, borderRadius: 14, padding: '18px 20px' }}>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: p.txM, display: 'block', marginBottom: 16 }}>
          Platform Breakdown
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {platformCounts.map((pl, i) => (
            <motion.div
              key={pl.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.35, ease }}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: pl.color, width: 60, flexShrink: 0 }}>{pl.name}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: p.bdrS, overflow: 'hidden' }}>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: pl.count / maxCount }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease }}
                  style={{ height: '100%', background: pl.color, borderRadius: 4, transformOrigin: 'left' }}
                />
              </div>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txM, width: 20, textAlign: 'right' }}>{pl.count}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feed Health */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4, ease }}
        style={{ background: p.card, border: `1px solid ${p.cardB}`, borderRadius: 14, padding: '18px 20px', marginTop: 16 }}
      >
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: p.txM, display: 'block', marginBottom: 16 }}>
          Feed Health
        </span>
        {signals.confidence < 0.05 ? (
          <span style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 14, fontStyle: 'italic', color: p.txF }}>
            Learning your preferences...
          </span>
        ) : (
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              { label: 'Diversity', value: health.diversity, color: accentColors.teal },
              { label: 'Exploration', value: health.exploration, color: accentColors.amber },
              { label: 'Confidence', value: Math.round(health.confidence * 100), color: p.tc },
            ].map((m, i) => (
              <div key={m.label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 8px' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke={p.bdrS} strokeWidth="3" />
                    <motion.circle
                      cx="24" cy="24" r="20" fill="none" stroke={m.color} strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - m.value / 100) }}
                      transition={{ delay: 1 + i * 0.15, duration: 0.8, ease }}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.tx }}>{m.value}%</span>
                </div>
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase', color: p.txM }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Discovered Patterns */}
      {strategy.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4, ease }}
          style={{ background: p.card, border: `1px solid ${p.cardB}`, borderRadius: 14, padding: '18px 20px', marginTop: 16 }}
        >
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: p.txM, display: 'block', marginBottom: 14 }}>
            Discovered Patterns
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {strategy.insights.map((insight: Insight, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.08, duration: 0.3, ease }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: 3, flexShrink: 0,
                  background: insight.kind === 'affinity' ? accentColors.green : insight.kind === 'fatigue' ? accentColors.red : insight.kind === 'suggestion' ? accentColors.amber : accentColors.teal,
                }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: p.txS, fontWeight: 300, letterSpacing: '0' }}>{insight.label}</span>
                <div style={{ marginLeft: 'auto', width: 32, height: 3, borderRadius: 2, background: p.bdrS, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: `${insight.strength * 100}%`, height: '100%', borderRadius: 2, background: insight.kind === 'affinity' ? accentColors.green : insight.kind === 'fatigue' ? accentColors.red : accentColors.teal }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Taste Profile */}
      {signals.tagAffinities.size > 0 && signals.confidence >= 0.05 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4, ease }}
          style={{ background: p.card, border: `1px solid ${p.cardB}`, borderRadius: 14, padding: '18px 20px', marginTop: 16 }}
        >
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: p.txM, display: 'block', marginBottom: 14 }}>
            Taste Profile
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[...signals.tagAffinities.entries()]
              .filter(([, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([tag, aff], i) => {
                const maxAff = Math.max(...[...signals.tagAffinities.values()].filter((v) => v > 0), 1);
                const opacity = 0.4 + 0.6 * (aff / maxAff);
                return (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + i * 0.06, duration: 0.3, ease }}
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: p.tc,
                      opacity,
                      background: `${p.tc}11`,
                      border: `1px solid ${p.tc}22`,
                      borderRadius: 8,
                      padding: '5px 10px',
                    }}
                  >
                    {tag}
                  </motion.span>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Feed note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        style={{
          fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
          fontSize: 14,
          fontStyle: 'italic',
          color: p.txF,
          textAlign: 'center',
          marginTop: 24,
          letterSpacing: '-0.01em',
        }}
      >
        {signals.confidence < 0.05
          ? 'Your feed journey is just beginning.'
          : signals.confidence < 0.5
          ? 'The harness is still learning your taste.'
          : 'The void generates. Everything recurses.'}
      </motion.p>
    </div>
  );
}
