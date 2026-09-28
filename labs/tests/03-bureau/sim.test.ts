import { describe, expect, test } from 'vitest';
import { auc, confusion, rocPoints, prCurve, kappa, shipScore, dealCase, ITEMS_PER_CASE, RUBRIC_ITEMS } from '../../labs/03-bureau/sim/metrics';
import { BANK } from '../../labs/03-bureau/sim/bank';

const fix = [
  { score: 0.9, label: true }, { score: 0.4, label: true },
  { score: 0.6, label: false }, { score: 0.1, label: false },
];

describe('metrics', () => {
  test('AUC is the probability a positive outranks a negative (0.75 fixture)', () => {
    expect(auc(fix)).toBeCloseTo(0.75, 12);
  });
  test('confusion counts at a threshold (score ≥ t is PASS)', () => {
    expect(confusion(fix, 0.5)).toEqual({ tp: 1, fp: 1, fn: 1, tn: 1 });
    expect(confusion(fix, 0)).toEqual({ tp: 2, fp: 2, fn: 0, tn: 0 });
  });
  test('ROC runs from (0,0) to (1,1) and is monotone', () => {
    const pts = rocPoints(fix);
    expect(pts[0]).toEqual({ fpr: 0, tpr: 0, t: Infinity });
    expect(pts.at(-1)).toMatchObject({ fpr: 1, tpr: 1 });
    for (let i = 1; i < pts.length; i++) { expect(pts[i]!.fpr).toBeGreaterThanOrEqual(pts[i - 1]!.fpr); expect(pts[i]!.tpr).toBeGreaterThanOrEqual(pts[i - 1]!.tpr); }
  });
  test('PR curve precision is defined at every recall step', () => {
    for (const p of prCurve(fix)) { expect(p.precision).toBeGreaterThanOrEqual(0); expect(p.precision).toBeLessThanOrEqual(1); }
  });
  test("Cohen's κ: 1 for identical raters, 0 at chance", () => {
    expect(kappa([true, false, true, true], [true, false, true, true])).toBe(1);
    expect(kappa([true, true, false, false], [true, false, true, false])).toBeCloseTo(0, 12);
  });
  test('shipScore rewards recall only when the precision spec is met', () => {
    expect(shipScore({ tp: 9, fp: 1, fn: 1, tn: 9 }, { minPrecision: 0.9 })).toBe(90);
    expect(shipScore({ tp: 9, fp: 3, fn: 1, tn: 7 }, { minPrecision: 0.9 })).toBe(0);
  });
});

describe('bank + case', () => {
  test('the bank has ≥ 36 items, both labels, and ≥ 10 borderline items', () => {
    expect(BANK.length).toBeGreaterThanOrEqual(36);
    expect(BANK.some((b) => b.label) && BANK.some((b) => !b.label)).toBe(true);
    expect(BANK.filter((b) => b.borderline).length).toBeGreaterThanOrEqual(10);
  });
  test('dealCase is deterministic with scores in [0,1] and a separable-but-imperfect AUC', () => {
    const a = dealCase(11), b = dealCase(11);
    expect(a.items.map((i) => i.item.id)).toEqual(b.items.map((i) => i.item.id));
    expect(a.items).toHaveLength(ITEMS_PER_CASE);
    expect(a.rubric).toHaveLength(RUBRIC_ITEMS);
    for (const s of a.items) { expect(s.score).toBeGreaterThanOrEqual(0); expect(s.score).toBeLessThanOrEqual(1); }
    for (let seed = 1; seed <= 30; seed++) {
      const c = dealCase(seed);
      const value = auc(c.items.map((s) => ({ score: s.score, label: s.item.label })));
      expect(value, `seed ${seed}`).toBeGreaterThanOrEqual(0.75);
      expect(value, `seed ${seed}`).toBeLessThanOrEqual(0.93);
    }
  });
});
