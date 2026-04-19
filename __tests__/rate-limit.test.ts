import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, getClientIp } from '../lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows requests within the limit', () => {
    const key = `test-allow-${Date.now()}`;
    const result = rateLimit(key, { maxRequests: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('blocks after exceeding maxRequests', () => {
    const key = `test-block-${Date.now()}`;
    rateLimit(key, { maxRequests: 2, windowMs: 60_000 });
    rateLimit(key, { maxRequests: 2, windowMs: 60_000 });
    const result = rateLimit(key, { maxRequests: 2, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after the window expires', () => {
    const key = `test-reset-${Date.now()}`;
    rateLimit(key, { maxRequests: 1, windowMs: 1000 });
    const blocked = rateLimit(key, { maxRequests: 1, windowMs: 1000 });
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    const after = rateLimit(key, { maxRequests: 1, windowMs: 1000 });
    expect(after.allowed).toBe(true);
  });

  it('tracks remaining count correctly', () => {
    const key = `test-remaining-${Date.now()}`;
    const r1 = rateLimit(key, { maxRequests: 5, windowMs: 60_000 });
    expect(r1.remaining).toBe(4);
    const r2 = rateLimit(key, { maxRequests: 5, windowMs: 60_000 });
    expect(r2.remaining).toBe(3);
  });
});

describe('getClientIp', () => {
  it('prefers x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const headers = new Headers({ 'x-real-ip': '9.9.9.9' });
    expect(getClientIp(headers)).toBe('9.9.9.9');
  });

  it('returns "unknown" when no IP headers present', () => {
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});
