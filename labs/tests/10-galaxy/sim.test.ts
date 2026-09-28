// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadGalaxy, nearest, analogy, oddOneOut, dealPuzzles } from '../../labs/10-cosmos/sim/space';

const g = loadGalaxy(JSON.parse(readFileSync('../assets/lab/10/data/galaxy.json', 'utf8')));
const fx = JSON.parse(readFileSync('tests/10-galaxy/fixtures.json', 'utf8')) as { queries: string[]; neighbours: string[][] };

describe('galaxy data', () => {
  test('8000 words with 50-d unit vectors and 3-D coords', () => {
    expect(g.words).toHaveLength(8000);
    expect(g.coords).toHaveLength(8000 * 3);
    const i = g.index.get('king')!;
    let n = 0; for (let k = 0; k < 50; k++) n += g.vectors[i * 50 + k]! ** 2;
    expect(n).toBeCloseTo(1, 4);
  });
  test('cosine kNN matches the Python reference top-5 on 20 queries', () => {
    fx.queries.forEach((q, i) => expect(nearest(g, q, 5).map((r) => r.word)).toEqual(fx.neighbours[i]));
  });
  test('king − man + woman ranks queen in the top 3', () => {
    expect(analogy(g, 'king', 'man', 'woman', 3).map((r) => r.word)).toContain('queen');
  });
  test('every shipped odd-one-out set resolves to its answer', () => {
    for (const o of g.odd) expect(oddOneOut(g, o.words)).toBe(o.answer);
  });
  test('dealPuzzles: 5 per day (3 analogies + 2 odd-one-out), deterministic, with 6 options each including the answer', () => {
    const a = dealPuzzles(g, 17), b = dealPuzzles(g, 17);
    expect(a.map((p) => p.prompt)).toEqual(b.map((p) => p.prompt));
    expect(a.filter((p) => p.kind === 'analogy')).toHaveLength(3);
    expect(a.filter((p) => p.kind === 'odd')).toHaveLength(2);
    for (const p of a) { expect(p.options).toContain(p.answer); expect(new Set(p.options).size).toBe(p.options.length); }
  });
});
