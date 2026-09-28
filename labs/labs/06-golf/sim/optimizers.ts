// The clubs: five real optimisers, stepped on a Surface. Pure functions, no DOM.
import type { Surface, Vec2 } from './surfaces';

export type Club = 'sgd' | 'momentum' | 'nesterov' | 'rmsprop' | 'adam';
export const CLUB_IDS: Club[] = ['sgd', 'momentum', 'nesterov', 'rmsprop', 'adam'];

export interface Params {
  lr: number;
  /** Momentum / Nesterov coefficient. */
  beta?: number;
  /** Adam first / second moment decay. */
  beta1?: number;
  beta2?: number;
  /** RMSProp decay. */
  rho?: number;
}

export type Schedule = 'const' | 'step' | 'cos';

export interface ShotOptions {
  /** Clip the gradient norm to this value. */
  clip?: number;
  schedule?: Schedule;
  /** Std-dev of Gaussian gradient noise (mini-batch SGD). Requires `rand`. */
  noise?: number;
  rand?: () => number;
}

export interface Shot {
  /** Positions from the start (inclusive), one per step, stopping before any divergence. */
  path: Vec2[];
  diverged: boolean;
}

const EPS = 1e-8;

export function scheduledLr(lr: number, schedule: Schedule, t: number, steps: number): number {
  if (schedule === 'step') return lr * 0.5 ** Math.floor((3 * t) / steps);
  if (schedule === 'cos') return lr * 0.5 * (1 + Math.cos((Math.PI * t) / steps));
  return lr;
}

function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/** Run `steps` optimiser steps from `start`. Leaving the widened bounds or any non-finite value ends the shot as diverged. */
export function shoot(surface: Surface, start: Vec2, club: Club, params: Params, steps: number, opts: ShotOptions = {}): Shot {
  const { clip, schedule = 'const', noise = 0, rand } = opts;
  if (noise > 0 && !rand) throw new Error('noise needs a seeded rand()');
  const beta = params.beta ?? 0.9, b1 = params.beta1 ?? 0.9, b2 = params.beta2 ?? 0.999, rho = params.rho ?? 0.9;
  const [x0, x1, y0, y1] = surface.bounds;
  const padX = (x1 - x0) * 0.5, padY = (y1 - y0) * 0.5;
  const inField = (x: number, y: number) => x >= x0 - padX && x <= x1 + padX && y >= y0 - padY && y <= y1 + padY;

  const gradAt = (x: number, y: number): Vec2 => {
    let [gx, gy] = surface.grad(x, y);
    if (noise > 0) { gx += noise * gaussian(rand!); gy += noise * gaussian(rand!); }
    if (clip !== undefined) {
      const n = Math.hypot(gx, gy);
      if (n > clip) { gx *= clip / n; gy *= clip / n; }
    }
    return [gx, gy];
  };

  let [x, y] = start;
  let vx = 0, vy = 0, sx = 0, sy = 0; // velocity (momentum) / first moment (adam)
  let qx = 0, qy = 0;                 // squared-gradient averages (rmsprop / adam)
  const path: Vec2[] = [[x, y]];

  for (let t = 0; t < steps; t++) {
    const lr = scheduledLr(params.lr, schedule, t, steps);
    let nx: number, ny: number;
    switch (club) {
      case 'sgd': {
        const [gx, gy] = gradAt(x, y);
        nx = x - lr * gx; ny = y - lr * gy;
        break;
      }
      case 'momentum': {
        const [gx, gy] = gradAt(x, y);
        vx = beta * vx - lr * gx; vy = beta * vy - lr * gy;
        nx = x + vx; ny = y + vy;
        break;
      }
      case 'nesterov': {
        const [gx, gy] = gradAt(x + beta * vx, y + beta * vy);
        vx = beta * vx - lr * gx; vy = beta * vy - lr * gy;
        nx = x + vx; ny = y + vy;
        break;
      }
      case 'rmsprop': {
        const [gx, gy] = gradAt(x, y);
        qx = rho * qx + (1 - rho) * gx * gx; qy = rho * qy + (1 - rho) * gy * gy;
        nx = x - (lr * gx) / (Math.sqrt(qx) + EPS); ny = y - (lr * gy) / (Math.sqrt(qy) + EPS);
        break;
      }
      case 'adam': {
        const [gx, gy] = gradAt(x, y);
        sx = b1 * sx + (1 - b1) * gx; sy = b1 * sy + (1 - b1) * gy;
        qx = b2 * qx + (1 - b2) * gx * gx; qy = b2 * qy + (1 - b2) * gy * gy;
        const c1 = 1 - b1 ** (t + 1), c2 = 1 - b2 ** (t + 1);
        nx = x - (lr * (sx / c1)) / (Math.sqrt(qx / c2) + EPS);
        ny = y - (lr * (sy / c1)) / (Math.sqrt(qy / c2) + EPS);
        break;
      }
    }
    if (!Number.isFinite(nx) || !Number.isFinite(ny) || !inField(nx, ny) || !Number.isFinite(surface.f(nx, ny))) {
      return { path, diverged: true };
    }
    x = nx; y = ny;
    path.push([x, y]);
  }
  return { path, diverged: false };
}
