import { describe, expect, test } from 'vitest';
import { dailySeed, rng } from '../../core/seed';

describe('dailySeed', () => {
  const day = new Date(Date.UTC(2026, 8, 27, 10));
  test('same lab + same UTC day gives the same seed', () => {
    expect(dailySeed('06', day)).toBe(dailySeed('06', new Date(Date.UTC(2026, 8, 27, 23, 59))));
  });
  test('different lab or day gives a different seed', () => {
    expect(dailySeed('06', day)).not.toBe(dailySeed('07', day));
    expect(dailySeed('06', day)).not.toBe(dailySeed('06', new Date(Date.UTC(2026, 8, 28, 0, 1))));
  });
  test('is an unsigned 32-bit integer', () => {
    const s = dailySeed('01', day);
    expect(Number.isInteger(s)).toBe(true);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThan(2 ** 32);
  });
});

describe('rng', () => {
  test('is deterministic and in [0, 1)', () => {
    const a = rng(42), b = rng(42);
    for (let i = 0; i < 1000; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
  test('a generator keeps its own sequence after the day changes (seed fixed at creation)', () => {
    const r = rng(dailySeed('06', new Date(Date.UTC(2026, 8, 27, 23, 59))));
    const first = r();
    expect(rng(dailySeed('06', new Date(Date.UTC(2026, 8, 27, 12))))()).toBe(first);
  });
});
