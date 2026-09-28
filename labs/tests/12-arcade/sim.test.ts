import { describe, expect, test } from 'vitest';
import { parseDungeon, DUNGEONS, dealDungeons } from '../../labs/12-arcade/sim/dungeon';
import { Agent, greedyRollout } from '../../labs/12-arcade/sim/agent';
import { rng } from '../../core/seed';

const TINY = parseDungeon('tiny', ['######', '#S..T#', '#.##.#', '#....#', '######']);

describe('dungeons', () => {
  test('parse finds start, treasure and walls; five templates exist', () => {
    expect(TINY.start).toEqual([1, 1]);
    expect(TINY.cell(4, 1).kind).toBe('treasure');
    expect(TINY.cell(2, 2).kind).toBe('wall');
    expect(Object.keys(DUNGEONS)).toHaveLength(5);
  });
  test('dealDungeons picks 3 distinct templates deterministically', () => {
    expect(dealDungeons(7).map((d) => d.id)).toEqual(dealDungeons(7).map((d) => d.id));
    expect(new Set(dealDungeons(7).map((d) => d.id)).size).toBe(3);
  });
  test('the key vault needs the key: the door blocks until it is carried', () => {
    const d = DUNGEONS.vault!;
    const door = d.find('door')!;
    const next = d.step({ x: door[0] - 1, y: door[1], key: false }, 'right', rng(1));
    expect(next.state.x).toBe(door[0] - 1);
    const open = d.step({ x: door[0] - 1, y: door[1], key: true }, 'right', rng(1));
    expect(open.state.x).toBe(door[0]);
  });
});

describe('learning', () => {
  test('Q-learning finds the shortest path on a tiny dungeon within 500 episodes', () => {
    const a = new Agent(TINY, { algo: 'q', alpha: 0.5, gamma: 0.95, epsilon: 0.2, decay: true }, rng(3));
    for (let i = 0; i < 500; i++) a.episode();
    const r = greedyRollout(TINY, a, rng(4));
    expect(r.outcome).toBe('treasure');
    expect(r.path.length - 1).toBe(3);
  });
  test('on the cliff, Q-learning hugs the edge while SARSA (ε = 0.1) keeps its distance', () => {
    const cliff = DUNGEONS.cliff!;
    const run = (algo: 'q' | 'sarsa') => {
      const a = new Agent(cliff, { algo, alpha: 0.5, gamma: 0.99, epsilon: 0.1, decay: false }, rng(11));
      for (let i = 0; i < 800; i++) a.episode();
      return greedyRollout(cliff, a, rng(12));
    };
    const q = run('q'), s = run('sarsa');
    expect(q.outcome).toBe('treasure');
    expect(s.outcome).toBe('treasure');
    const minDistToLava = (path: [number, number][]) => Math.min(...path.slice(1, -1).map(([x, y]) => cliff.distanceToLava(x, y)));
    expect(minDistToLava(q.path)).toBe(1);
    expect(minDistToLava(s.path)).toBeGreaterThan(1);
  });
  test('breadcrumb tiles change what a short-sighted agent learns on the decoy dungeon', () => {
    const d = DUNGEONS.decoy!;
    const train = (crumbs: [number, number][]) => {
      const a = new Agent(d.withCrumbs(crumbs), { algo: 'q', alpha: 0.5, gamma: 0.8, epsilon: 0.3, decay: true }, rng(5));
      for (let i = 0; i < 600; i++) a.episode();
      return greedyRollout(d, a, rng(6)).outcome;
    };
    expect(train([])).toBe('decoy');
    expect(train(d.suggestedCrumbs)).toBe('treasure');
  });
});

import { shortestPath, roundScore } from '../../labs/12-arcade/sim/score';
describe('scoring', () => {
  test('shortest path respects walls, the key and the door', () => {
    expect(shortestPath(TINY)).toBe(3);
    const v = DUNGEONS.vault!;
    // S(1,1) → key (1,3) = 2, back to (3,2) via (1,1),(2,1),(3,1),(3,2) = 5, door (4,2), (5,2),(5,1),(6,1),(7,1) T = 5 → 12.
    expect(shortestPath(v)).toBe(12);
  });
  test('treasure scores 60 + 40 × efficiency; the decoy 25; lava 0', () => {
    expect(roundScore('treasure', 10, 10)).toBe(100);
    expect(roundScore('treasure', 20, 10)).toBe(80);
    expect(roundScore('decoy', 3, 10)).toBe(25);
    expect(roundScore('lava', 5, 10)).toBe(0);
    expect(roundScore(undefined, 100, 10)).toBe(0);
  });
});
