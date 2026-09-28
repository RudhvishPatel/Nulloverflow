// lab/10 Embedding Galaxy: fly through 8,000 GloVe words as stars, search any word, and
// solve five daily analogy / odd-one-out puzzles with the geometry drawn as light.
import { announce, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { detectTier } from '../../core/quality';
import { dailySeed } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { Labels, Stars2D, type StarMap } from './render/stars';
import { analogy, dealPuzzles, loadGalaxy, nearest, type Galaxy, type Puzzle } from './sim/space';
import './lab.css';

const stage = mountLab('lab-galaxy');
const seed = dailySeed('10');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);

let g: Galaxy;
let map: StarMap;
let labels: Labels;
let puzzles: Puzzle[] = [];
let round = 0, points = 0;
let answered = false;
const log: string[] = [];

const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/10 · embedding-galaxy · GloVe 50-d'), score);
const seedLine = el('p', { class: 'mono mag-seed' }, '> loading 8,000 stars…');
const prompt = el('p', { class: 'scale-prompt mono' });
const mapWrap = el('div', { class: 'cs-map' });
const search = el('input', { type: 'search', class: 'cs-search', placeholder: 'fly to a word… (e.g. ocean)', 'aria-label': 'Fly to a word', autocomplete: 'off', spellcheck: 'false' });
const flyBtn = el('button', { type: 'button', class: 'btn cs-fly' }, 'Fly');
const neighbours = el('ol', { class: 'cs-neighbours', 'aria-label': 'Nearest words' });
const options = el('div', { class: 'cs-options', role: 'group', 'aria-label': 'Answer options' });
const reveal = el('div', { class: 'lab-reveal', hidden: true });
const nextBtn = el('button', { type: 'button', class: 'btn btn-signal cs-next', hidden: true }, 'Next puzzle →');
const end = el('section', { class: 'cs-end', hidden: true });
stage.root.append(chrome, seedLine, prompt,
  el('div', { class: 'lab-stage cs-stage' }, mapWrap,
    el('div', { class: 'cs-hud' },
      el('p', { class: 'mono cs-hud-title' }, 'Navigation'),
      el('div', { class: 'cs-searchrow' }, search, flyBtn), neighbours,
      el('p', { class: 'mono cs-hud-title' }, 'Puzzle'), options, reveal, el('div', { class: 'lab-actions' }, nextBtn))),
  end);

function renderChrome(): void {
  clear(score);
  score.append('PUZZLE ', el('strong', {}, String(Math.min(round + 1, 5))), el('span', { class: 'scale-score-sep' }, '/'), '5',
    el('span', { class: 'scale-score-sep' }, ' · '), 'SCORE ', el('strong', {}, String(points)), el('span', { class: 'scale-score-sep' }, '/'), '100');
}

const idx = (w: string) => g.index.get(w)!;

function fly(word: string): void {
  const w = word.trim().toLowerCase();
  if (!g.index.has(w)) { prompt.textContent = `> "${word}" is not among the 8,000 most common words. Try another.`; return; }
  const near = nearest(g, w, 10);
  clear(neighbours);
  near.forEach((h) => neighbours.append(el('li', {}, el('button', { type: 'button', class: 'cs-chip', onclick: () => { search.value = h.word; fly(h.word); } }, h.word), el('span', { class: 'mono' }, h.sim.toFixed(2)))));
  map.focus({ indices: [idx(w), ...near.map((h) => h.index)], highlight: [idx(w)], beams: near.slice(0, 5).map((h) => [idx(w), h.index]) }, reduced);
  announce(`Flying to ${w}. Nearest: ${near.slice(0, 5).map((h) => h.word).join(', ')}.`);
}

function renderPuzzle(): void {
  const p = puzzles[round]!;
  answered = false;
  prompt.textContent = `> PUZZLE [${round + 1}/5]: ${p.prompt}`;
  clear(options);
  for (const o of p.options) options.append(el('button', { type: 'button', class: 'btn cs-option', onclick: () => answer(o) }, o));
  reveal.hidden = true; nextBtn.hidden = true;
  const given = p.given.map(idx);
  map.focus({ indices: [...given, ...p.options.map(idx)], highlight: given, beams: [] }, reduced);
  renderChrome();
}

