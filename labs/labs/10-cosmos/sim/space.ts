// Embedding Galaxy: GloVe 50-d word vectors (int8, dequantised and re-normalised on load),
// cosine nearest neighbours, analogies, odd-one-out, and the daily puzzle deal.
import { rng, shuffle } from '../../../core/seed';

export interface Galaxy {
  words: string[];
  index: Map<string, number>;
  vectors: Float32Array;   // 8000 × 50, unit length
  coords: Float32Array;    // 8000 × 3, in [-1, 1]
  analogies: { a: string; b: string; c: string; answer: string }[];
  odd: { words: string[]; answer: string }[];
  source: string;
}

const bytes = (b64: string) => { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };

export function loadGalaxy(j: { words: string[]; scale: number; dims: number; vectors: string; coords: string; analogies: Galaxy['analogies']; odd: Galaxy['odd']; source: string }): Galaxy {
  const q = new Int8Array(bytes(j.vectors).buffer), D = j.dims, n = j.words.length;
  const vectors = new Float32Array(n * D);
  for (let i = 0; i < n; i++) {
    let norm = 0;
    for (let k = 0; k < D; k++) { const v = q[i * D + k]! * j.scale; vectors[i * D + k] = v; norm += v * v; }
    norm = Math.sqrt(norm) || 1;
    for (let k = 0; k < D; k++) vectors[i * D + k]! /= norm;
  }
  const c16 = new Int16Array(bytes(j.coords).buffer);
  const coords = Float32Array.from(c16, (v) => v / 32767);
  return { words: j.words, index: new Map(j.words.map((w, i) => [w, i])), vectors, coords, analogies: j.analogies, odd: j.odd, source: j.source };
}

export interface Hit { word: string; index: number; sim: number }

function vec(g: Galaxy, w: string): Float32Array {
  const i = g.index.get(w);
  if (i === undefined) throw new Error(`"${w}" is not in the galaxy`);
  return g.vectors.subarray(i * 50, i * 50 + 50);
}

export function nearestTo(g: Galaxy, v: Float32Array, k: number, exclude: Set<string>): Hit[] {
  const hits: Hit[] = [];
  for (let i = 0; i < g.words.length; i++) {
    if (exclude.has(g.words[i]!)) continue;
    let s = 0;
    for (let d = 0; d < 50; d++) s += g.vectors[i * 50 + d]! * v[d]!;
    if (hits.length < k || s > hits[hits.length - 1]!.sim) {
      hits.push({ word: g.words[i]!, index: i, sim: s });
      hits.sort((a, b) => b.sim - a.sim);
      if (hits.length > k) hits.pop();
    }
  }
  return hits;
}

export function nearest(g: Galaxy, w: string, k = 10): Hit[] { return nearestTo(g, vec(g, w), k, new Set([w])); }

/** a − b + c, excluding the three inputs (the standard analogy protocol). */
export function analogy(g: Galaxy, a: string, b: string, c: string, k = 5): Hit[] {
  const va = vec(g, a), vb = vec(g, b), vc = vec(g, c), v = new Float32Array(50);
  let n = 0;
  for (let d = 0; d < 50; d++) { v[d] = va[d]! - vb[d]! + vc[d]!; n += v[d]! ** 2; }
  n = Math.sqrt(n);
  for (let d = 0; d < 50; d++) v[d]! /= n;
  return nearestTo(g, v, k, new Set([a, b, c]));
}

/** The word with the lowest total cosine similarity to the rest. */
export function oddOneOut(g: Galaxy, words: string[]): string {
  const vs = words.map((w) => vec(g, w));
  let worst = 0, worstScore = Infinity;
  vs.forEach((v, i) => {
    let s = 0;
    vs.forEach((u, j) => { if (i !== j) for (let d = 0; d < 50; d++) s += v[d]! * u[d]!; });
    if (s < worstScore) { worstScore = s; worst = i; }
  });
  return words[worst]!;
}

export interface Puzzle { kind: 'analogy' | 'odd'; prompt: string; answer: string; options: string[]; given: string[] }

export function dealPuzzles(g: Galaxy, seed: number): Puzzle[] {
  const rand = rng(seed);
  const an = shuffle(g.analogies, rand).slice(0, 3).map((a): Puzzle => {
    const near = analogy(g, a.a, a.b, a.c, 12).map((h) => h.word).filter((w) => w !== a.answer);
    const options = shuffle([a.answer, ...near.slice(0, 5)], rand);
    return { kind: 'analogy', prompt: `${a.a} − ${a.b} + ${a.c} = ?`, answer: a.answer, options, given: [a.a, a.b, a.c] };
  });
  const od = shuffle(g.odd, rand).slice(0, 2).map((o): Puzzle => ({
    kind: 'odd', prompt: 'Which star does not belong in this constellation?', answer: o.answer, options: shuffle(o.words, rand), given: o.words,
  }));
  return [an[0]!, od[0]!, an[1]!, od[1]!, an[2]!];
}
