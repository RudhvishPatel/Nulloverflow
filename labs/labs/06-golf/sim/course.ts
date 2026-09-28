// Dealing the daily 6-hole round and scoring it.
import { rng, shuffle } from '../../../core/seed';
import { surfaceById, type Surface, type Vec2 } from './surfaces';
import { shoot, CLUB_IDS, type Club, type Params } from './optimizers';

export type Tier = 1 | 2 | 3;

export interface Hole {
  number: number;
  surface: Surface;
  tier: Tier;
  tee: Vec2;
  cup: Vec2;
  cupRadius: number;
  par: number;
  /** Optimiser steps per stroke. */
  steps: number;
  /** Gradient noise std-dev (mini-batch). */
  noise: number;
  unlocks: { clip: boolean; schedule: boolean };
}

interface Template {
  id: string;
  tier: Tier;
  /** One tee per entry of cupIndex (the tee sits in that cup's basin), or a single shared tee. */
  tee: Vec2 | Vec2[];
  /** Which listed minimum holds the cup (index into surface.minima). */
  cupIndex: number[];
  par: number;
  steps: number;
  noise?: number;
  clip?: boolean;
  schedule?: boolean;
}

// Hand-placed tees: each one makes its surface's lesson happen.
const TEMPLATES: Template[] = [
  { id: 'bowl', tier: 1, tee: [2.4, -2.1], cupIndex: [0], par: 2, steps: 40 },
  { id: 'booth', tier: 1, tee: [-7, -6], cupIndex: [0], par: 2, steps: 60 },
  { id: 'ravine', tier: 1, tee: [-3.5, 1.6], cupIndex: [0], par: 3, steps: 28 },
  { id: 'twin', tier: 1, tee: [-3.2, 2.2], cupIndex: [0], par: 3, steps: 80 },
  { id: 'saddle', tier: 2, tee: [[2.5, 0.06], [2.5, -0.06]], cupIndex: [0, 1], par: 3, steps: 26 },
  { id: 'himmelblau', tier: 2, tee: [[0.8, 4.2], [-0.6, 4.6], [-1.2, -4.6], [1.2, -4.4]], cupIndex: [0, 1, 2, 3], par: 3, steps: 30 },
  { id: 'camel', tier: 2, tee: [[1.6, -1.6], [-1.6, 1.6]], cupIndex: [0, 1], par: 3, steps: 100 },
  { id: 'beale', tier: 2, tee: [1, 1.4], cupIndex: [0], par: 4, steps: 150, schedule: true },
  { id: 'rosenbrock', tier: 3, tee: [-1.5, 2.5], cupIndex: [0], par: 4, steps: 150, schedule: true },
  { id: 'rastrigin', tier: 3, tee: [2.3, -2.4], cupIndex: [0], par: 4, steps: 120, schedule: true },
  { id: 'plateau', tier: 3, tee: [5, 4.5], cupIndex: [0], par: 4, steps: 120, noise: 0.08, schedule: true },
  { id: 'cliff', tier: 3, tee: [3, 1.5], cupIndex: [0], par: 3, steps: 80, clip: true },
];

export function dealCourse(seed: number): Hole[] {
  const rand = rng(seed);
  const pick = (tier: Tier) => shuffle(TEMPLATES.filter((t) => t.tier === tier), rand).slice(0, 2);
  const chosen = [...pick(1), ...pick(2), ...pick(3)];
  return chosen.map((t, i) => {
    const surface = surfaceById(t.id);
    const k = Math.floor(rand() * t.cupIndex.length);
    const cup = surface.minima[t.cupIndex[k]!]!;
    const perCup = Array.isArray(t.tee[0]);
    const baseTee = (perCup ? (t.tee as Vec2[])[k] : t.tee) as Vec2;
    const [x0, x1, y0, y1] = surface.bounds;
    const span = Math.max(x1 - x0, y1 - y0);
    // Small seeded jitter so the same surface plays differently on different days;
    // tiny for basin-specific tees so the tee never crosses into another cup's basin.
    const amount = perCup ? 0.005 : 0.04;
    const jitter = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v + (rand() - 0.5) * span * amount));
    return {
      number: i + 1,
      surface,
      tier: t.tier,
      tee: [jitter(baseTee[0], x0, x1), jitter(baseTee[1], y0, y1)] as Vec2,
      cup,
      cupRadius: span * 0.025,
      par: t.par,
      steps: t.steps,
      noise: t.noise ?? 0,
      unlocks: { clip: !!t.clip, schedule: !!t.schedule },
    };
  });
}

export function isHoled(hole: Hole, p: Vec2): boolean {
  return Math.hypot(p[0] - hole.cup[0], p[1] - hole.cup[1]) <= hole.cupRadius;
}

export type HoleResult = 'eagle' | 'birdie' | 'par' | 'bogey' | 'double+';

export function holeResult(strokes: number, par: number): HoleResult {
  const d = strokes - par;
  return d <= -2 ? 'eagle' : d === -1 ? 'birdie' : d === 0 ? 'par' : d === 1 ? 'bogey' : 'double+';
}

export interface Ghost { club: Club; params: Params; path: Vec2[]; holed: boolean }

/** Tuned rival for one club: best learning rate on a log grid, judged by distance to the cup. */
export function ghostFor(hole: Hole, from: Vec2, club: Club, seed: number): Ghost {
  let best: Ghost | null = null;
  let bestD = Infinity;
  for (let k = 0; k < 14; k++) {
    const lr = 10 ** (-3 + (k * 3.3) / 13);
    const params: Params = { lr };
    const shot = shoot(hole.surface, from, club, params, hole.steps, {
      clip: hole.unlocks.clip ? 5 : undefined,
      schedule: hole.unlocks.schedule ? 'cos' : 'const',
      noise: hole.noise,
      rand: rng(seed + k),
    });
    if (shot.diverged) continue;
    const end = shot.path.at(-1)!;
    const d = Math.hypot(end[0] - hole.cup[0], end[1] - hole.cup[1]);
    if (d < bestD) { bestD = d; best = { club, params, path: shot.path, holed: isHoled(hole, end) }; }
  }
  return best ?? { club, params: { lr: 0.001 }, path: [from], holed: false };
}

export function ghosts(hole: Hole, from: Vec2, except: Club, seed: number): Ghost[] {
  return CLUB_IDS.filter((c) => c !== except).map((c, i) => ghostFor(hole, from, c, seed + i * 101));
}
