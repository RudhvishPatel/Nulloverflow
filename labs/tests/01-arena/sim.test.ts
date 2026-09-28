import { describe, expect, test } from 'vitest';
import { CATALOGUE } from '../../labs/01-arena/sim/catalogue';
import { dealDeck, roundScore, Match, BOSS_ROUNDS } from '../../labs/01-arena/sim/match';

describe('catalogue', () => {
  test('has at least 120 distinct objects with positive sizes spanning proton to universe', () => {
    expect(CATALOGUE.length).toBeGreaterThanOrEqual(120);
    expect(new Set(CATALOGUE.map((o) => o.name)).size).toBe(CATALOGUE.length);
    for (const o of CATALOGUE) expect(o.metres).toBeGreaterThan(0);
    const logs = CATALOGUE.map((o) => Math.log10(o.metres));
    expect(Math.min(...logs)).toBeLessThan(-14);
    expect(Math.max(...logs)).toBeGreaterThan(26);
  });
});

describe('dealDeck', () => {
  test('is deterministic: 10 pairs of distinct, clearly different objects', () => {
    const a = dealDeck(99), b = dealDeck(99);
    expect(a.map((p) => p.a.name + p.b.name)).toEqual(b.map((p) => p.a.name + p.b.name));
    expect(a).toHaveLength(10);
    for (const p of a) {
      expect(p.a.name).not.toBe(p.b.name);
      expect(Math.abs(p.decades)).toBeGreaterThanOrEqual(0.3);
    }
  });
  test(`boss rounds ${BOSS_ROUNDS.join(' and ')} span at least 10 orders of magnitude`, () => {
    for (let seed = 1; seed <= 30; seed++) {
      const deck = dealDeck(seed);
      for (const r of BOSS_ROUNDS) expect(Math.abs(deck[r - 1]!.decades)).toBeGreaterThanOrEqual(10);
    }
  });
  test('decades is log10(B / A), signed', () => {
    const p = dealDeck(5)[0]!;
    expect(p.decades).toBeCloseTo(Math.log10(p.b.metres / p.a.metres), 10);
  });
});

describe('roundScore', () => {
  test('is 100 for an exact guess and ~37 one decade off, either direction', () => {
    expect(roundScore(3.2, 3.2)).toBe(100);
    expect(roundScore(2.2, 3.2)).toBeCloseTo(36.79, 1);
    expect(roundScore(4.2, 3.2)).toBeCloseTo(36.79, 1);
  });
  test('picking the wrong side is punished by the distance through zero', () => {
    expect(roundScore(-3, 3)).toBeLessThan(1);
  });
});

describe('Match', () => {
  test('streak grows on good bets, resets on bad ones, and multiplies points (capped at 2×)', () => {
    const m = new Match(7);
    const r1 = m.bet(m.pair.decades); // perfect
    expect(r1.score).toBe(100);
    expect(m.streak).toBe(1);
    expect(r1.points).toBe(100);
    m.next();
    const r2 = m.bet(m.pair.decades);
    expect(r2.points).toBe(110);
    m.next();
    m.bet(m.pair.decades + 5);   // way off
    expect(m.streak).toBe(0);
  });
  test('ends after 10 rounds with a total', () => {
    const m = new Match(7);
    for (let i = 0; i < 10; i++) { m.bet(0); if (i < 9) m.next(); }
    expect(m.finished).toBe(true);
    expect(m.total).toBe(m.results.reduce((a, r) => a + r.points, 0));
    expect(() => m.next()).toThrow();
  });
});

import { ratioLabel, sizeLabel } from '../../labs/01-arena/sim/match';
describe('labels', () => {
  test('sizeLabel picks a readable unit', () => {
    expect(sizeLabel(93)).toBe('≈ 93 m');
    expect(sizeLabel(1.7e-15)).toBe('≈ 1.7 fm');
    expect(sizeLabel(0.0427)).toBe('≈ 4.27 cm');
    expect(sizeLabel(8849)).toBe('≈ 8.85 km');
    expect(sizeLabel(9.5e20)).toBe('≈ 1.0 × 10^5 ly');
  });
  test('ratioLabel shows plain numbers below 1000× and scientific above', () => {
    expect(ratioLabel(Math.log10(3.5))).toBe('3.5×');
    expect(ratioLabel(-Math.log10(20))).toBe('20×');
    expect(ratioLabel(4.5)).toBe('3.2 × 10⁴×');
  });
});
