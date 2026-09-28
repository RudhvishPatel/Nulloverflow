// The course library: 12 classic optimisation test surfaces with analytic gradients.
// bounds = [xMin, xMax, yMin, yMax]; minima are stationary points a cup can sit on.

export type Vec2 = [number, number];

export interface Surface {
  id: string;
  name: string;
  /** One-line description shown on the hole card. */
  blurb: string;
  f(x: number, y: number): number;
  grad(x: number, y: number): Vec2;
  bounds: [number, number, number, number];
  minima: Vec2[];
}

const sq = (v: number) => v * v;
const TAU = Math.PI * 2;

/** The cliff face: a uniform ramp of height 20 between x = 0.8 and x = 1.2 (slope 50). */
const CLIFF_H = 20, CLIFF_X0 = 0.8, CLIFF_W = 0.4;
const ramp = (x: number) => Math.min(1, Math.max(0, (x - CLIFF_X0) / CLIFF_W));
const dramp = (x: number) => (x > CLIFF_X0 && x < CLIFF_X0 + CLIFF_W ? 1 / CLIFF_W : 0);

export const SURFACES: Surface[] = [
  {
    id: 'bowl',
    name: 'The Bowl',
    blurb: 'A perfect quadratic. Every club works; the question is how few strokes.',
    f: (x, y) => x * x + y * y,
    grad: (x, y) => [2 * x, 2 * y],
    bounds: [-3, 3, -3, 3],
    minima: [[0, 0]],
  },
  {
    id: 'ravine',
    name: 'The Ravine',
    blurb: 'Ill-conditioned: 25× steeper across than along. Plain SGD zig-zags.',
    f: (x, y) => 0.5 * x * x + 12.5 * y * y,
    grad: (x, y) => [x, 25 * y],
    bounds: [-4, 4, -2, 2],
    minima: [[0, 0]],
  },
  {
    id: 'rosenbrock',
    name: 'Banana Valley',
    blurb: "Rosenbrock's curved, nearly flat valley floor. Easy to find, hard to follow.",
    f: (x, y) => sq(1 - x) + 100 * sq(y - x * x),
    grad: (x, y) => [-2 * (1 - x) - 400 * x * (y - x * x), 200 * (y - x * x)],
    bounds: [-2, 2, -1, 3],
    minima: [[1, 1]],
  },
  {
    id: 'saddle',
    name: 'Saddle Pass',
    blurb: 'The tee sits near a saddle point. The gradient there is almost zero.',
    f: (x, y) => x * x - y * y + 0.25 * y ** 4,
    grad: (x, y) => [2 * x, -2 * y + y ** 3],
    bounds: [-3, 3, -3, 3],
    minima: [[0, Math.SQRT2], [0, -Math.SQRT2]],
  },
  {
    id: 'himmelblau',
    name: 'Four Greens',
    blurb: "Himmelblau's function: four equal minima, and only one cup counts.",
    f: (x, y) => sq(x * x + y - 11) + sq(x + y * y - 7),
    grad: (x, y) => [4 * x * (x * x + y - 11) + 2 * (x + y * y - 7), 2 * (x * x + y - 11) + 4 * y * (x + y * y - 7)],
    bounds: [-5, 5, -5, 5],
    minima: [[3, 2], [-2.805118, 3.131312], [-3.77931, -3.283186], [3.584428, -1.848126]],
  },
  {
    id: 'rastrigin',
    name: 'The Moguls',
    blurb: 'A Rastrigin egg-crate: dozens of local dips waiting to trap a timid ball.',
    f: (x, y) => 4 + x * x - 2 * Math.cos(TAU * x) + y * y - 2 * Math.cos(TAU * y),
    grad: (x, y) => [2 * x + 2 * TAU * Math.sin(TAU * x), 2 * y + 2 * TAU * Math.sin(TAU * y)],
    bounds: [-3, 3, -3, 3],
    minima: [[0, 0]],
  },
  {
    id: 'plateau',
    name: 'Foggy Plateau',
    blurb: 'Nearly flat far out, and every gradient is noisy (mini-batch SGD).',
    f: (x, y) => 1 - Math.exp(-(x * x + y * y) / 8),
    grad: (x, y) => {
      const e = Math.exp(-(x * x + y * y) / 8);
      return [(x / 4) * e, (y / 4) * e];
    },
    bounds: [-6, 6, -6, 6],
    minima: [[0, 0]],
  },
  {
    id: 'cliff',
    name: 'The Cliff',
    blurb: 'A sheer face with gradients 100× larger than the green. Clip them or fly.',
    f: (x, y) => 0.05 * (x * x + y * y) + CLIFF_H * ramp(x),
    grad: (x, y) => [0.1 * x + CLIFF_H * dramp(x), 0.1 * y],
    bounds: [-3, 4, -3, 3],
    minima: [[0, 0]],
  },
  {
    id: 'beale',
    name: "Beale's Bunker",
    blurb: 'Sharp ridges near the edges, a narrow flat valley to the cup.',
    f: (x, y) => sq(1.5 - x + x * y) + sq(2.25 - x + x * y * y) + sq(2.625 - x + x * y ** 3),
    grad: (x, y) => {
      const a = 1.5 - x + x * y, b = 2.25 - x + x * y * y, c = 2.625 - x + x * y ** 3;
      return [
        2 * a * (y - 1) + 2 * b * (y * y - 1) + 2 * c * (y ** 3 - 1),
        2 * a * x + 2 * b * 2 * x * y + 2 * c * 3 * x * y * y,
      ];
    },
    bounds: [-4.5, 4.5, -4.5, 4.5],
    minima: [[3, 0.5]],
  },
  {
    id: 'booth',
    name: 'Booth Fairway',
    blurb: 'A tilted, stretched bowl. Friendly, but the fall line is diagonal.',
    f: (x, y) => sq(x + 2 * y - 7) + sq(2 * x + y - 5),
    grad: (x, y) => [2 * (x + 2 * y - 7) + 4 * (2 * x + y - 5), 4 * (x + 2 * y - 7) + 2 * (2 * x + y - 5)],
    bounds: [-10, 10, -10, 10],
    minima: [[1, 3]],
  },
  {
    id: 'camel',
    name: 'Six-Hump Camel',
    blurb: 'Six humps, two true greens, and ridges that punish big steps.',
    f: (x, y) => (4 - 2.1 * x * x + x ** 4 / 3) * x * x + x * y + (-4 + 4 * y * y) * y * y,
    grad: (x, y) => [8 * x - 8.4 * x ** 3 + 2 * x ** 5 + y, x - 8 * y + 16 * y ** 3],
    bounds: [-3, 3, -2, 2],
    minima: [[0.0898420131, -0.7126564033], [-0.0898420131, 0.7126564033]],
  },
  {
    id: 'twin',
    name: 'Twin Valleys',
    blurb: 'Two identical valleys, one cup. Momentum can carry you over the ridge.',
    f: (x, y) => sq(x * x - 4) / 8 + y * y,
    grad: (x, y) => [(x * (x * x - 4)) / 2, 2 * y],
    bounds: [-4, 4, -3, 3],
    minima: [[2, 0], [-2, 0]],
  },
];

export function surfaceById(id: string): Surface {
  const s = SURFACES.find((x) => x.id === id);
  if (!s) throw new Error(`unknown surface ${id}`);
  return s;
}

/** Lowest value over listed minima, used to normalise terrain height. */
export function floorOf(s: Surface): number {
  return Math.min(...s.minima.map(([x, y]) => s.f(x, y)));
}
