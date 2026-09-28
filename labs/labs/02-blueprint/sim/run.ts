// A daily run of 8 estimation questions answered with 90 % confidence intervals.
// Everything is in log10 space: a ruler of 7 decades per question.
import { rng, shuffle } from '../../../core/seed';
import { FACTS, type Fact } from './facts';

export const QUESTIONS = 8;
export const ALPHA = 0.1;          // 90 % intervals
const RULER = 7;                    // decades shown on the ruler

export interface Question { fact: Fact; lo: number; hi: number }
export interface Answer { low: number; high: number; truth: number; hit: boolean; width: number; score: number; points: number }

/** Interval score (Gneiting & Raftery 2007) in log10 space: width + (2/α)·distance outside. Lower is better. */
export function intervalScore(low: number, high: number, truth: number): number {
  const l = Math.min(low, high), u = Math.max(low, high);
  return (u - l) + (2 / ALPHA) * Math.max(0, l - truth) + (2 / ALPHA) * Math.max(0, truth - u);
}

/** Map an interval score to 0–100 points. */
export function points(score: number): number {
  return Math.round(100 * Math.exp(-score / 2));
}

export type Verdict = 'overconfident' | 'calibrated' | 'underconfident';

export function calibration(rows: { hit: boolean; width: number }[]): { hitRate: number; meanWidth: number; verdict: Verdict } {
  const hitRate = rows.filter((r) => r.hit).length / rows.length;
  const meanWidth = rows.reduce((a, r) => a + r.width, 0) / rows.length;
  const verdict: Verdict = hitRate <= 0.625 ? 'overconfident' : hitRate === 1 && meanWidth >= 2 ? 'underconfident' : 'calibrated';
  return { hitRate, meanWidth, verdict };
}

export function dealRun(seed: number): Question[] {
  const rand = rng(seed);
  return shuffle(FACTS, rand).slice(0, QUESTIONS).map((fact) => {
    const t = Math.log10(fact.value);
    // The truth sits somewhere in the middle 3 decades, never at the exact centre.
    const offset = (rand() - 0.5) * 3;
    const lo = t - RULER / 2 + offset;
    return { fact, lo, hi: lo + RULER };
  });
}

export class Run {
  readonly questions: Question[];
  readonly answers: Answer[] = [];
  index = 0;

  constructor(seed: number) { this.questions = dealRun(seed); }

  get question(): Question { return this.questions[this.index]!; }
  get answered(): boolean { return this.answers.length > this.index; }
  get finished(): boolean { return this.answers.length === QUESTIONS; }
  get total(): number { return this.answers.reduce((a, r) => a + r.points, 0); }
  get calibration() { return calibration(this.answers); }

  answer(low: number, high: number): Answer {
    if (this.answered) throw new Error('already answered');
    const l = Math.min(low, high), u = Math.max(low, high);
    const truth = Math.log10(this.question.fact.value);
    const score = intervalScore(l, u, truth);
    const a = { low: l, high: u, truth, hit: truth >= l && truth <= u, width: u - l, score, points: points(score) };
    this.answers.push(a);
    return a;
  }

  next(): void {
    if (!this.answered || this.index >= QUESTIONS - 1) throw new Error('no next question');
    this.index++;
  }
}

/** Format 10^d in the fact's unit: "≈ 8,850 m", "≈ 5.97 × 10²⁴ kg". */
export function valueLabel(d: number, unit: string): string {
  const v = 10 ** d;
  const sup = (n: number) => String(n).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]!);
  let txt: string;
  if (v >= 1e6 || v < 1e-2) { const e = Math.floor(d); txt = `${(v / 10 ** e).toFixed(2)} × 10${sup(e)}`; }
  else txt = Number(v.toPrecision(3)).toLocaleString('en-GB');
  return `${txt} ${unit}`;
}