function answer(choice: string): void {
  if (answered) return;
  answered = true;
  const p = puzzles[round]!;
  const ok = choice === p.answer;
  if (ok) points += 20;
  log.push(ok ? '⭐' : '☄️');
  options.querySelectorAll<HTMLButtonElement>('.cs-option').forEach((b) => { b.disabled = true; if (b.textContent === p.answer) b.classList.add('is-right'); else if (b.textContent === choice) b.classList.add('is-wrong'); });
  let detail: string;
  if (p.kind === 'analogy') {
    const [a, b, c] = p.given as [string, string, string];
    const top = analogy(g, a, b, c, 3).map((h) => h.word);
    detail = `The relation ${b} → ${a} is a direction in space; starting from ${c} and following it lands near ${top.join(', ')}.`;
    map.focus({ indices: [idx(a), idx(b), idx(c), idx(p.answer)], highlight: [idx(a), idx(c), idx(p.answer)], beams: [[idx(b), idx(a)], [idx(c), idx(p.answer)]] }, reduced);
  } else {
    detail = `"${p.answer}" sits far from the other four: its cosine similarity to them is the lowest.`;
    map.focus({ indices: p.given.map(idx), highlight: [idx(p.answer)], beams: p.given.filter((w) => w !== p.answer).map((w) => [idx(w), idx(p.answer)] as [number, number]) }, reduced);
  }
  reveal.className = `lab-reveal ${ok ? 'is-hit' : 'is-miss'}`;
  clear(reveal);
  const msg = `${ok ? 'Correct' : `Not quite: it was "${p.answer}"`}. ${detail}`;
  reveal.append(el('p', { class: 'mono' }, `> ${msg}`));
  reveal.hidden = false;
  announce(msg);
  renderChrome();
  if (round === 4) finish(); else nextBtn.hidden = false;
}

function finish(): void {
  const best = load<number | null>('cosmos-best', null);
  if (best === null || points > best) save('cosmos-best', points);
  const share = `Null Overflow · Embedding Galaxy ${today}: ${points}/100 ${log.join('')}`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(end);
  end.append(el('p', { class: 'mono cs-end-kicker' }, 'Log entry'), el('h4', { class: 'cs-end-score' }, `${points} / 100`),
    el('p', {}, `${best === null ? 'First voyage logged on this device.' : `Best on this device: ${Math.max(best, points)}.`} The galaxy stays open: search any word above.`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'New voyage (same stars)'), copy));
  end.hidden = false;
  announce(`Voyage complete: ${points} of 100.`);
}

nextBtn.addEventListener('click', () => { if (round < 4) { round++; renderPuzzle(); } });
flyBtn.addEventListener('click', () => fly(search.value));
search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); fly(search.value); } });

async function boot(): Promise<void> {
  g = loadGalaxy(await (await fetch('/assets/lab/10/data/galaxy.json')).json());
  labels = new Labels(g);
  const tier = detectTier();
  let m: StarMap | null = null;
  if (tier !== 'low') {
    try { const { Stars3D } = await import('./render/stars3d'); m = new Stars3D(g, labels, tier); } catch { m = null; }
  }
  map = m ?? new Stars2D(g, labels);
  stage.root.dataset.renderer = map.kind;
  mapWrap.append(map.canvas, labels.layer);
  map.canvas.setAttribute('role', 'img');
  map.canvas.setAttribute('aria-label', '8,000 English words placed by meaning: similar words are neighbouring stars.');
  const resize = () => { const w = mapWrap.clientWidth; map.resize(w, Math.round(w < 600 ? w * 1.05 : Math.min(620, w * 0.62))); };
  new ResizeObserver(resize).observe(mapWrap);
  resize();
  puzzles = dealPuzzles(g, seed);
  seedLine.textContent = `> DAILY SEED ${today} · ${g.words.length.toLocaleString('en-GB')} words · 5 puzzles · GloVe 6B 50-d (public domain), int8`;
  stage.ready();
  renderPuzzle();
}
boot().catch((e) => { stage.ready(); prompt.textContent = `> The galaxy failed to load: ${String(e)}`; });
