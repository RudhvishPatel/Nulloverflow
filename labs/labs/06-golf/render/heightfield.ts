// Sample a surface onto a grid with a log-compressed height in [0, 1], shared by both renderers.
import { floorOf, type Surface, type Vec2 } from '../sim/surfaces';

export interface Heightfield {
  n: number;
  /** n×n heights in [0, 1], row-major, row 0 = yMin. */
  h: Float32Array;
  /** Map a domain point to its normalised height (same transform as the grid). */
  heightAt(p: Vec2): number;
}

export function sampleHeightfield(s: Surface, n: number): Heightfield {
  const [x0, x1, y0, y1] = s.bounds;
  const floor = floorOf(s);
  const raw = (x: number, y: number) => Math.log1p(Math.max(0, s.f(x, y) - floor));
  const h = new Float32Array(n * n);
  let max = 0;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const v = raw(x0 + ((x1 - x0) * i) / (n - 1), y0 + ((y1 - y0) * j) / (n - 1));
      h[j * n + i] = v;
      if (v > max) max = v;
    }
  }
  const scale = max > 0 ? 1 / max : 1;
  for (let k = 0; k < h.length; k++) h[k] = h[k]! * scale;
  return { n, h, heightAt: ([x, y]) => Math.min(1, raw(x, y) * scale) };
}
