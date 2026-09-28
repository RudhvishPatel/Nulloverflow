// Models for the atelier: polynomial ridge on a Legendre basis (well conditioned on [-1, 1]),
// k-nearest neighbours and a greedy regression tree, plus k-fold CV and bootstrap fans.
import { shuffle } from '../../../core/seed';

export interface Data { x: number[]; y: number[] }
export type ModelSpec =
  | { family: 'poly'; degree: number; lambda: number }
  | { family: 'knn'; k: number }
  | { family: 'tree'; depth: number };

interface TreeNode { split?: number; left?: TreeNode; right?: TreeNode; value: number }
export type Model =
  | { family: 'poly'; w: number[]; degree: number }
  | { family: 'knn'; k: number; data: Data }
  | { family: 'tree'; root: TreeNode };

/** P0..Pn at x via the Bonnet recurrence. */
export function legendre(x: number, n: number): number[] {
  const p = [1, x];
  for (let k = 1; k < n; k++) p.push(((2 * k + 1) * x * p[k]! - k * p[k - 1]!) / (k + 1));
  return p.slice(0, n + 1);
}

/** Solve A·x = b by Gaussian elimination with partial pivoting (A is modified). */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r]![c]!) > Math.abs(A[piv]![c]!)) piv = r;
    [A[c], A[piv]] = [A[piv]!, A[c]!];
    [b[c], b[piv]] = [b[piv]!, b[c]!];
    const d = A[c]![c]! || 1e-300;
    for (let r = c + 1; r < n; r++) {
      const f = A[r]![c]! / d;
      if (!f) continue;
      for (let k = c; k < n; k++) A[r]![k]! -= f * A[c]![k]!;
      b[r]! -= f * b[c]!;
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r]!;
    for (let k = r + 1; k < n; k++) s -= A[r]![k]! * x[k]!;
    x[r] = s / (A[r]![r]! || 1e-300);
  }
  return x;
}

function fitPoly(d: Data, degree: number, lambda: number): Model {
  const X = d.x.map((x) => legendre(x, degree));
  const n = X.length, p = degree + 1;
  if (p <= n) {
    // Primal ridge; the intercept (P0) is not penalised.
    const A = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => X.reduce((s, row) => s + row[i]! * row[j]!, 0) + (i === j ? (i === 0 ? 1e-12 : lambda + 1e-12) : 0)));
    const b = Array.from({ length: p }, (_, i) => X.reduce((s, row, r) => s + row[i]! * d.y[r]!, 0));
    return { family: 'poly', degree, w: solve(A, b) };
  }
  // Over-parameterised: minimum-norm (ridge-in-the-limit) solution via the dual.
  const K = X.map((a) => X.map((b2) => a.reduce((s, v, k) => s + v * b2[k]!, 0)));
  K.forEach((row, i) => (row[i]! += lambda + 1e-10));
  const alpha = solve(K, [...d.y]);
  const w = Array.from({ length: p }, (_, k) => X.reduce((s, row, i) => s + row[k]! * alpha[i]!, 0));
  return { family: 'poly', degree, w };
}

function grow(xs: number[], ys: number[], depth: number): TreeNode {
  const mean = ys.reduce((a, b) => a + b, 0) / (ys.length || 1);
  if (depth === 0 || xs.length < 2) return { value: mean };
  const idx = xs.map((_, i) => i).sort((a, b) => xs[a]! - xs[b]!);
  let best = { sse: Infinity, at: -1 };
  for (let s = 1; s < idx.length; s++) {
    if (xs[idx[s]!] === xs[idx[s - 1]!]) continue;
    const l = idx.slice(0, s).map((i) => ys[i]!), r = idx.slice(s).map((i) => ys[i]!);
    const sse = (v: number[]) => { const m = v.reduce((a, b) => a + b, 0) / v.length; return v.reduce((a, b) => a + (b - m) ** 2, 0); };
    const total = sse(l) + sse(r);
    if (total < best.sse - 1e-12) best = { sse: total, at: s };
  }
  if (best.at < 0) return { value: mean };
  const split = (xs[idx[best.at - 1]!]! + xs[idx[best.at]!]!) / 2;
  const L = idx.slice(0, best.at), R = idx.slice(best.at);
  return { value: mean, split, left: grow(L.map((i) => xs[i]!), L.map((i) => ys[i]!), depth - 1), right: grow(R.map((i) => xs[i]!), R.map((i) => ys[i]!), depth - 1) };
}

