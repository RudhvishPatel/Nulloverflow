// lab/05 Secure ops: buy and upgrade defences per route, write a WAF regex, and hold the
// castle against three scripted waves of real attack traffic without turning away visitors.
import { announce, prefersReducedMotion } from '../../core/a11y';
import { clear, el } from '../../core/dom';
import { dailySeed } from '../../core/seed';
import { mountLab } from '../../core/shell';
import { load, save } from '../../core/store';
import { SiegeMap } from './render/map';
import { ATTACK_LABEL, DEFENCES, ROUTES, START_GOLD, WAVE_GOLD, cost, dealWaves, emptyConfig, runWave, scoreWave, type Config, type WaveResult } from './sim/siege';
import { compileWaf, type Waf } from './sim/waf';
import './lab.css';

const stage = mountLab('lab-ops');
const seed = dailySeed('05');
const reduced = prefersReducedMotion();
const today = new Date().toISOString().slice(0, 10);
const waves = dealWaves(seed);

const cfg: Config = emptyConfig();
let wave = 0;
let earned = START_GOLD;
let points = 0;
let busy = false;
let waf: Waf | null = null;
const totals = { blocked: 0, attacks: 0, fp: 0 };

// Intel for testing a WAF rule: representative lines from the kinds of traffic you'll face.
const INTEL: { line: string; attack: boolean }[] = [
  { line: "GET /api/contact?q=' OR 1=1-- HTTP/1.1", attack: true },
  { line: 'GET /api/contact?q=1 UNION SELECT password FROM users-- HTTP/1.1', attack: true },
  { line: "GET /api/contact?q=admin'-- HTTP/1.1", attack: true },
  { line: 'POST /api/contact body=<script>fetch("//evil.example")</script>', attack: true },
  { line: 'GET /api/export?url=http://169.254.169.254/latest/meta-data/iam/', attack: true },
  { line: 'GET /api/contact?q=pricing HTTP/1.1', attack: false },
  { line: "POST /api/contact body=What's the SLA for EU customers?", attack: false },
  { line: 'POST /login user=maria@acme.io', attack: false },
  { line: 'GET /?utm_source=newsletter HTTP/1.1', attack: false },
  { line: 'GET /api/export?format=csv HTTP/1.1', attack: false },
];

const score = el('span', { class: 'scale-score mono', 'aria-live': 'polite' });
const chrome = el('div', { class: 'scale-chrome' }, el('span', { class: 'mono' }, 'lab/05 · secure-ops · tower defence'), score);
const seedLine = el('p', { class: 'mono mag-seed' }, `> DAILY SEED ${today} · 3 waves · ${waves.reduce((a, w) => a + w.length, 0)} scripted requests`);
const prompt = el('p', { class: 'scale-prompt mono' });
const map = new SiegeMap();
const controls = el('div', { class: 'ops-controls', role: 'group', 'aria-label': 'Defences per route (click to cycle off → tier 1 → tier 2)' });
const wafInput = el('input', { type: 'text', class: 'sg-waf-input', spellcheck: 'false', autocomplete: 'off', placeholder: "e.g. union\\s+select|'\\s*or\\s+1=1", 'aria-label': 'WAF rule (regular expression, case-insensitive)' });
const wafStatus = el('p', { class: 'sg-waf-status mono', 'aria-live': 'polite' });
const intel = el('ul', { class: 'sg-intel' });
const launch = el('button', { type: 'button', class: 'btn btn-signal sg-launch' }, 'Launch wave 1');
const report = el('div', { class: 'lab-reveal', hidden: true });
const log = el('ol', { class: 'ops-log' });
const end = el('section', { class: 'sg-end', hidden: true });

