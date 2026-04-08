import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useRef } from 'react';

function createContainer(): HTMLDivElement {
  const container = document.createElement('div');
  const btn1 = document.createElement('button');
  btn1.textContent = 'First';
  const btn2 = document.createElement('button');
  btn2.textContent = 'Middle';
  const btn3 = document.createElement('button');
  btn3.textContent = 'Last';
  container.appendChild(btn1);
  container.appendChild(btn2);
  container.appendChild(btn3);
  document.body.appendChild(container);
  return container;
}

function dispatchTab(target: HTMLElement, shiftKey = false) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe('useFocusTrap', () => {
  it('wraps Tab from last element to first', () => {
    const container = createContainer();
    const buttons = container.querySelectorAll('button');
    const lastButton = buttons[buttons.length - 1] as HTMLElement;
    const firstButton = buttons[0] as HTMLElement;

    // Focus the last button
    lastButton.focus();
    Object.defineProperty(document, 'activeElement', { value: lastButton, writable: true, configurable: true });

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(container);
      useFocusTrap(ref, true);
      return ref;
    });

    const focusSpy = vi.spyOn(firstButton, 'focus');
    dispatchTab(container);

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
    document.body.removeChild(container);
  });

  it('wraps Shift+Tab from first element to last', () => {
    const container = createContainer();
    const buttons = container.querySelectorAll('button');
    const firstButton = buttons[0] as HTMLElement;
    const lastButton = buttons[buttons.length - 1] as HTMLElement;

    firstButton.focus();
    Object.defineProperty(document, 'activeElement', { value: firstButton, writable: true, configurable: true });

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(container);
      useFocusTrap(ref, true);
      return ref;
    });

    const focusSpy = vi.spyOn(lastButton, 'focus');
    dispatchTab(container, true);

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
    document.body.removeChild(container);
  });

  it('does not trap focus when not active', () => {
    const container = createContainer();
    const buttons = container.querySelectorAll('button');
    const lastButton = buttons[buttons.length - 1] as HTMLElement;
    const firstButton = buttons[0] as HTMLElement;

    lastButton.focus();
    Object.defineProperty(document, 'activeElement', { value: lastButton, writable: true, configurable: true });

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(container);
      useFocusTrap(ref, false); // inactive
      return ref;
    });

    const focusSpy = vi.spyOn(firstButton, 'focus');
    dispatchTab(container);

    expect(focusSpy).not.toHaveBeenCalled();
    focusSpy.mockRestore();
    document.body.removeChild(container);
  });

  it('handles container with no focusable elements', () => {
    const container = document.createElement('div');
    container.textContent = 'No buttons here';
    document.body.appendChild(container);

    // Should not throw
    expect(() => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(container);
        useFocusTrap(ref, true);
        return ref;
      });
      dispatchTab(container);
    }).not.toThrow();

    document.body.removeChild(container);
  });

  it('cleans up keydown listener on unmount', () => {
    const container = createContainer();
    const removeSpy = vi.spyOn(container, 'removeEventListener');

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(container);
      useFocusTrap(ref, true);
      return ref;
    });

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
    document.body.removeChild(container);
  });
});