export function fit(d: Data, spec: ModelSpec): Model {
  if (spec.family === 'poly') return fitPoly(d, spec.degree, spec.lambda);
  if (spec.family === 'knn') return { family: 'knn', k: Math.max(1, Math.min(spec.k, d.x.length)), data: d };
  return { family: 'tree', root: grow(d.x, d.y, spec.depth) };
}

export function predict(m: Model, xs: number[]): number[] {
  if (m.family === 'poly') return xs.map((x) => legendre(x, m.degree).reduce((s, v, k) => s + v * m.w[k]!, 0));
  if (m.family === 'knn') {
    return xs.map((x) => {
      const near = m.data.x.map((xi, i) => ({ d: Math.abs(xi - x), y: m.data.y[i]! })).sort((a, b) => a.d - b.d).slice(0, m.k);
      return near.reduce((s, v) => s + v.y, 0) / near.length;
    });
  }
  return xs.map((x) => { let n = m.root; while (n.split !== undefined) n = x <= n.split ? n.left! : n.right!; return n.value; });
}

export function mse(m: Model, d: Data): number {
  const p = predict(m, d.x);
  return p.reduce((s, v, i) => s + (v - d.y[i]!) ** 2, 0) / d.x.length;
}

export function kfold(n: number, k: number, rand: () => number): number[][] {
  const idx = shuffle(Array.from({ length: n }, (_, i) => i), rand);
  return Array.from({ length: k }, (_, f) => idx.filter((_, i) => i % k === f));
}

export function cvError(d: Data, spec: ModelSpec, rand: () => number, k = 5): number {
  const folds = kfold(d.x.length, k, rand);
  let total = 0;
  for (const f of folds) {
    const hold = new Set(f);
    const tr = { x: d.x.filter((_, i) => !hold.has(i)), y: d.y.filter((_, i) => !hold.has(i)) };
    const va = { x: f.map((i) => d.x[i]!), y: f.map((i) => d.y[i]!) };
    total += mse(fit(tr, spec), va);
  }
  return total / folds.length;
}

/** B bootstrap refits, each predicted on `grid`. */
export function bootstrapFan(d: Data, spec: ModelSpec, rand: () => number, B: number, grid: number[]): number[][] {
  return Array.from({ length: B }, () => {
    const idx = d.x.map(() => Math.floor(rand() * d.x.length));
    return predict(fit({ x: idx.map((i) => d.x[i]!), y: idx.map((i) => d.y[i]!) }, spec), grid);
  });
}

// ---- Data --------------------------------------------------------------------------------
export type Shape = 'wave' | 'step' | 'cubic' | 'bump';
export const SHAPES: Record<Shape, { name: string; f: (x: number) => number }> = {
  wave: { name: 'gentle wave', f: (x) => Math.sin(1.6 * Math.PI * x) * 0.8 },
  step: { name: 'soft step', f: (x) => Math.tanh(6 * x) * 0.8 },
  cubic: { name: 'cubic swing', f: (x) => 1.6 * x ** 3 - 0.9 * x },
  bump: { name: 'narrow bump', f: (x) => 1.4 * Math.exp(-10 * x * x) - 0.5 },
};

export function makeData(rand: () => number, shape: Shape, nTrain: number, noise: number): { train: Data; val: Data; test: Data; f: (x: number) => number } {
  const f = SHAPES[shape].f;
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-12))) * Math.cos(2 * Math.PI * rand());
  const sample = (n: number): Data => {
    const x = Array.from({ length: n }, () => rand() * 2 - 1);
    return { x, y: x.map((v) => f(v) + noise * gauss()) };
  };
  return { train: sample(nTrain), val: sample(20), test: sample(300), f };
}
