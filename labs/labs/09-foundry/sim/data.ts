// Six classic 2-D toy datasets in [-1, 1]², binary labels.
import type { Net } from './net';

export interface Split { x: number[][]; y: number[] }
export const DATASETS = {
  // par = smallest parameter count measured to reach ≥ 95 % test accuracy (tanh, Adam, 4000 steps).
  moons: { name: 'Two moons', par: 17, arch: [2, 4, 1] },
  circles: { name: 'Circles', par: 13, arch: [2, 3, 1] },
  xor: { name: 'XOR', par: 13, arch: [2, 3, 1] },
  gaussians: { name: 'Gaussians', par: 3, arch: [2, 1] },
  spiral: { name: 'Spiral', par: 105, arch: [2, 8, 8, 1] },
  checker: { name: 'Checkerboard', par: 105, arch: [2, 8, 8, 1] },
} as const;
export type DatasetId = keyof typeof DATASETS;

export function makeDataset(id: DatasetId, rand: () => number, n: number, noise: number): { train: Split; test: Split } {
  const g = () => Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-12))) * Math.cos(2 * Math.PI * rand());
  const point = (): [number[], number] => {
    const label = rand() < 0.5 ? 0 : 1;
    let x = 0, y = 0;
    switch (id) {
      case 'moons': { const t = Math.PI * rand(); x = label ? 1 - Math.cos(t) - 0.5 : Math.cos(t) - 0.5; y = label ? 0.35 - Math.sin(t) * 0.8 : Math.sin(t) * 0.8 - 0.35; x *= 0.62; break; }
      case 'circles': { const r = label ? 0.35 * Math.sqrt(rand()) : 0.62 + 0.3 * rand(); const a = 2 * Math.PI * rand(); x = r * Math.cos(a); y = r * Math.sin(a); break; }
      case 'xor': { x = rand() * 2 - 1; y = rand() * 2 - 1; const pad = 0.08; if (Math.abs(x) < pad) x += Math.sign(x || 1) * pad; if (Math.abs(y) < pad) y += Math.sign(y || 1) * pad; return [[x + noise * g(), y + noise * g()], x * y > 0 ? 1 : 0]; }
      case 'gaussians': { x = (label ? 0.4 : -0.4) + 0.25 * g(); y = (label ? 0.35 : -0.35) + 0.25 * g(); break; }
      case 'spiral': { const t = rand() * 3.2 + 0.3; const r = t / 3.6; const a = t * 2.2 + label * Math.PI; x = r * Math.cos(a); y = r * Math.sin(a); break; }
      case 'checker': { x = rand() * 2 - 1; y = rand() * 2 - 1; const cx = Math.floor((x + 1) * 1.5), cy = Math.floor((y + 1) * 1.5); return [[x, y], (cx + cy) % 2]; }
    }
    return [[Math.max(-1.2, Math.min(1.2, x + noise * g())), Math.max(-1.2, Math.min(1.2, y + noise * g()))], label];
  };
  const split = (count: number): Split => {
    const x: number[][] = [], y: number[] = [];
    for (let i = 0; i < count; i++) { const [p, l] = point(); x.push(p); y.push(l); }
    return { x, y };
  };
  return { train: split(n), test: split(Math.round(n / 2)) };
}

export function accuracy(net: Net, s: Split): number {
  let ok = 0;
  s.x.forEach((p, i) => { if ((net.predict(p) >= 0.5 ? 1 : 0) === s.y[i]) ok++; });
  return ok / s.x.length;
}
