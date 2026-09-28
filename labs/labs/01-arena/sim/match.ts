// The daily 10-pair bout: ratio bets on a log scale, streak multipliers, boss rounds.
import { rng } from '../../../core/seed';
import { CATALOGUE, type Thing } from './catalogue';

export const ROUNDS = 10;
/** 1-based rounds whose pair spans at least 10 orders of magnitude. */
export const BOSS_ROUNDS = [5, 10];

export interface Pair {
  a: Thing;
  b: Thing;
  /** log10(b / a): positive when B is bigger. */
  decades: number;
  boss: boolean;
}

export interface BetResult { guess: number; truth: number; score: number; points: number; streak: number; multiplier: number }

const decadesOf = (a: Thing, b: Thing) => Math.log10(b.metres / a.metres);

export function dealDeck(seed: number): Pair[] {
  const rand = rng(seed);
  const pick = () => CATALOGUE[Math.floor(rand() * CATALOGUE.length)]!;
  const used = new Set<string>();
  const deck: Pair[] = [];
  for (let round = 1; round <= ROUNDS; round++) {
    const boss = BOSS_ROUNDS.includes(round);
    for (let tries = 0; ; tries++) {
      const a = pick(), b = pick();
      const d = decadesOf(a, b);
      const ok = a !== b && !used.has(a.name) && !used.has(b.name)
        && (boss ? Math.abs(d) >= 10 : Math.abs(d) >= 0.3 && Math.abs(d) <= 9);
      if (ok || tries > 5000) {
        used.add(a.name); used.add(b.name);
        deck.push({ a, b, decades: d, boss });
        break;
      }
    }
  }
  return deck;
}

/** 100 · e^(−|guess − truth|), both in signed decades. */
export function roundScore(guess: number, truth: number): number {
  return Math.round(100 * Math.exp(-Math.abs(guess - truth)) * 100) / 100;
}

export class Match {
  readonly deck: Pair[];
  readonly results: BetResult[] = [];
  index = 0;
  streak = 0;

  constructor(seed: number) { this.deck = dealDeck(seed); }

  get pair(): Pair { return this.deck[this.index]!; }
  get finished(): boolean { return this.results.length === ROUNDS; }
  get total(): number { return this.results.reduce((a, r) => a + r.points, 0); }
  get answered(): boolean { return this.results.length > this.index; }

  bet(guess: number): BetResult {
    if (this.answered) throw new Error('round already answered');
    const truth = this.pair.decades;
    const score = roundScore(guess, truth);
    const multiplier = Math.min(2, 1 + 0.1 * this.streak);
    const points = Math.round(score * multiplier);
    this.streak = score >= 60 ? this.streak + 1 : 0;
    const r = { guess, truth, score, points, streak: this.streak, multiplier };
    this.results.push(r);
    return r;
  }

  next(): void {
    if (!this.answered || this.index >= ROUNDS - 1) throw new Error('no next round');
    this.index++;
  }
}

/** "3.2 × 10⁴" style label for a ratio of 10^decades. */
export function ratioLabel(decades: number): string {
  const d = Math.abs(decades);
  if (d < 3) return `${Number((10 ** d).toPrecision(2))}×`;
  const e = Math.floor(d), m = 10 ** (d - e);
  const sup = String(e).replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]!);
  return `${m.toFixed(1)} × 10${sup}×`;
}

/** Human size with a sensible unit: "≈ 93 m", "≈ 1.7 fm", "≈ 2.5 ly". */
export function sizeLabel(m: number): string {
  const units: [number, string][] = [[9.461e15, 'ly'], [1.496e11, 'AU'], [1e3, 'km'], [1, 'm'], [1e-2, 'cm'], [1e-3, 'mm'], [1e-6, 'µm'], [1e-9, 'nm'], [1e-12, 'pm'], [1e-15, 'fm']];
  const [f, u] = units.find(([f]) => m >= f) ?? units.at(-1)!;
  const v = m / f;
  const txt = v >= 1e4 ? v.toExponential(1).replace('e+', ' × 10^') : Number(v.toPrecision(3)).toString();
  return `≈ ${txt} ${u}`;
}
