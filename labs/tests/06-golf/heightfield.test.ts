import { expect, test } from 'vitest';
import { sampleHeightfield } from '../../labs/06-golf/render/heightfield';
import { SURFACES } from '../../labs/06-golf/sim/surfaces';

test.each(SURFACES.map((s) => [s.id, s] as const))('%s: heights span [0, 1] and the cup sits at 0', (_id, s) => {
  const hf = sampleHeightfield(s, 64);
  let min = Infinity, max = -Infinity;
  for (const v of hf.h) { min = Math.min(min, v); max = Math.max(max, v); expect(Number.isFinite(v)).toBe(true); }
  expect(max).toBeCloseTo(1, 6);
  expect(min).toBeGreaterThanOrEqual(0);
  expect(hf.heightAt(s.minima[0]!)).toBeCloseTo(0, 6);
});
