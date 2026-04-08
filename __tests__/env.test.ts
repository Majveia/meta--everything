import { describe, it, expect, beforeEach, vi } from 'vitest';
import { _resetEnvCache } from '../lib/env';

// Reset module-level cache before each test
beforeEach(() => {
  _resetEnvCache();
  vi.unstubAllEnvs();
});

describe('validateEnv', () => {
  it('reports all platforms unconfigured when no env vars set', async () => {
    const { validateEnv } = await import('../lib/env');
    const report = validateEnv();
    expect(report.youtube).toBe(false);
    expect(report.twitch).toBe(false);
    expect(report.x).toBe(false);
    expect(report.substack).toBe(false);
    expect(report.kick).toBe(false);
    expect(report.warnings).toHaveLength(0);
  });

  it('marks youtube configured when key is present', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'AIzaSyAbcdefghijklmnopqrstuvwxyz1234567');
    const { validateEnv } = await import('../lib/env');
    const report = validateEnv();
    expect(report.youtube).toBe(true);
    expect(report.warnings).toHaveLength(0);
  });

  it('warns when youtube key is suspiciously short', async () => {
    vi.stubEnv('YOUTUBE_API_KEY', 'short');
    const { validateEnv } = await import('../lib/env');
    const report = validateEnv();
    expect(report.warnings.some((w) => w.includes('YOUTUBE_API_KEY'))).toBe(true);
  });

  it('warns when twitch client id is set without token', async () => {
    vi.stubEnv('TWITCH_CLIENT_ID', 'abc123');
    const { validateEnv } = await import('../lib/env');
    const report = validateEnv();
    expect(report.twitch).toBe(false);
    expect(report.warnings.some((w) => w.includes('TWITCH_ACCESS_TOKEN'))).toBe(true);
  });

  it('marks twitch configured when both vars are present', async () => {
    vi.stubEnv('TWITCH_CLIENT_ID', 'clientid');
    vi.stubEnv('TWITCH_ACCESS_TOKEN', 'tokenvalue');
    const { validateEnv } = await import('../lib/env');
    const report = validateEnv();
    expect(report.twitch).toBe(true);
    expect(report.warnings).toHaveLength(0);
  });

  it('warns when X token is set but accounts are missing', async () => {
    vi.stubEnv('X_API_BEARER_TOKEN', 'AAAA...');
    const { validateEnv } = await import('../lib/env');
    const report = validateEnv();
    expect(report.x).toBe(false);
    expect(report.warnings.some((w) => w.includes('X_ACCOUNTS'))).toBe(true);
  });

  it('caches result on repeated calls', async () => {
    vi.stubEnv('KICK_CHANNELS', 'shroud,xqc');
    const { validateEnv } = await import('../lib/env');
    const r1 = validateEnv();
    const r2 = validateEnv();
    expect(r1).toBe(r2); // same object reference = cached
  });
});
