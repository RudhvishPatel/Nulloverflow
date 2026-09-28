import { describe, expect, test } from 'vitest';
import { FACTS } from '../../labs/02-blueprint/sim/facts';
import { intervalScore, points, calibration, Run, dealRun, QUESTIONS } from '../../labs/02-blueprint/sim/run';

describe('facts', () => {
  test('at least 40 positive facts with units and sources of variety', () => {
    expect(FACTS.length).toBeGreaterThanOrEqual(40);
    for (const f of FACTS) { expect(f.value).toBeGreaterThan(0); expect(f.unit.length).toBeGreaterThan(0); }
    expect(new Set(FACTS.map((f) => f.category)).size).toBeGreaterThanOrEqual(4);
  });
});

describe('intervalScore (log10 space, α = 0.1)', () => {
  test('a hit costs only its width', () => {
    expect(intervalScore(1, 2, 1.5)).toBeCloseTo(1, 12);
  });
  test('a miss adds 2/α × the distance outside', () => {
    expect(intervalScore(1, 2, 2.5)).toBeCloseTo(1 + 20 * 0.5, 12);
    expect(intervalScore(1, 2, 0.8)).toBeCloseTo(1 + 20 * 0.2, 12);
  });
  test('reversed bounds are normalised', () => {
    expect(intervalScore(2, 1, 1.5)).toBeCloseTo(1, 12);
  });
});

describe('points', () => {
  test('narrow hits beat wide hits; misses score low', () => {
    expect(points(0.2)).toBeGreaterThan(points(1));
    expect(points(1)).toBeGreaterThan(points(10));
    expect(points(0)).toBe(100);
  });
});

describe('calibration', () => {
  test('8 hits of 8 with wide intervals is underconfident, 4 of 8 is overconfident, 7 of 8 is calibrated', () => {
    const mk = (hits: number, width: number) => Array.from({ length: 8 }, (_, i) => ({ hit: i < hits, width }));
    expect(calibration(mk(8, 2.5)).verdict).toBe('underconfident');
    expect(calibration(mk(4, 0.4)).verdict).toBe('overconfident');
    expect(calibration(mk(7, 0.8)).verdict).toBe('calibrated');
    expect(calibration(mk(4, 0.4)).hitRate).toBe(0.5);
  });
});

describe('Run', () => {
  test('deals 8 distinct facts deterministically with a ruler that contains the truth', () => {
    const a = dealRun(3), b = dealRun(3);
    expect(a.map((q) => q.fact.label)).toEqual(b.map((q) => q.fact.label));
    expect(a).toHaveLength(QUESTIONS);
    expect(new Set(a.map((q) => q.fact.label)).size).toBe(QUESTIONS);
    for (const q of a) {
      const t = Math.log10(q.fact.value);
      expect(t).toBeGreaterThan(q.lo);
      expect(t).toBeLessThan(q.hi);
      expect(q.hi - q.lo).toBeCloseTo(7, 6);
    }
  });
  test('answering records hit/width/points and ends after 8', () => {
    const r = new Run(3);
    for (let i = 0; i < QUESTIONS; i++) {
      const t = Math.log10(r.question.fact.value);
      const res = r.answer(t - 0.25, t + 0.25);
      expect(res.hit).toBe(true);
      expect(res.width).toBeCloseTo(0.5, 12);
      if (i < QUESTIONS - 1) r.next();
    }
    expect(r.finished).toBe(true);
    expect(r.calibration.verdict).toBe('calibrated'); // all hits, but narrow: not underconfident
  });
});
