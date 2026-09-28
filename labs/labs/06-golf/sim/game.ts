// One daily round: strokes, water hazards, pick-ups and the scorecard. No DOM.
import { rng } from '../../../core/seed';
import { dealCourse, ghosts, holeResult, isHoled, type Ghost, type Hole, type HoleResult } from './course';
import { shoot, type Club, type Params, type Schedule, type Shot } from './optimizers';
import type { Vec2 } from './surfaces';

/** Strokes over par at which the ball is picked up, so a round stays 3–5 minutes. */
export const MAX_OVER_PAR = 4;

export interface CardEntry { hole: number; par: number; strokes: number; result: HoleResult; pickedUp: boolean; clubs: Club[] }

export interface StrokeOutcome {
  shot: Shot;
  /** Where the stroke started (the ball returns here on a hazard). */
  from: Vec2;
  ghosts: Ghost[];
  hazard: boolean;
  holed: boolean;
  pickedUp: boolean;
}

export interface Extras { clip?: number; schedule?: Schedule }

export class Round {
  readonly holes: Hole[];
  readonly card: CardEntry[] = [];
  index = 0;
  strokes = 0;
  pos: Vec2;
  holeDone = false;
  private clubsUsed: Club[] = [];
  private readonly seed: number;

  constructor(seed: number) {
    this.seed = seed;
    this.holes = dealCourse(seed);
    this.pos = this.holes[0]!.tee;
  }

  get hole(): Hole { return this.holes[this.index]!; }
  get finished(): boolean { return this.card.length === this.holes.length && this.holeDone; }
  get total(): number { return this.card.reduce((a, c) => a + c.strokes, 0); }
  get vsPar(): number { return this.total - this.card.reduce((a, c) => a + c.par, 0); }

  play(club: Club, params: Params, extras: Extras = {}): StrokeOutcome {
    if (this.holeDone) throw new Error('hole is finished: call advance()');
    const hole = this.hole;
    const from = this.pos;
    const strokeSeed = this.seed + this.index * 1000 + this.strokes * 17;
    const shot = shoot(hole.surface, from, club, params, hole.steps, {
      clip: hole.unlocks.clip ? extras.clip : undefined,
      schedule: hole.unlocks.schedule ? extras.schedule : 'const',
      noise: hole.noise,
      rand: rng(strokeSeed),
    });
    this.clubsUsed.push(club);
    this.strokes += shot.diverged ? 2 : 1;
    const end = shot.path.at(-1)!;
    if (!shot.diverged) this.pos = end;
    const holed = !shot.diverged && isHoled(hole, end);
    const pickedUp = !holed && this.strokes >= hole.par + MAX_OVER_PAR;
    if (pickedUp) this.strokes = hole.par + MAX_OVER_PAR;
    if (holed || pickedUp) this.finishHole(pickedUp);
    return { shot, from, ghosts: ghosts(hole, from, club, strokeSeed), hazard: shot.diverged, holed, pickedUp };
  }

  advance(): void {
    if (!this.holeDone) throw new Error('hole not finished');
    if (this.index === this.holes.length - 1) return;
    this.index++;
    this.strokes = 0;
    this.holeDone = false;
    this.clubsUsed = [];
    this.pos = this.hole.tee;
  }

  private finishHole(pickedUp: boolean): void {
    this.holeDone = true;
    const h = this.hole;
    this.card.push({ hole: h.number, par: h.par, strokes: this.strokes, result: holeResult(this.strokes, h.par), pickedUp, clubs: this.clubsUsed });
  }
}
