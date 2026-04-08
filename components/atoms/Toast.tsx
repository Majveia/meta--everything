'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ToastContainer() {
  const p = useStore((s) => s.p);
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: 80,
        left: 0,
        right: 0,
        zIndex: 55,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} id={t.id} message={t.message} onUndo={t.onUndo} p={p} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  id,
  message,
  onUndo,
  p,
  onDismiss,
}: {
  id: string;
  message: string;
  onUndo?: () => void;
  p: ReturnType<typeof useStore.getState>['p'];
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 2500);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.3, ease }}
      style={{
        pointerEvents: 'auto',
        background: p.card,
        border: `1px solid ${p.cardB}`,
        borderRadius: 10,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: p.sh,
        maxWidth: 340,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 9.5,
          letterSpacing: '.03em',
          color: p.txS,
        }}
      >
        {message}
      </span>
      {onUndo && (
        <button
          onClick={() => {
            onUndo();
            onDismiss(id);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'SF Mono', monospace",
            fontSize: 9.5,
            letterSpacing: '.03em',
            color: p.tc,
            fontWeight: 500,
            padding: 0,
            whiteSpace: 'nowrap',
          }}
        >
          UNDO
        </button>
      )}
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 2.5, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: p.tc,
          transformOrigin: 'left',
        }}
      />
    </motion.div>
  );
}
