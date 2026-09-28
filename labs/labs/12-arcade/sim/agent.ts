// Tabular Q-learning and SARSA with ε-greedy exploration.
import { ACTIONS, type Dungeon, type State } from './dungeon';

export interface AgentConfig { algo: 'q' | 'sarsa'; alpha: number; gamma: number; epsilon: number; decay: boolean }
export interface EpisodeLog { ret: number; steps: number; outcome?: 'treasure' | 'decoy' | 'lava'; path: [number, number][] }

const MAX_STEPS = 150;

export class Agent {
  readonly q: Float64Array;
  episodes = 0;

  constructor(readonly dungeon: Dungeon, readonly cfg: AgentConfig, private rand: () => number) {
    this.q = new Float64Array(dungeon.states * 4);
  }

  get epsilon(): number { return this.cfg.decay ? Math.max(0.01, this.cfg.epsilon * 0.995 ** this.episodes) : this.cfg.epsilon; }

  best(s: State): number {
    const i = this.dungeon.index(s) * 4;
    let b = 0;
    for (let a = 1; a < 4; a++) if (this.q[i + a]! > this.q[i + b]!) b = a;
    return b;
  }
  value(s: State): number { return this.q[this.dungeon.index(s) * 4 + this.best(s)]!; }

  private choose(s: State): number { return this.rand() < this.epsilon ? Math.floor(this.rand() * 4) : this.best(s); }

  episode(): EpisodeLog {
    const d = this.dungeon, { alpha, gamma, algo } = this.cfg;
    let s = d.initial(), a = this.choose(s), ret = 0, steps = 0, outcome: EpisodeLog['outcome'];
    const path: [number, number][] = [[s.x, s.y]];
    for (; steps < MAX_STEPS; steps++) {
      const r = d.step(s, ACTIONS[a]!, this.rand);
      ret += r.reward;
      path.push([r.state.x, r.state.y]);
      const i = d.index(s) * 4 + a;
      const a2 = this.choose(r.state);
      const next = r.done ? 0 : algo === 'q' ? this.value(r.state) : this.q[d.index(r.state) * 4 + a2]!;
      this.q[i] = this.q[i]! + alpha * (r.reward + gamma * next - this.q[i]!);
      s = r.state; a = a2;
      if (r.done) { outcome = r.outcome; steps++; break; }
    }
    this.episodes++;
    return { ret, steps, outcome, path };
  }
}

/** Follow the greedy policy from the start (no exploration). */
export function greedyRollout(_d: Dungeon, agent: Agent, rand: () => number, maxSteps = 100): { path: [number, number][]; outcome?: 'treasure' | 'decoy' | 'lava' } {
  const d = agent.dungeon;
  let s = d.initial();
  const path: [number, number][] = [[s.x, s.y]];
  for (let i = 0; i < maxSteps; i++) {
    const r = d.step(s, ACTIONS[agent.best(s)]!, rand);
    path.push([r.state.x, r.state.y]);
    s = r.state;
    if (r.done) return { path, outcome: r.outcome };
  }
  return { path };
}
