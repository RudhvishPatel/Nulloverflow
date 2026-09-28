import { describe, expect, test } from 'vitest';
import { SURFACES, surfaceById } from '../../labs/06-golf/sim/surfaces';
import { shoot, CLUB_IDS } from '../../labs/06-golf/sim/optimizers';
import { dealCourse, ghostFor, holeResult, isHoled } from '../../labs/06-golf/sim/course';
import { rng } from '../../core/seed';

describe('surfaces', () => {
  test('there are 12 with unique ids', () => {
    expect(SURFACES).toHaveLength(12);
    expect(new Set(SURFACES.map((s) => s.id)).size).toBe(12);
  });

  test.each(SURFACES.map((s) => [s.id, s] as const))('%s: analytic gradient matches central differences', (_id, s) => {
    const r = rng(7);
    const [x0, x1, y0, y1] = s.bounds;
    for (let i = 0; i < 50; i++) {
      const x = x0 + (x1 - x0) * r(), y = y0 + (y1 - y0) * r();
      const h = 1e-5;
      const nx = (s.f(x + h, y) - s.f(x - h, y)) / (2 * h);
      const ny = (s.f(x, y + h) - s.f(x, y - h)) / (2 * h);
      const [gx, gy] = s.grad(x, y);
      const scale = Math.max(1, Math.abs(nx), Math.abs(ny));
      expect(Math.abs(gx - nx) / scale).toBeLessThan(1e-3);
      expect(Math.abs(gy - ny) / scale).toBeLessThan(1e-3);
    }
  });

  test.each(SURFACES.map((s) => [s.id, s] as const))('%s: listed minima are stationary and inside bounds', (_id, s) => {
    for (const [x, y] of s.minima) {
      const [gx, gy] = s.grad(x, y);
      expect(Math.hypot(gx, gy)).toBeLessThan(2e-2);
      expect(x).toBeGreaterThanOrEqual(s.bounds[0]);
      expect(x).toBeLessThanOrEqual(s.bounds[1]);
      expect(y).toBeGreaterThanOrEqual(s.bounds[2]);
      expect(y).toBeLessThanOrEqual(s.bounds[3]);
    }
  });
});

describe('optimisers', () => {
  const bowl = surfaceById('bowl');

  test('SGD on x²+y² with lr 0.1 contracts by exactly 0.8 per step', () => {
    const { path } = shoot(bowl, [2, -1], 'sgd', { lr: 0.1 }, 5);
    expect(path).toHaveLength(6);
    for (let i = 1; i < path.length; i++) {
      expect(path[i]![0]).toBeCloseTo(path[i - 1]![0] * 0.8, 12);
      expect(path[i]![1]).toBeCloseTo(path[i - 1]![1] * 0.8, 12);
    }
  });

  test('momentum with β = 0 equals SGD', () => {
    const a = shoot(bowl, [1.5, 2], 'momentum', { lr: 0.05, beta: 0 }, 20).path;
    const b = shoot(bowl, [1.5, 2], 'sgd', { lr: 0.05 }, 20).path;
    a.forEach((p, i) => { expect(p[0]).toBeCloseTo(b[i]![0], 12); expect(p[1]).toBeCloseTo(b[i]![1], 12); });
  });

  test("Adam's first step is lr · sign(g) (bias-corrected)", () => {
    const { path } = shoot(bowl, [2, -1], 'adam', { lr: 0.3, beta1: 0.9, beta2: 0.999 }, 1);
    expect(path[1]![0]).toBeCloseTo(2 - 0.3, 6);
    expect(path[1]![1]).toBeCloseTo(-1 + 0.3, 6);
  });

  test('Nesterov evaluates the gradient at the look-ahead point', () => {
    // Step 1 has v = 0, so it equals SGD; step 2 differs from plain momentum.
    const n = shoot(bowl, [2, 0], 'nesterov', { lr: 0.1, beta: 0.9 }, 2).path;
    const m = shoot(bowl, [2, 0], 'momentum', { lr: 0.1, beta: 0.9 }, 2).path;
    expect(n[1]![0]).toBeCloseTo(m[1]![0], 12);
    expect(n[2]![0]).not.toBeCloseTo(m[2]![0], 6);
  });

  test('every club converges on the bowl with sane settings', () => {
    for (const club of ['sgd', 'momentum', 'nesterov', 'rmsprop', 'adam'] as const) {
      const { path, diverged } = shoot(bowl, [2, 2], club, { lr: 0.05 }, 400);
      const [x, y] = path.at(-1)!;
      expect(diverged, club).toBe(false);
      expect(Math.hypot(x, y), club).toBeLessThan(0.05);
    }
  });

  test('an ordinary learning rate on the cliff is flung off the course without clipping, and stays finite with it', () => {
    const cliff = surfaceById('cliff');
    const wild = shoot(cliff, [3, 1.5], 'sgd', { lr: 0.5 }, 60);
    expect(wild.diverged).toBe(true);
    const tame = shoot(cliff, [3, 1.5], 'sgd', { lr: 0.5 }, 60, { clip: 1 });
    expect(tame.diverged).toBe(false);
  });

  test('a path never contains non-finite points (divergence stops the shot instead)', () => {
    for (const s of SURFACES) {
      const { path } = shoot(s, [s.bounds[1] * 0.9, s.bounds[3] * 0.9], 'sgd', { lr: 50 }, 100);
      for (const [x, y] of path) { expect(Number.isFinite(x)).toBe(true); expect(Number.isFinite(y)).toBe(true); }
    }
  });

  test('schedules shrink the effective step: cosine ends near zero', () => {
    const ramp = surfaceById('ravine');
    const c = shoot(ramp, [3, 1], 'sgd', { lr: 0.02 }, 50, { schedule: 'cos' }).path;
    const last = Math.hypot(c.at(-1)![0] - c.at(-2)![0], c.at(-1)![1] - c.at(-2)![1]);
    const first = Math.hypot(c[1]![0] - c[0]![0], c[1]![1] - c[0]![1]);
    expect(last).toBeLessThan(first * 0.05);
  });

  test('noise is only drawn from the supplied generator (deterministic per seed)', () => {
    const s = surfaceById('plateau');
    const a = shoot(s, [4, 4], 'adam', { lr: 0.2 }, 30, { noise: 0.5, rand: rng(3) }).path;
    const b = shoot(s, [4, 4], 'adam', { lr: 0.2 }, 30, { noise: 0.5, rand: rng(3) }).path;
    expect(a).toEqual(b);
  });
});

