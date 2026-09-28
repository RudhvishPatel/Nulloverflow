// lab/04 Prompt Forge: build a system prompt from token-costed blocks, run today's scripted
// regression suite and three red-team waves, and keep a version history with rollback.
import { announce, onKeys, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { Anvil } from './render/anvil';
import { BLOCKS, BUDGET, blockById, tokens, type Kind } from './sim/blocks';
import { History, MAX_VERSIONS, diffLines } from './sim/history';
import { dealDay, evaluate, type Evaluation } from './sim/judge';
import './lab.css';

const stage = mountLab('lab-forge');
const seed = dailySeed('04');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);
const day = dealDay(seed);
const history = new History();

let mould: string[] = [];
let busy = false;

// ---- DOM -------------------------------------------------------------------------------
const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/04 · prompt-forge · budget · red team · versions'), score);
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · 8 regression tests · 3 red-team waves · ${BUDGET}-token budget`);
const prompt = el('p', { class: 'scale-prompt mono' }, '> FORGE: pick blocks for the mould, order them, and strike. Tokens are limited: you cannot take everything.');
const anvil = new Anvil(reduced);
const lights = el('div', { class: 'forge-lights-row', 'aria-label': 'Regression tests' });
const meter = el('div', { class: 'fg-meter', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': BUDGET, 'aria-label': 'Token budget' }, el('span', { class: 'fg-meter-fill' }), el('span', { class: 'fg-meter-text mono' }));
const palette = el('ol', { class: 'forge-blocks fg-palette' });
const mouldList = el('ol', { class: 'forge-blocks fg-mould' });
const strikeBtn = el('button', { type: 'button', class: 'btn btn-signal fg-strike' }, 'Strike → v1');
const sealBtn = el('button', { type: 'button', class: 'btn fg-seal' }, 'Seal best version');
const diff = el('pre', { class: 'forge-diff', 'aria-label': 'Prompt diff against the previous version' });
const suite = el('ol', { class: 'forge-tests' });
const attacksList = el('ol', { class: 'forge-tests fg-attacks' });
const tree = el('ol', { class: 'fg-tree', 'aria-label': 'Version history' });
const result = el('p', { class: 'fg-result', 'aria-live': 'polite' });
const end = el('section', { class: 'fg-end', hidden: true });

const KIND_LABEL: Record<Kind, string> = { role: 'role', rule: 'rule', example: 'example', defence: 'defence' };

stage.root.append(chrome, seedLine, prompt,
  el('div', { class: 'lab-stage forge-stage' },
    el('div', { class: 'fg-anvil-wrap' }, anvil.canvas),
    lights,
    el('div', { class: 'forge-cols' },
      el('div', { class: 'forge-palette' }, el('h4', { class: 'lab-subhead mono' }, 'Ingot rack'), palette),
      el('div', { class: 'forge-out' },
        el('h4', { class: 'lab-subhead mono' }, 'The mould (your prompt, top to bottom)'), meter, mouldList,
        el('div', { class: 'lab-actions' }, strikeBtn, sealBtn), result,
        el('h4', { class: 'lab-subhead mono' }, 'Diff'), diff,
        el('h4', { class: 'lab-subhead mono' }, 'Regression suite'), suite,
        el('h4', { class: 'lab-subhead mono' }, 'Red-team waves'), attacksList,
        el('h4', { class: 'lab-subhead mono' }, 'Versions (click to roll back)'), tree))),
  end);

// ---- Rendering ---------------------------------------------------------------------------
function renderChrome(): void {
  clear(score);
  const best = history.best;
  score.append('VERSION ', el('strong', {}, String(history.versions.length)), el('span', { class: 'scale-score-sep' }, '/'), String(MAX_VERSIONS),
    el('span', { class: 'scale-score-sep' }, ' · '), 'BEST ', el('strong', {}, String(best?.score ?? 0)), el('span', { class: 'scale-score-sep' }, '/'), '100');
}

function renderLights(ev: Evaluation | null): void {
  clear(lights);
  day.tests.forEach((t, i) => {
    const r = ev?.tests.find((x) => x.id === t.id);
    const state = !r ? 'idle' : r.pass ? 'pass' : 'fail';
    const l = el('div', { class: `forge-light is-${state}`, title: t.name }, el('span', { class: 'forge-bulb', 'aria-hidden': 'true' }), el('span', { class: 'forge-light-n mono' }, `T${i + 1}`), el('span', { class: 'sr-only' }, `${t.name}: ${state}`));
    l.style.setProperty('--i', String(i));
    lights.append(l);
  });
}

function renderMeter(): void {
  const t = tokens(mould), over = t > BUDGET;
  (meter.firstChild as HTMLElement).style.width = `${Math.min(100, (t / BUDGET) * 100)}%`;
  meter.classList.toggle('is-over', over);
  meter.setAttribute('aria-valuenow', String(t));
  (meter.lastChild as HTMLElement).textContent = `${t} / ${BUDGET} tokens${over ? ' · over budget' : ''}`;
  strikeBtn.disabled = over || mould.length === 0 || history.full || busy;
}

function renderPalette(): void {
  clear(palette);
  for (const b of BLOCKS) {
    const on = mould.includes(b.id);
    const li = el('li', { class: `forge-block${on ? ' is-on' : ''}` },
      el('button', { type: 'button', class: 'forge-toggle', 'aria-pressed': String(on), onclick: () => toggle(b.id) },
        el('span', { class: 'forge-kind mono' }, KIND_LABEL[b.kind]), el('span', { class: 'forge-label' }, b.label), el('span', { class: 'forge-state mono' }, `${b.tokens}t`)));
    li.dataset.kind = b.kind;
    palette.append(li);
  }
}

function renderMould(): void {
  clear(mouldList);
  if (!mould.length) mouldList.append(el('li', { class: 'fg-empty mono' }, 'Empty. Pick ingots from the rack.'));
  mould.forEach((id, i) => {
    const b = blockById(id);
    const li = el('li', { class: 'forge-block is-on fg-mould-item', draggable: 'true' },
      el('span', { class: 'forge-toggle fg-mould-label' }, el('span', { class: 'forge-kind mono' }, KIND_LABEL[b.kind]), el('span', { class: 'forge-label' }, b.label), el('span', { class: 'forge-state mono' }, `${b.tokens}t`)),
      el('button', { type: 'button', class: 'forge-move', 'aria-label': `Move ${b.label} up`, disabled: i === 0, onclick: () => move(i, -1) }, '↑'),
      el('button', { type: 'button', class: 'forge-move', 'aria-label': `Move ${b.label} down`, disabled: i === mould.length - 1, onclick: () => move(i, 1) }, '↓'),
      el('button', { type: 'button', class: 'forge-move', 'aria-label': `Remove ${b.label}`, onclick: () => toggle(id) }, '✕'));
    // Drag to reorder.
    li.addEventListener('dragstart', (e) => { e.dataTransfer?.setData('text/plain', String(i)); li.classList.add('is-dragging'); });
    li.addEventListener('dragend', () => li.classList.remove('is-dragging'));
    li.addEventListener('dragover', (e) => e.preventDefault());
    li.addEventListener('drop', (e) => {
      e.preventDefault();
      const from = Number(e.dataTransfer?.getData('text/plain'));
      if (Number.isNaN(from) || from === i) return;
      const [x] = mould.splice(from, 1);
      mould.splice(i, 0, x!);
      refresh();
    });
    mouldList.append(li);
  });
}

function renderDiff(prev: string[], next: string[]): void {
  clear(diff);
  const a = prev.map((id) => blockById(id).text), b = next.map((id) => blockById(id).text);
  const ops = diffLines(a, b);
  if (!ops.length) diff.append('  (no blocks yet)');
  for (const o of ops) diff.append(el('span', { class: `forge-diff-line is-${o.op === 'same' ? 'same' : o.op}` }, `${o.op === 'add' ? '+' : o.op === 'del' ? '−' : ' '} ${o.text}\n`));
}

function renderResults(ev: Evaluation): void {
  clear(suite);
  day.tests.forEach((t, i) => {
    const r = ev.tests.find((x) => x.id === t.id)!;
    suite.append(el('li', { class: r.pass ? 'is-pass' : 'is-fail' }, el('span', { class: 'mono' }, `T${i + 1} `), t.name, r.pass ? '' : el('span', { class: 'forge-needs' }, ` · needs ${t.needs}`)));
  });
  clear(attacksList);
  ev.attacks.forEach((a, i) => {
    attacksList.append(el('li', { class: a.blocked ? 'is-pass' : 'is-fail' },
      el('span', { class: 'mono' }, `W${Math.floor(i / 3) + 1} `), a.name, ': ', el('strong', {}, a.blocked ? 'blocked' : 'BREACH'),
      el('span', { class: 'forge-needs' }, a.blocked ? '' : ` · stopped by “${blockById(a.defence).label}”`)));
  });
}

function renderTree(): void {
  clear(tree);
  const lanes = Math.max(1, ...history.versions.map((v) => v.lane + 1));
  tree.style.setProperty('--lanes', String(lanes));
  for (const v of history.versions) {
    const btn = el('button', { type: 'button', class: `fg-node${v.id === history.head ? ' is-head' : ''}${v.id === history.best?.id ? ' is-best' : ''}`, onclick: () => rollback(v.id), 'aria-label': `Version ${v.n}, score ${v.score}${v.parent ? `, from ${v.parent}` : ''}${v.id === history.head ? ', current' : ''}` },
      el('span', { class: 'mono' }, v.id), el('strong', {}, String(v.score)));
    const li = el('li', { class: 'fg-tree-row' }, btn, el('span', { class: 'fg-tree-meta mono' }, v.parent ? `from ${v.parent}` : 'root'));
    li.style.setProperty('--lane', String(v.lane));
    tree.append(li);
  }
}

function refresh(): void {
  renderPalette();
  renderMould();
  renderMeter();
  strikeBtn.textContent = history.full ? 'Forge is full' : `Strike → v${history.versions.length + 1}`;
}

// ---- Actions -----------------------------------------------------------------------------
function toggle(id: string): void {
  if (busy) return;
  mould = mould.includes(id) ? mould.filter((x) => x !== id) : [...mould, id];
  refresh();
}

function move(i: number, d: -1 | 1): void {
  const j = i + d;
  if (busy || j < 0 || j >= mould.length) return;
  [mould[i], mould[j]] = [mould[j]!, mould[i]!];
  refresh();
  (mouldList.children[j]?.querySelectorAll('button')[d < 0 ? 0 : 1] as HTMLButtonElement | undefined)?.focus();
}

function rollback(id: string): void {
  if (busy) return;
  const v = history.checkout(id);
  mould = [...v.blocks];
  refresh();
  renderTree();
  result.textContent = `Rolled back to ${v.id} (score ${v.score}). The next strike starts a new branch from here.`;
  announce(result.textContent);
}

async function strike(): Promise<void> {
  if (busy || history.full || !mould.length) return;
  busy = true;
  renderMeter();
  strikeBtn.textContent = 'Forging…';
  const prev = history.head ? history.get(history.head).blocks : [];
  const ev = evaluate(mould, day);
  const id = history.commit(mould, ev.score);
  renderDiff(prev, mould);
  const passRate = ev.tests.filter((t) => t.pass).length / ev.tests.length;
  await anvil.strike(passRate);
  renderLights(ev);
  for (let w = 0; w < 3; w++) await anvil.wave(ev.attacks.slice(w * 3, w * 3 + 3).map((a) => ({ name: a.name, blocked: a.blocked })));
  renderResults(ev);
  renderTree();
  renderChrome();
  const blocked = ev.attacks.filter((a) => a.blocked).length;
  result.textContent = `${id}: ${ev.tests.filter((t) => t.pass).length}/8 tests pass, ${blocked}/9 attacks blocked → ${ev.score}/100.`;
  announce(result.textContent);
  busy = false;
  refresh();
  if (history.full) seal();
}

function seal(): void {
  const best = history.best;
  if (!best) return;
  const prev = load<number | null>('forge-best', null);
  if (prev === null || best.score > prev) save('forge-best', best.score);
  const share = `Null Overflow · Prompt Forge ${today}: ${best.score}/100 in ${history.versions.length} versions (best ${best.id})`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(end);
  end.append(
    el('p', { class: 'mono fg-end-kicker' }, 'Sealed'),
    el('h4', { class: 'fg-end-score' }, `${best.id} · ${best.score} / 100`),
    el('p', {}, `Today's best in-budget prompt scores ${evaluate(day.solution, day).score}. ${prev === null ? 'First blade sealed on this device.' : `Your best on this device: ${Math.max(prev, best.score)}.`}`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'Reforge today’s order'), copy));
  end.hidden = false;
  announce(`Sealed ${best.id} at ${best.score} out of 100.`);
}

strikeBtn.addEventListener('click', () => void strike());
sealBtn.addEventListener('click', () => { if (!busy && history.versions.length) seal(); });
onKeys({ Enter: () => void strike() });

new ResizeObserver(() => anvil.resize(anvil.canvas.parentElement!.clientWidth)).observe(anvil.canvas.parentElement!);
anvil.resize(anvil.canvas.parentElement!.clientWidth || 760);
renderLights(null);
renderDiff([], []);
refresh();
renderChrome();
stage.ready();