stage.root.append(chrome, seedLine, prompt,
  el('div', { class: 'lab-stage ops-stage' }, el('div', { class: 'sg-map-wrap' }, map.canvas),
    el('p', { class: 'ops-legend mono' }, '● merchant (real visitor) · ◆ raider: S stuffing · D DDoS · X XSS · Q SQLi · C scraper · F SSRF · gate pips: rate · auth · CSP · vault (bigger = tier 2)')),
  el('div', { class: 'ops-row ops-row-head mono', 'aria-hidden': 'true' }, el('span', {}, 'route'), ...DEFENCES.map((d) => el('span', {}, `${d.name} · ${d.base}`))),
  controls,
  el('p', { class: 'ops-help' }, DEFENCES.map((d) => `${d.name}: ${d.stops}`).join(' · ')),
  el('section', { class: 'sg-waf' }, el('h4', { class: 'lab-subhead' }, 'WAF rule writer'), wafInput, wafStatus, intel),
  el('div', { class: 'lab-actions' }, launch),
  report, log, end);

const gold = () => earned - cost(cfg);

function renderChrome(): void {
  clear(score);
  score.append('WAVE ', el('strong', {}, String(Math.min(wave + 1, 3))), el('span', { class: 'scale-score-sep' }, '/'), '3',
    el('span', { class: 'scale-score-sep' }, ' · '), 'GOLD ', el('strong', {}, String(gold())),
    el('span', { class: 'scale-score-sep' }, ' · '), 'SCORE ', el('strong', {}, String(points)));
}

function renderControls(): void {
  clear(controls);
  for (const route of ROUTES) {
    const row = el('div', { class: 'ops-row' }, el('span', { class: 'ops-route mono' }, route));
    for (const d of DEFENCES) {
      const tier = cfg[route]![d.id]!;
      const next = (tier + 1) % 3;
      const trial = structuredClone(cfg); trial[route]![d.id] = next;
      const affordable = next === 0 || cost(trial) <= earned;
      row.append(el('button', {
        type: 'button', class: `ops-toggle${tier ? ' is-on' : ''}`, 'aria-pressed': String(tier > 0), disabled: busy || (!affordable && tier === 0),
        'aria-label': `${d.name} on ${route}: ${tier ? `tier ${tier}` : 'off'}. Click for ${next ? `tier ${next}` : 'off'}.`,
        onclick: () => { if (!affordable) return; cfg[route]![d.id] = next; renderAll(); },
      }, el('span', { class: 'ops-toggle-name' }, d.name), el('span', { class: 'ops-toggle-state mono' }, tier ? `tier ${tier}` : `+${d.base}`)));
    }
    controls.append(row);
  }
}

function renderWaf(): void {
  const src = wafInput.value;
  waf = src.trim() ? compileWaf(src) : null;
  clear(intel);
  if (!waf) { wafStatus.textContent = 'No WAF rule. SQL injection has no other counter.'; wafStatus.className = 'sg-waf-status mono'; }
  else if (!waf.ok) { wafStatus.textContent = `Rule refused: ${waf.reason}`; wafStatus.className = 'sg-waf-status mono is-bad'; }
  else {
    const hits = INTEL.filter((x) => waf!.test!(x.line));
    const fp = hits.filter((x) => !x.attack).length;
    wafStatus.textContent = `Rule active: catches ${hits.length - fp}/${INTEL.filter((x) => x.attack).length} intel attacks, ${fp} false positive${fp === 1 ? '' : 's'}.`;
    wafStatus.className = `sg-waf-status mono ${fp ? 'is-bad' : 'is-good'}`;
  }
  for (const x of INTEL) {
    const m = waf?.ok ? waf.test!(x.line) : false;
    intel.append(el('li', { class: `${x.attack ? 'is-attack' : 'is-visitor'}${m ? ' is-match' : ''}` }, el('span', { class: 'mono' }, x.attack ? 'attack  ' : 'visitor '), el('code', {}, x.line), m ? el('strong', {}, ' ← blocked') : ''));
  }
}

function renderAll(): void {
  renderChrome();
  renderControls();
  launch.textContent = wave < 3 ? `Launch wave ${wave + 1}` : 'Siege over';
  launch.disabled = busy || wave >= 3;
  if (!busy) map.draw(cfg);
}