describe('course', () => {
  test('dealCourse is deterministic: 6 distinct holes, easy → hard, tees inside bounds', () => {
    const a = dealCourse(12345), b = dealCourse(12345);
    expect(a.map((h) => h.surface.id)).toEqual(b.map((h) => h.surface.id));
    expect(a).toHaveLength(6);
    expect(new Set(a.map((h) => h.surface.id)).size).toBe(6);
    const tiers = a.map((h) => h.tier);
    expect(tiers).toEqual([...tiers].sort());
    for (const h of a) {
      const [x0, x1, y0, y1] = h.surface.bounds;
      expect(h.tee[0]).toBeGreaterThanOrEqual(x0); expect(h.tee[0]).toBeLessThanOrEqual(x1);
      expect(h.tee[1]).toBeGreaterThanOrEqual(y0); expect(h.tee[1]).toBeLessThanOrEqual(y1);
      expect(h.surface.minima.some(([mx, my]) => mx === h.cup[0] && my === h.cup[1])).toBe(true);
      expect(h.par).toBeGreaterThanOrEqual(2);
    }
  });

  test('different seeds give different courses', () => {
    const ids = new Set([1, 2, 3, 4, 5].map((s) => dealCourse(s).map((h) => h.surface.id).join()));
    expect(ids.size).toBeGreaterThan(1);
  });

  test('holeResult names strokes relative to par', () => {
    expect(holeResult(1, 3)).toBe('eagle');
    expect(holeResult(2, 3)).toBe('birdie');
    expect(holeResult(3, 3)).toBe('par');
    expect(holeResult(4, 3)).toBe('bogey');
    expect(holeResult(6, 3)).toBe('double+');
  });

  test('isHoled checks the final point against the cup radius', () => {
    const h = dealCourse(1)[0]!;
    expect(isHoled(h, h.cup)).toBe(true);
    expect(isHoled(h, [h.cup[0] + h.cupRadius * 2, h.cup[1]])).toBe(false);
  });
});

describe('playability', () => {
  test('every hole on 20 daily courses can be holed at par by the best tuned club', () => {
    const failures: string[] = [];
    for (let seed = 1; seed <= 20; seed++) {
      for (const hole of dealCourse(seed * 7919)) {
        let pos = hole.tee, holed = false;
        for (let stroke = 1; stroke <= hole.par && !holed; stroke++) {
          const all = CLUB_IDS.map((c) => ghostFor(hole, pos, c, seed + stroke));
          const best = all.find((g) => g.holed) ?? all.reduce((a, b) => (dist(a, hole) < dist(b, hole) ? a : b));
          pos = best.path.at(-1)!;
          holed = best.holed;
        }
        if (!holed) failures.push(`${hole.surface.id}@seed${seed}`);
      }
    }
    expect(failures).toEqual([]);
  });
});

function dist(g: { path: [number, number][] }, h: { cup: [number, number] }) {
  const [x, y] = g.path.at(-1)!;
  return Math.hypot(x - h.cup[0], y - h.cup[1]);
}

describe('difficulty', () => {
  test('default Driver settings rarely hole in one, overall and on any single hole (tuning has to matter)', () => {
    let aces = 0, total = 0;
    const perHole: Record<string, [number, number]> = {};
    for (let seed = 1; seed <= 60; seed++) {
      for (const hole of dealCourse(seed * 7919)) {
        total++;
        const shot = shoot(hole.surface, hole.tee, 'adam', { lr: 0.1, beta1: 0.9, beta2: 0.999 }, hole.steps, {
          clip: hole.unlocks.clip ? 5 : undefined, schedule: hole.unlocks.schedule ? 'cos' : 'const', noise: hole.noise, rand: rng(seed),
        });
        if (!shot.diverged && isHoled(hole, shot.path.at(-1)!)) { aces++; (perHole[hole.surface.id] ??= [0, 0])[0]++; }
        (perHole[hole.surface.id] ??= [0, 0])[1]++;
      }
    }
    expect(aces / total).toBeLessThanOrEqual(0.25);
    const easy = Object.entries(perHole).filter(([, [a, t]]) => a / t > 0.4).map(([id, [a, t]]) => `${id} ${Math.round((100 * a) / t)}%`);
    expect(easy, 'holes aced by default settings more than 40% of the time').toEqual([]);
  });
});
