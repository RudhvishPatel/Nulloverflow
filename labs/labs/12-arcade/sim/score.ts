// Round scoring: reaching the treasure scores 60 plus up to 40 for path efficiency.
import { ACTIONS, type Dungeon, type State } from './dungeon';

/** BFS steps from the start to the treasure over (x, y, key), ignoring wind. */
export function shortestPath(d: Dungeon): number {
  const noWind = () => 1;
  const start = d.initial();
  const seen = new Set([d.index(start)]);
  let frontier: State[] = [start];
  for (let steps = 1; frontier.length && steps < 500; steps++) {
    const next: State[] = [];
    for (const s of frontier) for (const a of ACTIONS) {
      const r = d.step(s, a, noWind);
      if (r.outcome === 'treasure') return steps;
      if (r.done) continue;
      const k = d.index({ ...r.state, mask: 0 });
      if (!seen.has(k)) { seen.add(k); next.push({ ...r.state, mask: 0 }); }
    }
    frontier = next;
  }
  return Infinity;
}

export function roundScore(outcome: 'treasure' | 'decoy' | 'lava' | undefined, steps: number, optimal: number): number {
  if (outcome === 'treasure') return Math.round(60 + 40 * Math.min(1, optimal / Math.max(steps, 1)));
  return outcome === 'decoy' ? 25 : 0;
}
