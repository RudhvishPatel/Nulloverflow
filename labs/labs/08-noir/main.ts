// lab/08 Attention Lens: interrogate 12 illustrative heads to resolve pronouns in Winograd
// cases, identify the coreference head, and solve a Q·K puzzle on the workbench.
import { announce, onKeys } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed, rng, shuffle } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { Workbench, drawStrings } from './render/strings';
import { HEADS, attention, dealCases, qkWeights, type Head } from './sim/attention';
import './lab.css';

const stage = mountLab('lab-attn');
const seed = dailySeed('08');
const today = new Date().toISOString().slice(0, 10);
const cases = dealCases(seed);
// Heads keep their layer but get shuffled labels, so you have to interrogate them.
const lineup: Head[] = [1, 2, 3].flatMap((layer) => shuffle(HEADS.filter((h) => h.layer === layer), rng(seed + layer)));
const tag = (i: number) => `L${lineup[i]!.layer}·H${(i % 4) + 1}`;

let round = 0;
let headIdx = 0;
let query = cases[0]!.pronoun;
let phase: 'call' | 'which-head' | 'done' = 'call';
let caseScore = 0;
let benchScore = 0;
const log: string[] = [];

const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/08 · attention-lens · 3 layers × 4 heads'), score);
const tabs = el('div', { class: 'mag-tabs', role: 'tablist', 'aria-label': 'Attention Lens modes' });
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · 5 case files · weights are illustrative (head archetypes, not a trained model)`);
const prompt = el('p', { class: 'scale-prompt mono' });
const chips = el('div', { class: 'attn-picker', role: 'radiogroup', 'aria-label': 'Attention head' });
const headNote = el('p', { class: 'attn-disclaimer mono' });
const arcs = el('canvas', { class: 'nr-arcs', 'aria-hidden': 'true' });
const words = el('ol', { class: 'attn-words' });
const wrap = el('div', { class: 'attn-wrap nr-wrap' }, arcs, words);
const reveal = el('div', { class: 'lab-reveal', hidden: true });
const casePanel = el('div', { class: 'nr-case' }, chips, headNote, el('div', { class: 'lab-stage attn-stage' }, wrap), el('p', { class: 'mono attn-hint' }, 'Tap any word to see where it looks. To answer, tap the card "it" refers to, using ⏎ or the "Name the suspect" button.'), reveal);
const bench = new Workbench([
  { label: 'trophy', v: [0.9, 0.9] }, { label: 'suitcase', v: [-1.1, 0.4] }, { label: 'fit', v: [0.2, -1.2] }, { label: 'because', v: [-0.5, -0.8] },
], () => renderBench());
const temp = el('input', { type: 'range', min: 0.2, max: 3, step: 0.05, value: 1, 'aria-label': 'Softmax temperature' });
const benchOut = el('p', { class: 'mono nr-bench-out', 'aria-live': 'polite' });
const benchPanel = el('div', { class: 'nr-benchpanel', hidden: true },
  el('p', { class: 'scale-prompt mono' }, '> WORKBENCH: drag the query arrow. Weights = softmax(k·q / (√2 · T)). Goal: put at least 70% on "suitcase" with temperature at 1.0 or above.'),
  el('div', { class: 'nr-bench-wrap' }, bench.canvas),
  el('label', { class: 'nr-temp' }, el('span', { class: 'mono' }, 'temperature T '), temp), benchOut,
  el('div', { class: 'lab-actions' },
    el('button', { type: 'button', class: 'btn', onclick: () => nudge(0, 0.1) }, '↑'), el('button', { type: 'button', class: 'btn', onclick: () => nudge(0, -0.1) }, '↓'),
    el('button', { type: 'button', class: 'btn', onclick: () => nudge(-0.1, 0) }, '←'), el('button', { type: 'button', class: 'btn', onclick: () => nudge(0.1, 0) }, '→')));
const end = el('section', { class: 'nr-end', hidden: true });
stage.root.append(chrome, tabs, seedLine, prompt, casePanel, benchPanel, end);

for (const [i, name] of ['Case files', 'Q·K workbench'].entries()) {
  tabs.append(el('button', { type: 'button', role: 'tab', 'aria-selected': String(i === 0), class: `mag-tab${i === 0 ? ' is-active' : ''}`, onclick: () => setTab(i) }, name));
}
function setTab(i: number): void {
  tabs.querySelectorAll('.mag-tab').forEach((t, j) => { t.classList.toggle('is-active', i === j); t.setAttribute('aria-selected', String(i === j)); });
  casePanel.hidden = i !== 0; prompt.hidden = i !== 0; benchPanel.hidden = i !== 1;
  if (i === 1) { bench.resize(benchPanel.clientWidth || 520); renderBench(); } else renderCase();
}

const total = () => caseScore + benchScore;
function renderChrome(): void {
  clear(score);
  score.append('CASE ', el('strong', {}, String(Math.min(round + 1, 5))), el('span', { class: 'scale-score-sep' }, '/'), '5',
    el('span', { class: 'scale-score-sep' }, ' · '), 'SCORE ', el('strong', {}, String(total())), el('span', { class: 'scale-score-sep' }, '/'), '200');
}

function renderChips(): void {
  clear(chips);
  lineup.forEach((h, i) => {
    const revealed = phase === 'done';
    chips.append(el('button', { type: 'button', role: 'radio', 'aria-checked': String(i === headIdx), class: `attn-chip${i === headIdx ? ' is-active' : ''}`, onclick: () => pickHead(i), title: revealed ? h.role : 'unknown head' },
      tag(i), revealed ? el('span', { class: 'nr-role' }, ` ${h.role}`) : ''));
  });
  const h = lineup[headIdx]!;
  headNote.textContent = phase === 'done' ? `${tag(headIdx)} is the ${h.role} head: ${h.blurb}.` : `${tag(headIdx)}: role unknown. Interrogate it.`;
}

function renderCase(): void {
  const c = cases[round]!;
  prompt.textContent = phase === 'which-head'
    ? `> FOLLOW-UP: which head is the coreference head? Pick it from the line-up (+10).`
    : `> CASE [${round + 1}/5]: "${c.text}" Which word does "${c.tokens[c.pronoun]}" refer to?`;
  const rows = attention(c, lineup[headIdx]!);
  const weights = rows[query]!;
  clear(words);
  const cards = c.tokens.map((t, i) => {
    const b = el('button', { type: 'button', class: 'attn-word', 'aria-label': `${t}${i === query ? ' (looking from here)' : ''}: ${(weights[i]! * 100).toFixed(0)}% attention`, onclick: () => clickWord(i) }, t);
    if (i === c.pronoun) b.classList.add('is-query');
    if (c.candidates.includes(i)) b.dataset.cand = 'true';
    if (i === query && i !== c.pronoun) b.classList.add('is-focus');
    if (phase !== 'call' && i === c.answer) b.classList.add('is-answer');
    const top = weights.indexOf(Math.max(...weights));
    if (i === top && i !== query) b.classList.add('is-top');
    words.append(el('li', {}, b, el('span', { class: 'attn-w mono', 'aria-hidden': 'true' }, i === query ? '·' : `${Math.round(weights[i]! * 100)}`)));
    return b;
  });
  requestAnimationFrame(() => drawStrings(arcs, wrap, cards, query, weights));
  renderChips();
  renderChrome();
}

function pickHead(i: number): void {
  if (phase === 'which-head') { answerHead(i); return; }
  headIdx = i;
  renderCase();
}

function clickWord(i: number): void {
  if (phase !== 'call') return;
  const c = cases[round]!;
  if (c.candidates.includes(i) && query === i) return; // second tap on a candidate is handled by name button
  query = i;
  renderCase();
}

function nameSuspect(i: number): void {
  const c = cases[round]!;
  if (phase !== 'call' || !c.candidates.includes(i)) return;
  const right = i === c.answer;
  if (right) caseScore += 20;
  log.push(right ? '🔎' : '❄️');
  phase = 'which-head';
  query = c.pronoun;
  reveal.className = `lab-reveal ${right ? 'is-hit' : 'is-miss'}`;
  clear(reveal);
  const msg = `${right ? 'Right.' : 'Wrong suspect.'} "${c.tokens[c.pronoun]}" means "${c.tokens[c.answer]!.replace(/[.,]/g, '')}": the word "${c.cue}" decides it. Now find the head that knew.`;
  reveal.append(el('p', { class: 'mono' }, `> ${msg}`));
  reveal.hidden = false;
  announce(msg);
  renderCase();
}

function answerHead(i: number): void {
  const right = lineup[i]!.role === 'coreference';
  if (right) caseScore += 10;
  phase = 'done';
  headIdx = lineup.findIndex((h) => h.role === 'coreference');
  const last = round === 4;
  reveal.append(el('p', { class: 'lab-reveal-why' }, right ? `${tag(i)} is the coreference head. +10.` : `${tag(i)} is the ${lineup[i]!.role} head. The coreference head was ${tag(headIdx)}.`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal nr-next', onclick: () => (last ? finish() : nextCase()) }, last ? 'Close the files →' : 'Next case →')));
  announce(right ? 'Correct head.' : 'Wrong head.');
  renderCase();
}

function nextCase(): void {
  round++;
  phase = 'call';
  query = cases[round]!.pronoun;
  reveal.hidden = true;
  renderCase();
}

// Answer controls: "Name the suspect" appears for the currently selected candidate.
const nameBtn = el('button', { type: 'button', class: 'btn btn-signal nr-name' }, 'Name the suspect');
nameBtn.addEventListener('click', () => {
  const c = cases[round]!;
  const pick = c.candidates.includes(query) ? query : null;
  if (pick === null) { announce('Tap one of the two candidate nouns first.'); prompt.textContent = `> Tap one of the candidates (“${c.tokens[c.candidates[0]]}” or “${c.tokens[c.candidates[1]]}”) first, then name the suspect.`; return; }
  nameSuspect(pick);
});
casePanel.insertBefore(el('div', { class: 'lab-actions' }, nameBtn), reveal);

// ---- Workbench ------------------------------------------------------------------------------
function nudge(dx: number, dy: number): void { bench.q = [bench.q[0] + dx, bench.q[1] + dy]; renderBench(); }
function renderBench(): void {
  const T = Number(temp.value);
  const keys: [number, number][] = [[0.9, 0.9], [-1.1, 0.4], [0.2, -1.2], [-0.5, -0.8]];
  const w = qkWeights(bench.q, keys, T);
  bench.draw(w);
  const goal = w[1]! >= 0.7 && T >= 1;
  benchOut.textContent = `T = ${T.toFixed(2)} · suitcase ${(w[1]! * 100).toFixed(0)}% · ${goal ? 'goal met' : 'goal: ≥ 70% on suitcase at T ≥ 1'}`;
  if (goal && benchScore === 0) { benchScore = 50; announce('Workbench goal met: +50.'); renderChrome(); }
}
temp.addEventListener('input', renderBench);

function finish(): void {
  phase = 'done';
  const best = load<number | null>('noir-best', null);
  if (best === null || total() > best) save('noir-best', total());
  const share = `Null Overflow · Attention Lens ${today}: ${total()}/200 ${log.join('')}${benchScore ? ' 🧪' : ''}`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(end);
  end.append(el('p', { class: 'mono nr-end-kicker' }, 'Case closed'), el('h4', { class: 'nr-end-score' }, `${total()} / 200`),
    el('p', {}, `${benchScore ? 'Workbench solved.' : 'The Q·K workbench is still open for +50.'} ${best === null ? 'First file closed on this device.' : `Best on this device: ${Math.max(best, total())}.`}`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'Reopen today’s files'), copy));
  end.hidden = false;
  announce(`Case closed: ${total()} of 200.`);
}

onKeys({ Enter: () => (phase === 'call' ? nameBtn.click() : (reveal.querySelector('.nr-next') as HTMLButtonElement | null)?.click()) });
new ResizeObserver(() => { if (!casePanel.hidden) renderCase(); if (!benchPanel.hidden) { bench.resize(benchPanel.clientWidth); renderBench(); } }).observe(stage.root);
renderCase();
stage.ready();
