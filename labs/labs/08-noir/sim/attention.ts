// Illustrative attention for Winograd-style sentences. Weights are generated from twelve
// hand-designed head archetypes (not a trained model) so each head has a clear "personality".
import { rng, shuffle } from '../../../core/seed';

export interface Case {
  id: string;
  text: string;
  tokens: string[];
  pronoun: number;
  candidates: [number, number];
  answer: number;
  verb: number;
  nouns: number[];
  cue: string;
}

function mk(id: string, text: string, pronoun: string, cands: [string, string], answer: string, verb: string, extraNouns: string[], cue: string): Case {
  const tokens = text.split(' ');
  const find = (w: string, from = 0) => tokens.findIndex((t, i) => i >= from && t.replace(/[.,]/g, '').toLowerCase() === w.toLowerCase());
  const c0 = find(cands[0]), c1 = find(cands[1], c0 + 1);
  const p = find(pronoun, c1 + 1);
  return { id, text, tokens, pronoun: p, candidates: [c0, c1], answer: answer === cands[0] ? c0 : c1, verb: find(verb), nouns: [c0, c1, ...extraNouns.map((n) => find(n))], cue };
}

export const CASES: Case[] = [
  mk('trophy-big', "The trophy doesn't fit in the suitcase because it is too big.", 'it', ['trophy', 'suitcase'], 'trophy', 'fit', [], 'big'),
  mk('trophy-small', "The trophy doesn't fit in the suitcase because it is too small.", 'it', ['trophy', 'suitcase'], 'suitcase', 'fit', [], 'small'),
  mk('council-feared', 'The city council refused the demonstrators a permit because they feared violence.', 'they', ['council', 'demonstrators'], 'council', 'refused', ['permit'], 'feared'),
  mk('council-advocated', 'The city council refused the demonstrators a permit because they advocated violence.', 'they', ['council', 'demonstrators'], 'demonstrators', 'refused', ['permit'], 'advocated'),
  mk('server-malformed', 'The server rejected the request because it was malformed.', 'it', ['server', 'request'], 'request', 'rejected', [], 'malformed'),
  mk('server-overloaded', 'The server rejected the request because it was overloaded.', 'it', ['server', 'request'], 'server', 'rejected', [], 'overloaded'),
  mk('ball-fragile', 'The ball broke the window because it was fragile.', 'it', ['ball', 'window'], 'window', 'broke', [], 'fragile'),
  mk('ball-heavy', 'The ball broke the window because it was heavy.', 'it', ['ball', 'window'], 'ball', 'broke', [], 'heavy'),
  mk('nurse-kind', 'Priya thanked the nurse because she had been so kind.', 'she', ['Priya', 'nurse'], 'nurse', 'thanked', [], 'kind'),
  mk('nurse-grateful', 'Priya thanked the nurse because she was so grateful.', 'she', ['Priya', 'nurse'], 'Priya', 'thanked', [], 'grateful'),
];

export type Role = 'previous-token' | 'first-token' | 'nearest-noun' | 'local' | 'syntactic' | 'subject' | 'rare-token' | 'coreference' | 'cue-word' | 'undecided' | 'sink';

export interface Head { layer: number; index: number; role: Role; blurb: string }

export const HEADS: Head[] = [
  { layer: 1, index: 1, role: 'previous-token', blurb: 'looks at the word just before' },
  { layer: 1, index: 2, role: 'first-token', blurb: 'parks attention on the first word (an "attention sink")' },
  { layer: 1, index: 3, role: 'nearest-noun', blurb: 'grabs the nearest candidate noun: fast, often wrong' },
  { layer: 1, index: 4, role: 'local', blurb: 'blurs over a small window of neighbours' },
  { layer: 2, index: 1, role: 'syntactic', blurb: 'links words to the main verb' },
  { layer: 2, index: 2, role: 'subject', blurb: 'links words to the sentence subject' },
  { layer: 2, index: 3, role: 'rare-token', blurb: 'drawn to long, rare words' },
  { layer: 2, index: 4, role: 'local', blurb: 'another local window' },
  { layer: 3, index: 1, role: 'coreference', blurb: 'resolves pronouns using the cue word' },
  { layer: 3, index: 2, role: 'cue-word', blurb: 'pronouns look at the deciding adjective or verb' },
  { layer: 3, index: 3, role: 'undecided', blurb: 'splits its vote between both candidates' },
  { layer: 3, index: 4, role: 'sink', blurb: 'mostly resting on the first word' },
];

export function softmax(xs: number[], temperature = 1): number[] {
  const t = Math.max(temperature, 1e-6);
  const m = Math.max(...xs);
  const e = xs.map((x) => Math.exp((x - m) / t));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

/** Logits for query token i attending to key token j under a head archetype. */
function logit(c: Case, h: Head, i: number, j: number): number {
  const isPronoun = i === c.pronoun;
  const other = c.candidates[0] === c.answer ? c.candidates[1] : c.candidates[0];
  const nearestCand = Math.max(...c.candidates.filter((x) => x < i).concat(-1));
  const cueIdx = c.tokens.findIndex((t) => t.replace(/[.,]/g, '') === c.cue);
  switch (h.role) {
    case 'previous-token': return j === Math.max(0, i - 1) ? 5 : 0;
    case 'first-token': case 'sink': return j === 0 ? (h.role === 'sink' ? 3.5 : 4) : j === i ? 1 : 0;
    case 'nearest-noun':
      if (isPronoun) return j === nearestCand ? 4 : c.candidates.includes(j) ? 1.5 : c.nouns.includes(j) ? 1 : 0;
      return c.nouns.includes(j) ? 2 - Math.abs(i - j) * 0.1 : 0;
    case 'local': return -Math.abs(i - j) * (h.layer === 1 ? 1.2 : 0.8);
    case 'syntactic': return j === c.verb ? 4 : 0;
    case 'subject': return j === c.candidates[0] ? 3.5 : 0;
    case 'rare-token': return c.tokens[j]!.replace(/[.,']/g, '').length / 2;
    case 'coreference':
      if (isPronoun) return j === c.answer ? 5 : j === other ? 1.5 : 0;
      return j === i ? 1.5 : 0;
    case 'cue-word':
      if (isPronoun) return j === cueIdx ? 3.2 : j === c.answer ? 2.4 : 0;
      return -Math.abs(i - j) * 0.9;
    case 'undecided':
      if (isPronoun) return c.candidates.includes(j) ? 3 : 0;
      return -Math.abs(i - j);
  }
}

/** Full attention matrix (rows = queries) for one head on one case. */
export function attention(c: Case, h: Head, temperature = 1): number[][] {
  return c.tokens.map((_, i) => softmax(c.tokens.map((__, j) => logit(c, h, i, j)), temperature));
}

export function dealCases(seed: number): Case[] {
  return shuffle(CASES, rng(seed)).slice(0, 5);
}

/** Workbench: weights = softmax(k·q / (√d · T)). */
export function qkWeights(q: number[], keys: number[][], temperature: number): number[] {
  const scale = Math.sqrt(q.length);
  return softmax(keys.map((k) => k.reduce((s, v, i) => s + v * q[i]!, 0) / scale), temperature);
}
