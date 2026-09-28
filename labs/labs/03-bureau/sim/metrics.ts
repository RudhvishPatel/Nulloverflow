// Threshold metrics (confusion, ROC, PR, AUC), inter-rater κ, and dealing the daily case.
import { rng, shuffle } from '../../../core/seed';
import { BANK, type Item } from './bank';

export interface Scored { score: number; label: boolean }
export interface Confusion { tp: number; fp: number; fn: number; tn: number }

export function confusion(rows: Scored[], t: number): Confusion {
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const r of rows) {
    const pass = r.score >= t;
    if (pass && r.label) c.tp++; else if (pass) c.fp++; else if (r.label) c.fn++; else c.tn++;
  }
  return c;
}

export const precision = (c: Confusion) => (c.tp + c.fp ? c.tp / (c.tp + c.fp) : 1);
export const recall = (c: Confusion) => (c.tp + c.fn ? c.tp / (c.tp + c.fn) : 0);
export const f1 = (c: Confusion) => { const p = precision(c), r = recall(c); return p + r ? (2 * p * r) / (p + r) : 0; };

/** ROC points for every distinct threshold, from "nothing passes" to "everything passes". */
export function rocPoints(rows: Scored[]): { fpr: number; tpr: number; t: number }[] {
  const P = rows.filter((r) => r.label).length, N = rows.length - P;
  const ts = [...new Set(rows.map((r) => r.score))].sort((a, b) => b - a);
  const pts = [{ fpr: 0, tpr: 0, t: Infinity }];
  for (const t of ts) {
    const c = confusion(rows, t);
    pts.push({ fpr: N ? c.fp / N : 0, tpr: P ? c.tp / P : 0, t });
  }
  return pts;
}

export function prCurve(rows: Scored[]): { recall: number; precision: number; t: number }[] {
  const ts = [...new Set(rows.map((r) => r.score))].sort((a, b) => b - a);
  return ts.map((t) => { const c = confusion(rows, t); return { recall: recall(c), precision: precision(c), t }; });
}

/** AUC as the probability a random positive outscores a random negative (ties count half). */
export function auc(rows: Scored[]): number {
  const pos = rows.filter((r) => r.label), neg = rows.filter((r) => !r.label);
  let s = 0;
  for (const p of pos) for (const n of neg) s += p.score > n.score ? 1 : p.score === n.score ? 0.5 : 0;
  return pos.length && neg.length ? s / (pos.length * neg.length) : 0.5;
}

/** Cohen's κ for two raters on binary verdicts. */
export function kappa(a: boolean[], b: boolean[]): number {
  const n = a.length;
  const po = a.filter((v, i) => v === b[i]).length / n;
  const pa = a.filter(Boolean).length / n, pb = b.filter(Boolean).length / n;
  const pe = pa * pb + (1 - pa) * (1 - pb);
  return pe === 1 ? 1 : (po - pe) / (1 - pe);
}

export interface Spec { minPrecision: number }

/** Ship spec: recall × 100 if precision meets the bar, otherwise 0. */
export function shipScore(c: Confusion, spec: Spec): number {
  return precision(c) >= spec.minPrecision - 1e-9 ? Math.round(recall(c) * 100) : 0;
}

export const ITEMS_PER_CASE = 24;
export const RUBRIC_ITEMS = 8;

export interface Case { items: { item: Item; score: number }[]; rubric: Item[]; spec: Spec }

/** Deal the day's case: 24 items with model confidence scores, 8 borderline rubric items, a precision spec. */
export function dealCase(seed: number): Case {
  const rand = rng(seed);
  const normal = shuffle(BANK.filter((b) => !b.borderline), rand);
  const border = shuffle(BANK.filter((b) => b.borderline), rand);
  const pool = [...normal, ...border].slice(0, ITEMS_PER_CASE);
  // Confidence: passes tend high, fails tend low, with overlap so no threshold is perfect.
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-9))) * Math.cos(2 * Math.PI * rand());
  const order = shuffle(pool, rand);
  const draw = () => order.map((item) => {
    const mean = item.label ? 0.64 : 0.4;
    const spread = item.borderline ? 0.2 : 0.17;
    return { item, score: Math.round(Math.min(0.99, Math.max(0.01, mean + spread * gauss())) * 100) / 100 };
  });
  // Re-draw (deterministically) until the day is separable but imperfect: AUC in [0.75, 0.93].
  let items = draw();
  for (let k = 0; k < 60; k++) {
    const a = auc(items.map((s) => ({ score: s.score, label: s.item.label })));
    if (a >= 0.75 && a <= 0.93) break;
    items = draw();
  }
  const specs = [0.8, 0.85, 0.9];
  return { items, rubric: border.slice(0, RUBRIC_ITEMS), spec: { minPrecision: specs[Math.floor(rand() * specs.length)]! } };
}
