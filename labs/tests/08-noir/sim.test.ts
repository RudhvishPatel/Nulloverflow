import { describe, expect, test } from 'vitest';
import { softmax, CASES, HEADS, attention, dealCases, qkWeights } from '../../labs/08-noir/sim/attention';

describe('softmax', () => {
  test('rows sum to 1 and temperature → 0 approaches argmax', () => {
    const s = softmax([1, 3, 2], 1);
    expect(s.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    const cold = softmax([1, 3, 2], 0.01);
    expect(cold[1]).toBeGreaterThan(0.999);
  });
});

describe('cases', () => {
  test('there are 10 Winograd-style cases, each with a pronoun and two candidate antecedents', () => {
    expect(CASES).toHaveLength(10);
    for (const c of CASES) {
      expect(c.candidates).toHaveLength(2);
      expect(c.candidates).toContain(c.answer);
      expect(c.pronoun).toBeGreaterThan(Math.max(...c.candidates));
      expect(c.tokens[c.pronoun]!.toLowerCase()).toMatch(/^(it|they|she|he)$/);
    }
  });
  test('dealCases picks 5 distinct cases deterministically', () => {
    expect(dealCases(3).map((c) => c.id)).toEqual(dealCases(3).map((c) => c.id));
    expect(new Set(dealCases(3).map((c) => c.id)).size).toBe(5);
  });
});

describe('heads', () => {
  test('3 layers × 4 heads, every attention row sums to 1', () => {
    expect(HEADS).toHaveLength(12);
    for (const c of CASES) for (const h of HEADS) for (const row of attention(c, h)) expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });
  test('the coreference head resolves every pronoun correctly', () => {
    const coref = HEADS.find((h) => h.role === 'coreference')!;
    for (const c of CASES) {
      const row = attention(c, coref)[c.pronoun]!;
      const best = c.candidates.reduce((a, b) => (row[a]! >= row[b]! ? a : b));
      expect(best, c.text).toBe(c.answer);
    }
  });
  test('the shallow nearest-noun head gets at least 4 of 10 wrong (heads disagree)', () => {
    const near = HEADS.find((h) => h.role === 'nearest-noun')!;
    const wrong = CASES.filter((c) => {
      const row = attention(c, near)[c.pronoun]!;
      return c.candidates.reduce((a, b) => (row[a]! >= row[b]! ? a : b)) !== c.answer;
    }).length;
    expect(wrong).toBeGreaterThanOrEqual(4);
  });
  test('the previous-token head attends mostly to i − 1', () => {
    const prev = HEADS.find((h) => h.role === 'previous-token')!;
    const c = CASES[0]!;
    const rows = attention(c, prev);
    for (let i = 1; i < c.tokens.length; i++) expect(rows[i]!.indexOf(Math.max(...rows[i]!))).toBe(i - 1);
  });
});

describe('Q·K workbench', () => {
  test('weights follow scaled dot products and sum to 1', () => {
    const w = qkWeights([1, 0], [[1, 0], [0, 1], [-1, 0]], 1);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(w[0]).toBeGreaterThan(w[1]!);
    expect(w[1]).toBeGreaterThan(w[2]!);
  });
});