function renderLog(results: WaveResult[]): void {
  clear(log);
  for (const r of results.filter((x) => x.request.kind !== 'visitor' || x.verdict.blocked)) {
    const k = r.request.kind;
    const cls = r.verdict.falsePositive ? 'is-blocked-benign' : r.verdict.blocked ? 'is-blocked' : 'is-breach';
    const what = r.verdict.falsePositive ? `turned away a real visitor (${r.verdict.by})` : r.verdict.blocked ? `blocked by ${r.verdict.by}` : 'BREACH';
    log.append(el('li', { class: cls }, `#${String(r.request.id).padStart(2, '0')} ${r.request.route} · ${ATTACK_LABEL[k]} · ${what}`));
  }
}

async function launchWave(): Promise<void> {
  if (busy || wave >= 3) return;
  busy = true;
  renderAll();
  const results = runWave(waves[wave]!, cfg, waf?.ok ? waf : null);
  prompt.textContent = `> WAVE ${wave + 1}: incoming…`;
  await map.play(results, cfg, reduced);
  const s = scoreWave(results);
  points += s.points;
  totals.blocked += s.blocked; totals.attacks += s.attacks; totals.fp += s.fp;
  clear(report);
  report.className = `lab-reveal ${s.breaches === 0 && s.fp === 0 ? 'is-hit' : 'is-miss'}`;
  const msg = `Wave ${wave + 1}: ${s.blocked}/${s.attacks} raiders stopped, ${s.breaches} breach${s.breaches === 1 ? '' : 'es'}, ${s.fp} real visitor${s.fp === 1 ? '' : 's'} turned away → ${s.points >= 0 ? '+' : ''}${s.points}.`;
  report.append(el('p', { class: 'mono' }, `> ${msg}`), el('p', { class: 'lab-reveal-why' }, wave < 2 ? `+${WAVE_GOLD} gold for the next wave. Read the incident log, then adjust.` : 'The siege is over.'));
  report.hidden = false;
  renderLog(results);
  announce(msg);
  wave++;
  if (wave < 3) earned += WAVE_GOLD;
  busy = false;
  renderAll();
  setPrompt();
  if (wave >= 3) finish();
}

function setPrompt(): void {
  prompt.textContent = wave >= 3 ? '> THE SIEGE IS OVER.' : `> PREPARE FOR WAVE ${wave + 1}: spend gold on defences per gate, write a WAF rule, then launch. Blocking a real visitor costs more than letting a raider through.`;
}

function finish(): void {
  const final = Math.max(0, Math.min(100, Math.round((100 * points) / (totals.attacks * 10))));
  const best = load<number | null>('siege-best', null);
  if (best === null || final > best) save('siege-best', final);
  const share = `Null Overflow · Secure ops ${today}: ${final}/100 · ${totals.blocked}/${totals.attacks} raiders stopped · ${totals.fp} visitors turned away`;
  const copy = el('button', { type: 'button', class: 'btn' }, 'Copy result');
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(share); copy.textContent = 'Copied ✓'; } catch { copy.textContent = 'Copy failed'; } });
  clear(end);
  end.append(
    el('p', { class: 'mono sg-end-kicker' }, 'The keep holds'),
    el('h4', { class: 'sg-end-score' }, `${final} / 100`),
    el('p', {}, `${totals.blocked} of ${totals.attacks} raiders stopped; ${totals.fp} real visitors turned away. ${best === null ? 'First siege on this device.' : `Best on this device: ${Math.max(best, final)}.`}`),
    el('div', { class: 'lab-actions' }, el('button', { type: 'button', class: 'btn btn-signal', onclick: () => location.reload() }, 'Defend today’s siege again'), copy));
  end.hidden = false;
  announce(`Siege over: ${final} out of 100.`);
}

wafInput.addEventListener('input', renderWaf);
launch.addEventListener('click', () => void launchWave());

new ResizeObserver(() => { map.resize(map.canvas.parentElement!.clientWidth); if (!busy) map.draw(cfg); }).observe(map.canvas.parentElement!);
map.resize(map.canvas.parentElement!.clientWidth || 760);
setPrompt();
renderWaf();
renderAll();
stage.ready();
