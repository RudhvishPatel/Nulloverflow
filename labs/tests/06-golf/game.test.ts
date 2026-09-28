import { describe, expect, test } from 'vitest';
import { Round, MAX_OVER_PAR } from '../../labs/06-golf/sim/game';
import { ghostFor } from '../../labs/06-golf/sim/course';

describe('Round', () => {
  test('starts on hole 1 at the tee with no strokes', () => {
    const r = new Round(42);
    expect(r.holes).toHaveLength(6);
    expect(r.index).toBe(0);
    expect(r.strokes).toBe(0);
    expect(r.pos).toEqual(r.hole.tee);
    expect(r.finished).toBe(false);
  });

  test('a normal stroke moves the ball to the end of the path and returns 4 ghosts', () => {
    const r = new Round(42);
    const out = r.play('adam', { lr: 0.05 });
    expect(r.strokes).toBe(1);
    expect(r.pos).toEqual(out.shot.path.at(-1));
    expect(out.ghosts).toHaveLength(4);
    expect(out.ghosts.map((g) => g.club)).not.toContain('adam');
  });

  test('a diverged stroke is a water hazard: +1 penalty and the ball returns to where it was', () => {
    const r = new Round(42);
    const before = r.pos;
    const out = r.play('sgd', { lr: 1e6 });
    expect(out.hazard).toBe(true);
    expect(r.strokes).toBe(2);
    expect(r.pos).toEqual(before);
  });

  test('holing out records the card and advance() moves to the next hole', () => {
    const r = new Round(42);
    let guard = 0;
    while (!r.holeDone && guard++ < 10) {
      const g = ghostFor(r.hole, r.pos, 'adam', 1);
      r.play('adam', g.params);
    }
    expect(r.holeDone).toBe(true);
    expect(r.card[0]!.strokes).toBe(r.strokes);
    r.advance();
    expect(r.index).toBe(1);
    expect(r.strokes).toBe(0);
    expect(r.pos).toEqual(r.hole.tee);
  });

  test(`the ball is picked up at par + ${MAX_OVER_PAR} so a round always ends`, () => {
    const r = new Round(42);
    while (!r.holeDone) r.play('sgd', { lr: 1e-6 });
    expect(r.card[0]!.strokes).toBe(r.hole.par + MAX_OVER_PAR);
    expect(r.card[0]!.pickedUp).toBe(true);
  });

  test('after 6 holes the round is finished with a total and a score vs par', () => {
    const r = new Round(42);
    for (let h = 0; h < 6; h++) {
      while (!r.holeDone) r.play('sgd', { lr: 1e-6 });
      r.advance();
    }
    expect(r.finished).toBe(true);
    expect(r.total).toBe(r.card.reduce((a, c) => a + c.strokes, 0));
    expect(r.vsPar).toBe(r.total - r.holes.reduce((a, h) => a + h.par, 0));
    expect(() => r.play('sgd', { lr: 0.1 })).toThrow();
  });
});
