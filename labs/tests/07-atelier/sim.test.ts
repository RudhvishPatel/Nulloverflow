import { describe, expect, test } from 'vitest';
import { fit, predict, mse, kfold, cvError, bootstrapFan, makeData, legendre, type ModelSpec } from '../../labs/07-atelier/sim/models';
import { rng } from '../../core/seed';

const line = { x: [-1, -0.5, 0, 0.5, 1], y: [-2, -1, 0, 1, 2] };

describe('polynomial ridge (Legendre basis, unpenalised intercept)', () => {
  test('degree 1, λ = 0 recovers an exact line', () => {
    const m = fit(line, { family: 'poly', degree: 1, lambda: 0 });
    expect(predict(m, [0.25])[0]).toBeCloseTo(0.5, 8);
    expect(mse(m, line)).toBeLessThan(1e-12);
  });
  test('matches the normal-equation solution on a small fixture', () => {
    const d = { x: [-1, -0.2, 0.3, 0.9], y: [1, 0.2, 0.4, 1.5] };
    const m = fit(d, { family: 'poly', degree: 2, lambda: 0 });
    // Exact least-squares quadratic through these points.
    const expected = [0.8194, 0.2065, 1.2558]; // numpy.polyfit(deg=2) evaluated at x = -0.9, 0, 0.8
    predict(m, [-0.9, 0, 0.8]).forEach((v, i) => expect(v).toBeCloseTo(expected[i]!, 3));
  });
  test('λ → ∞ gives a flat fit at the mean', () => {
    const m = fit(line, { family: 'poly', degree: 5, lambda: 1e12 });
    for (const v of predict(m, [-1, 0, 1])) expect(v).toBeCloseTo(0, 6);
  });
  test('past interpolation (degree ≥ n − 1) the training error is ~0 (min-norm fit)', () => {
    const d = makeData(rng(5), 'wave', 12, 0.15);
    const m = fit(d.train, { family: 'poly', degree: 30, lambda: 0 });
    expect(mse(m, d.train)).toBeLessThan(1e-6);
  });
  test('Legendre P2(x) = (3x² − 1)/2', () => {
    expect(legendre(0.5, 2)[2]).toBeCloseTo((3 * 0.25 - 1) / 2, 12);
  });
});

describe('kNN and tree', () => {
  test('kNN with k = n predicts the mean everywhere', () => {
    const m = fit(line, { family: 'knn', k: 5 });
    for (const v of predict(m, [-0.9, 0.3])) expect(v).toBeCloseTo(0, 12);
  });
  test('a depth-1 tree finds the step', () => {
    const d = { x: [-1, -0.6, -0.2, 0.2, 0.6, 1], y: [0, 0, 0, 5, 5, 5] };
    const m = fit(d, { family: 'tree', depth: 1 });
    expect(predict(m, [-0.5, 0.5])).toEqual([0, 5]);
  });
});

describe('validation', () => {
  test('k-fold splits partition the indices', () => {
    const folds = kfold(23, 5, rng(1));
    const all = folds.flat().sort((a, b) => a - b);
    expect(all).toEqual(Array.from({ length: 23 }, (_, i) => i));
    expect(folds).toHaveLength(5);
  });
  test('CV prefers a sensible degree over a wild one on smooth data', () => {
    const d = makeData(rng(2), 'wave', 40, 0.15);
    const spec = (degree: number): ModelSpec => ({ family: 'poly', degree, lambda: 0 });
    expect(cvError(d.train, spec(5), rng(3))).toBeLessThan(cvError(d.train, spec(1), rng(3)));
  });
  test('bootstrap fans are deterministic per seed', () => {
    const d = makeData(rng(4), 'step', 30, 0.1);
    const a = bootstrapFan(d.train, { family: 'knn', k: 3 }, rng(9), 20, [0, 0.5]);
    const b = bootstrapFan(d.train, { family: 'knn', k: 3 }, rng(9), 20, [0, 0.5]);
    expect(a).toEqual(b);
    expect(a).toHaveLength(20);
  });
});

import { lockScore, bestTestError, BASE_N } from '../../labs/07-atelier/sim/round';
describe('round scoring', () => {
  test('matching the best model scores 100; twice the error scores 50; extra data costs a point per sample', () => {
    expect(lockScore(0.1, 0.1, BASE_N)).toBe(100);
    expect(lockScore(0.2, 0.1, BASE_N)).toBe(50);
    expect(lockScore(0.1, 0.1, BASE_N + 8)).toBe(92);
    expect(lockScore(10, 0.1, BASE_N + 40)).toBe(0);
  });
  test('bestTestError searches all three families and beats a bad fixed model', () => {
    const d = makeData(rng(8), 'bump', 30, 0.1);
    const best = bestTestError(d);
    expect(best.error).toBeLessThan(mse(fit(d.train, { family: 'poly', degree: 1, lambda: 0 }), d.test));
    expect(['poly', 'knn', 'tree']).toContain(best.spec.family);
  });
});
