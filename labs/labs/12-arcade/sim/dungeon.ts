// Grid dungeons for tabular RL. Rewards on entering a cell: floor −1, treasure +10 (end),
// decoy +1 (end), lava −100 (end, as in Sutton & Barto's cliff walk), breadcrumb +5 once per episode. Wind tiles push the
// knight up with 30 % probability. The door opens only with the key.
import { rng as mkRng, shuffle } from '../../../core/seed';

export type Kind = 'wall' | 'floor' | 'start' | 'treasure' | 'decoy' | 'lava' | 'wind' | 'key' | 'door' | 'crumb';
export type Action = 'up' | 'down' | 'left' | 'right';
export const ACTIONS: Action[] = ['up', 'down', 'left', 'right'];
export interface State { x: number; y: number; key: boolean; mask?: number }
export interface StepResult { state: State; reward: number; done: boolean; outcome?: 'treasure' | 'decoy' | 'lava' }

const CHAR: Record<string, Kind> = { '#': 'wall', '.': 'floor', S: 'start', T: 'treasure', t: 'decoy', '~': 'lava', w: 'wind', k: 'key', D: 'door' };
const MOVE: Record<Action, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export class Dungeon {
  readonly w: number;
  readonly h: number;
  readonly start: [number, number];
  readonly crumbs: [number, number][];
  private grid: Kind[][];

  constructor(readonly id: string, readonly name: string, rows: string[], readonly blurb = '', readonly suggestedCrumbs: [number, number][] = [], crumbs: [number, number][] = []) {
    this.grid = rows.map((r) => [...r].map((c) => CHAR[c] ?? 'floor'));
    this.h = rows.length; this.w = rows[0]!.length;
    this.start = this.find('start')!;
    this.crumbs = crumbs.slice(0, 2);
    this.rows = rows;
  }
  private rows: string[];

  cell(x: number, y: number): { kind: Kind } {
    const crumb = this.crumbs.findIndex(([cx, cy]) => cx === x && cy === y);
    const k = this.grid[y]?.[x] ?? 'wall';
    return { kind: crumb >= 0 && (k === 'floor' || k === 'wind') ? 'crumb' : k };
  }
  find(kind: Kind): [number, number] | null {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.grid[y]![x] === kind) return [x, y];
    return null;
  }
  distanceToLava(x: number, y: number): number {
    let best = Infinity;
    for (let yy = 0; yy < this.h; yy++) for (let xx = 0; xx < this.w; xx++) if (this.grid[yy]![xx] === 'lava') best = Math.min(best, Math.abs(xx - x) + Math.abs(yy - y));
    return best;
  }
  withCrumbs(crumbs: [number, number][]): Dungeon {
    return new Dungeon(this.id, this.name, this.rows, this.blurb, this.suggestedCrumbs, crumbs);
  }
  get states(): number { return this.w * this.h * 2 * 4; }
  index(s: State): number { return (((s.y * this.w + s.x) * 2 + (s.key ? 1 : 0)) * 4) + (s.mask ?? 0); }
  initial(): State { return { x: this.start[0], y: this.start[1], key: false, mask: 0 }; }

  step(s: State, a: Action, rand: () => number): StepResult {
    let [dx, dy] = MOVE[a];
    let x = s.x + dx, y = s.y + dy;
    const blocked = (xx: number, yy: number, key: boolean) => { const k = this.grid[yy]?.[xx] ?? 'wall'; return k === 'wall' || (k === 'door' && !key); };
    if (blocked(x, y, s.key)) { x = s.x; y = s.y; }
    if (this.grid[s.y]![s.x] === 'wind' && rand() < 0.3 && !blocked(x, y - 1, s.key)) y -= 1;
    let key = s.key || this.grid[y]![x] === 'key';
    let mask = s.mask ?? 0;
    const kind = this.grid[y]![x]!;
    if (kind === 'treasure') return { state: { x, y, key, mask }, reward: 10, done: true, outcome: 'treasure' };
    if (kind === 'decoy') return { state: { x, y, key, mask }, reward: 1, done: true, outcome: 'decoy' };
    if (kind === 'lava') return { state: { x, y, key, mask }, reward: -100, done: true, outcome: 'lava' };
    const ci = this.crumbs.findIndex(([cx, cy]) => cx === x && cy === y);
    if (ci >= 0 && !(mask & (1 << ci))) { mask |= 1 << ci; return { state: { x, y, key, mask }, reward: 5, done: false }; }
    void dx; void dy;
    return { state: { x, y, key, mask }, reward: -1, done: false };
  }
}

export function parseDungeon(id: string, rows: string[], name = id, blurb = '', crumbs: [number, number][] = []): Dungeon {
  return new Dungeon(id, name, rows, blurb, crumbs);
}

export const DUNGEONS: Record<string, Dungeon> = {
  cliff: parseDungeon('cliff', ['############', '#..........#', '#..........#', '#..........#', '#S~~~~~~~~T#', '############'],
    'The Cliff Walk', 'Lava lines the short route. Q-learning learns the edge; SARSA, which counts its own clumsy exploration, keeps back.'),
  decoy: parseDungeon('decoy', ['###########', '#t.S......#', '#########.#', '#T........#', '###########'],
    'The Decoy Chest', 'A small chest two steps away, a big one far off. A short-sighted agent settles; breadcrumbs can lure it on.', [[6, 1], [9, 3]]),
  windy: parseDungeon('windy', ['###########', '#~~~~~~~~~#', '#www...www#', '#S.#####.T#', '###########'],
    'The Windy Hall', 'Gusts shove you toward the lava 30% of the time on the marked tiles.'),
  vault: parseDungeon('vault', ['#########', '#S..#..T#', '#.#.D.#.#', '#k#.#.#.#', '#########'],
    'The Key Vault', 'The door only opens for a knight carrying the key. The state now includes what you hold.'),
  maze: parseDungeon('maze', ['###########', '#S#.....#.#', '#.#.###.#.#', '#...#...#.#', '###.#.###.#', '#...#.....#', '#.#######.#', '#........T#', '###########'],
    'The Labyrinth', 'Long corridors, one exit. Discount and exploration decide whether it is ever found.'),
};

export function dealDungeons(seed: number): Dungeon[] {
  return shuffle(Object.values(DUNGEONS), mkRng(seed)).slice(0, 3);
}
