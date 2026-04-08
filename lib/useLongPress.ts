import { useRef, useCallback } from 'react';

export function useLongPress(onLongPress: (x: number, y: number) => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    didLongPress.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress(clientX, clientY);
    }, ms);
  }, [onLongPress, ms]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onClick = useCallback((e: React.MouseEvent) => {
    if (didLongPress.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  return { onMouseDown: start, onTouchStart: start, onMouseUp: cancel, onMouseLeave: cancel, onTouchEnd: cancel, onClickCapture: onClick };
}
