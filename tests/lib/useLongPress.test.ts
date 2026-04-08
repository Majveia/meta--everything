import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLongPress } from '@/lib/useLongPress';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function makeMockMouseEvent(x = 100, y = 200): React.MouseEvent {
  return { clientX: x, clientY: y } as React.MouseEvent;
}

function makeMockTouchEvent(x = 150, y = 250): React.TouchEvent {
  return { touches: [{ clientX: x, clientY: y }] } as unknown as React.TouchEvent;
}

describe('useLongPress', () => {
  it('returns all required event handlers', () => {
    const { result } = renderHook(() => useLongPress(vi.fn()));
    const handlers = result.current;

    expect(handlers.onMouseDown).toBeTypeOf('function');
    expect(handlers.onTouchStart).toBeTypeOf('function');
    expect(handlers.onMouseUp).toBeTypeOf('function');
    expect(handlers.onMouseLeave).toBeTypeOf('function');
    expect(handlers.onTouchEnd).toBeTypeOf('function');
    expect(handlers.onClickCapture).toBeTypeOf('function');
  });

  it('fires onLongPress after default 500ms delay', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress));

    act(() => { result.current.onMouseDown(makeMockMouseEvent(100, 200)); });
    expect(onLongPress).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(500); });
    expect(onLongPress).toHaveBeenCalledWith(100, 200);
  });

  it('does not fire before the delay elapses', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress));

    act(() => { result.current.onMouseDown(makeMockMouseEvent()); });
    act(() => { vi.advanceTimersByTime(499); });
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('cancels timer on mouseUp before delay', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress));

    act(() => { result.current.onMouseDown(makeMockMouseEvent()); });
    act(() => { vi.advanceTimersByTime(200); });
    act(() => { result.current.onMouseUp(makeMockMouseEvent()); });
    act(() => { vi.advanceTimersByTime(500); });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('cancels timer on mouseLeave', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress));

    act(() => { result.current.onMouseDown(makeMockMouseEvent()); });
    act(() => { result.current.onMouseLeave(makeMockMouseEvent()); });
    act(() => { vi.advanceTimersByTime(1000); });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('supports touch events', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress));

    act(() => { result.current.onTouchStart(makeMockTouchEvent(150, 250)); });
    act(() => { vi.advanceTimersByTime(500); });

    expect(onLongPress).toHaveBeenCalledWith(150, 250);
  });

  it('suppresses click after long press', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress));

    // Trigger long press
    act(() => { result.current.onMouseDown(makeMockMouseEvent()); });
    act(() => { vi.advanceTimersByTime(500); });

    // Click should be suppressed
    const mockClickEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() } as unknown as React.MouseEvent;
    act(() => { result.current.onClickCapture(mockClickEvent); });

    expect(mockClickEvent.stopPropagation).toHaveBeenCalled();
    expect(mockClickEvent.preventDefault).toHaveBeenCalled();
  });

  it('does not suppress click when no long press occurred', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress));

    const mockClickEvent = { stopPropagation: vi.fn(), preventDefault: vi.fn() } as unknown as React.MouseEvent;
    act(() => { result.current.onClickCapture(mockClickEvent); });

    expect(mockClickEvent.stopPropagation).not.toHaveBeenCalled();
    expect(mockClickEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('respects custom delay', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress, 200));

    act(() => { result.current.onMouseDown(makeMockMouseEvent()); });
    act(() => { vi.advanceTimersByTime(199); });
    expect(onLongPress).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(onLongPress).toHaveBeenCalled();
  });
});
