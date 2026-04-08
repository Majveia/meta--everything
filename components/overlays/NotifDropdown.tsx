'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { E } from '@/lib/constants';
import { notifications } from '@/lib/content';

interface NotifDropdownProps {
  open: boolean;
  onClose: () => void;
  onViewAll?: () => void;
  onNotifTap?: (notifId: string) => void;
}

export default function NotifDropdown({ open, onClose, onViewAll, onNotifTap }: NotifDropdownProps) {
  const p = useStore((s) => s.p);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  if (!open) return null;
  const visible = notifications.filter((n) => !dismissed.has(n.id));

  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
      <div
        role="dialog"
        aria-label="Notifications"
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          zIndex: 100,
          width: 340,
          maxHeight: '70vh',
          overflowY: 'auto',
          marginTop: 8,
          background: p.card,
          borderRadius: 14,
          border: `1px solid ${p.cardB}`,
          boxShadow: p.shL,
          animation: `ni .22s ${E}`,
        }}
      >
        <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${p.bdrS}` }}>
          <h3 style={{ fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif", fontSize: 16, fontWeight: 400, color: p.tx, letterSpacing: '-0.02em' }}>Notifications</h3>
        </div>
        <div style={{ padding: 4 }}>
          {visible.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.txM }}>No new notifications</span>
            </div>
          ) : (
            visible.slice(0, 4).map((n, i) => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={n.text}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNotifTap?.(n.id); onClose(); } }}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 9,
                  cursor: 'pointer',
                  transition: 'background .1s ease',
                  animation: `nit .25s ${E} ${i * 0.03}s both`,
                  position: 'relative',
                }}
                onClick={() => { onNotifTap?.(n.id); onClose(); }}
                onMouseEnter={(e) => { (e.currentTarget).style.background = p.bgH; }}
                onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: n.accent + '0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                  {n.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 12.5, color: p.tx, lineHeight: 1.4, margin: 0 }}>{n.text}</p>
                  <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
                    <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: n.accent }}>{n.app}</span>
                    <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: p.txF }}>{n.time}</span>
                  </div>
                </div>
                <button
                  aria-label={`Dismiss notification: ${n.text}`}
                  onClick={(e) => { e.stopPropagation(); setDismissed((prev) => new Set(prev).add(n.id)); }}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 20, height: 20, borderRadius: 4,
                    border: 'none', background: 'transparent',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    opacity: 0.4, transition: 'opacity .15s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.opacity = '0.4'; }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        <div onClick={() => { onViewAll?.(); onClose(); }} style={{ padding: '10px 16px', borderTop: `1px solid ${p.bdrS}`, textAlign: 'center', cursor: 'pointer' }}>
          <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 12, color: p.tc }}>View all</span>
        </div>
      </div>
    </>
  );
}
