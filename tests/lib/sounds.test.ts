import { describe, it, expect } from 'vitest';
import { playLike, playBookmark, playShare, playTab } from '@/lib/sounds';

describe('sound functions', () => {
  it('playLike does not throw', () => {
    expect(() => playLike()).not.toThrow();
  });

  it('playBookmark does not throw', () => {
    expect(() => playBookmark()).not.toThrow();
  });

  it('playShare does not throw', () => {
    expect(() => playShare()).not.toThrow();
  });

  it('playTab does not throw', () => {
    expect(() => playTab()).not.toThrow();
  });
});
