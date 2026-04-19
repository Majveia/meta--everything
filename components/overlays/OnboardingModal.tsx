'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { pushTrace } from '@/lib/traces';
import { platformColors, E } from '@/lib/constants';
import PlatformIcon from '@/components/atoms/PlatformIcon';

const TOPICS = ['AI', 'Science', 'Coding', 'Gaming', 'Startups', 'Philosophy', 'Design', 'Music', 'Culture', 'Math', 'Tech', 'Entertainment'];

const PLATFORMS: { id: 'youtube' | 'twitch' | 'x' | 'substack' | 'kick'; label: string }[] = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitch', label: 'Twitch' },
  { id: 'x', label: 'X / Twitter' },
  { id: 'substack', label: 'Substack' },
  { id: 'kick', label: 'Kick' },
];

const DENSITIES: { id: 'compact' | 'default' | 'spacious'; label: string; desc: string }[] = [
  { id: 'compact', label: 'Compact', desc: 'More items, less space' },
  { id: 'default', label: 'Default', desc: 'Balanced layout' },
  { id: 'spacious', label: 'Spacious', desc: 'Rich visuals, more breathing room' },
];

const ease = [0.16, 1, 0.3, 1] as const;

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const p = useStore((s) => s.p);
  const setHasOnboarded = useStore((s) => s.setHasOnboarded);
  const setFeedDensity = useStore((s) => s.setFeedDensity);
  const bumpStrategy = useStore((s) => s.bumpStrategy);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  const [step, setStep] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [selectedDensity, setSelectedDensity] = useState<'compact' | 'default' | 'spacious'>('default');

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleComplete = () => {
    // Seed harness with preference_boost traces
    for (const topic of selectedTopics) {
      pushTrace({ kind: 'preference_boost', meta: { tag: topic.toLowerCase() } });
    }
    for (const platform of selectedPlatforms) {
      pushTrace({ kind: 'preference_boost', meta: { platform } });
    }
    setFeedDensity(selectedDensity);
    setHasOnboarded(true);
    bumpStrategy();
    onComplete();
  };

  const canProceed = step === 0 ? selectedTopics.size >= 2 : step === 1 ? selectedPlatforms.size >= 1 : true;
  const totalSteps = 3;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(5,5,5,.7)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease } }}
            exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] } }}
            style={{
              background: p.card,
              borderRadius: 18,
              border: `1px solid ${p.cardB}`,
              boxShadow: p.shL,
              maxWidth: 440,
              width: '100%',
              margin: '0 16px',
              padding: '32px 28px 24px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: i <= step ? p.tc : p.bdr,
                    transition: `background .3s ${E}`,
                  }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 0: Topics */}
              {step === 0 && (
                <motion.div
                  key="topics"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease } }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                >
                  <h2 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 22, letterSpacing: '-0.025em', fontWeight: 400, color: p.tx, marginBottom: 6 }}>
                    What interests you?
                  </h2>
                  <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txM, letterSpacing: '.04em', marginBottom: 22 }}>
                    Pick at least 2 topics to personalize your feed
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {TOPICS.map((t) => {
                      const active = selectedTopics.has(t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggleTopic(t)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: `1px solid ${active ? p.tc : p.bdr}`,
                            background: active ? `${p.tc}18` : 'transparent',
                            color: active ? p.tc : p.txS,
                            fontFamily: "var(--font-body), 'Outfit', sans-serif",
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: `all .2s ${E}`,
                            fontWeight: active ? 500 : 400,
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Platforms */}
              {step === 1 && (
                <motion.div
                  key="platforms"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease } }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                >
                  <h2 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 22, letterSpacing: '-0.025em', fontWeight: 400, color: p.tx, marginBottom: 6 }}>
                    Where do you spend time?
                  </h2>
                  <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txM, letterSpacing: '.04em', marginBottom: 22 }}>
                    Select the platforms you want in your feed
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PLATFORMS.map((pl) => {
                      const active = selectedPlatforms.has(pl.id);
                      const ac = platformColors[pl.id];
                      return (
                        <button
                          key={pl.id}
                          onClick={() => togglePlatform(pl.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: `1px solid ${active ? ac + '50' : p.bdr}`,
                            background: active ? `${ac}12` : 'transparent',
                            cursor: 'pointer',
                            transition: `all .2s ${E}`,
                          }}
                        >
                          <PlatformIcon platform={pl.id} size={18} />
                          <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 14, color: active ? p.tx : p.txS, flex: 1, textAlign: 'left' }}>
                            {pl.label}
                          </span>
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              border: `1.5px solid ${active ? ac : p.bdrH}`,
                              background: active ? ac : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: `all .15s ${E}`,
                            }}
                          >
                            {active && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Density */}
              {step === 2 && (
                <motion.div
                  key="density"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease } }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                >
                  <h2 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 22, letterSpacing: '-0.025em', fontWeight: 400, color: p.tx, marginBottom: 6 }}>
                    How do you like your feed?
                  </h2>
                  <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txM, letterSpacing: '.04em', marginBottom: 22 }}>
                    You can change this anytime in settings
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {DENSITIES.map((d) => {
                      const active = selectedDensity === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDensity(d.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: '14px 16px',
                            borderRadius: 10,
                            border: `1px solid ${active ? p.tc + '50' : p.bdr}`,
                            background: active ? `${p.tc}12` : 'transparent',
                            cursor: 'pointer',
                            transition: `all .2s ${E}`,
                          }}
                        >
                          {/* Mini layout preview */}
                          <div style={{ width: 36, height: 28, display: 'flex', flexDirection: 'column', gap: d.id === 'compact' ? 2 : d.id === 'spacious' ? 5 : 3, flexShrink: 0 }}>
                            {[0, 1, 2].map((i) => (
                              <div key={i} style={{ height: d.id === 'compact' ? 6 : d.id === 'spacious' ? 8 : 7, borderRadius: 1.5, background: active ? p.tc + '40' : p.bdrH, transition: `background .2s ${E}` }} />
                            ))}
                          </div>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 14, color: active ? p.tx : p.txS, display: 'block', fontWeight: active ? 500 : 400 }}>
                              {d.label}
                            </span>
                            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txM, letterSpacing: '.03em' }}>
                              {d.desc}
                            </span>
                          </div>
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: `1.5px solid ${active ? p.tc : p.bdrH}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: `all .15s ${E}`,
                            }}
                          >
                            {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.tc }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: `1px solid ${p.bdr}`,
                    background: 'transparent',
                    color: p.txS,
                    fontFamily: "var(--font-body), 'Outfit', sans-serif",
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: `all .2s ${E}`,
                  }}
                >
                  Back
                </button>
              )}
              <button
                onClick={() => step < totalSteps - 1 ? setStep((s) => s + 1) : handleComplete()}
                disabled={!canProceed}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 10,
                  border: 'none',
                  background: canProceed ? p.tc : p.bdr,
                  color: canProceed ? '#fff' : p.txF,
                  fontFamily: "var(--font-body), 'Outfit', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  transition: `all .2s ${E}`,
                }}
              >
                {step < totalSteps - 1 ? 'Continue' : 'Start Exploring'}
              </button>
            </div>

            {/* Skip option */}
            {step === 0 && (
              <button
                onClick={handleComplete}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 12,
                  background: 'none',
                  border: 'none',
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 10,
                  color: p.txF,
                  letterSpacing: '.04em',
                  cursor: 'pointer',
                  padding: 6,
                }}
              >
                Skip for now
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
