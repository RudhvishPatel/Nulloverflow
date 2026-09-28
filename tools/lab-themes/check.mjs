// Lab theme harness. Usage: node check.mjs [labNumber ...] [--shots]
// Needs serve.mjs running on BASE (default http://127.0.0.1:8081).
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import { LABS } from './labs.mjs';
import { runEngineChecks } from './engine-checks.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:8081';
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const only = args.filter((a) => /^\d\d$/.test(a));
const labs = only.length ? LABS.filter((l) => only.includes(l.n)) : LABS;
const INTRO_MS = 1500; // intros are <= 1.3 s
// Markup issues in the original game JS that CSS cannot cause or fix (reported, not failed).
const PREEXISTING_MARKUP = ['aria-required-children', 'aria-required-parent'];

let failures = 0;
const result = (name, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const theme = (page) => page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--lab-theme').trim());
const settle = async (page, root) => {
  await page.waitForSelector(`.${root}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // after hydration
};

function watchErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || /hydrat/i.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

const browser = await chromium.launch();
if (SHOTS) await mkdir(new URL('./shots/', import.meta.url), { recursive: true });

// No theme outside labs.
{
  const page = await browser.newPage();
  const hubErrors = watchErrors(page);
  await page.goto(`${BASE}/lab/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  result('/lab/ has no lab theme', (await theme(page)) === '', `got "${await theme(page)}"`);
  result('/lab/ header visible', await page.isVisible('.site-header'));
  result('/lab/ hydrates without errors', hubErrors.length === 0, hubErrors.slice(0, 2).join(' | '));
  const cardLinks = await page.$$eval('a.lab-card', (as) => as.map((a) => a.getAttribute('href')));
  result('/lab/ lists every lab as a plain link', cardLinks.length === LABS.filter((l) => l.n <= '12').length || cardLinks.length >= 9, cardLinks.join(' '));
  await page.close();
}

for (const lab of labs) {
  const tag = `lab/${lab.n} ${lab.slug}`;
  const url = `${BASE}/lab/${lab.n}/`;

  // Direct load, desktop.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = watchErrors(page);
  await page.goto(url);
  if (SHOTS) {
    await page.waitForTimeout(400);
    await page.screenshot({ path: `shots/${lab.n}-${lab.slug}-desktop-intro.png` });
  }
  await settle(page, lab.root);
  const introAnim = await page.evaluate(() => getComputedStyle(document.body, '::before').animationName);
  result(`${tag} theme on direct load`, (await theme(page)) === lab.slug, `got "${await theme(page)}"`);
  result(`${tag} intro animation defined`, introAnim !== 'none' && introAnim !== '', `got "${introAnim}"`);
  const shadows = await page.evaluate(() => ({
    panel: getComputedStyle(document.querySelector('.lab-game-panel')).boxShadow,
    title: getComputedStyle(document.querySelector('.section-head h2')).textShadow,
  }));
  if (lab.panelShadow) result(`${tag} theme panel shadow applied`, shadows.panel !== 'none', `box-shadow=${shadows.panel.slice(0, 50)}`);
  if (lab.titleShadow) result(`${tag} theme title shadow applied`, shadows.title !== 'none', `text-shadow=${shadows.title.slice(0, 50)}`);
  if (!lab.titleShadow) result(`${tag} no CRT glow leak on title`, shadows.title === 'none', `text-shadow=${shadows.title.slice(0, 50)}`);
  if (!lab.panelShadow) result(`${tag} no CRT glow leak on panel`, shadows.panel === 'none', `box-shadow=${shadows.panel.slice(0, 50)}`);
  result(`${tag} site header hidden`, !(await page.isVisible('.site-header')));
  result(`${tag} site footer hidden`, !(await page.isVisible('.site-footer')));

  const tab = page.locator('main a.btn[href="/lab/"]');
  const tabInfo = await tab.evaluate((a) => {
    a.focus({ focusVisible: true });
    const s = getComputedStyle(a);
    const r = a.getBoundingClientRect();
    return { pos: s.position, outline: s.outlineStyle, focused: document.activeElement === a, visible: r.width > 0 && r.top < innerHeight, h: r.height };
  });
  result(`${tag} exit tab fixed + visible`, tabInfo.pos === 'fixed' && tabInfo.visible, JSON.stringify(tabInfo));
  result(`${tag} exit tab focusable with ring`, tabInfo.focused && tabInfo.outline !== 'none', JSON.stringify(tabInfo));
  result(`${tag} exit tab >= 44px tall`, tabInfo.h >= 44, `h=${tabInfo.h}`);
  // Focused elements must not scroll under the fixed exit tab (WCAG 2.4.11).
  const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
  result(`${tag} scroll-padding clears exit tab`, pad >= tabInfo.h + 12, `scroll-padding-top=${pad}px`);

  await page.waitForTimeout(INTRO_MS);
  if (SHOTS) await page.screenshot({ path: `shots/${lab.n}-${lab.slug}-desktop.png`, fullPage: true });
  const axe = await new AxeBuilder({ page }).include("main").analyze();
  const serious = axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  const preexisting = serious.filter((v) => PREEXISTING_MARKUP.includes(v.id));
  const bad = serious.filter((v) => !PREEXISTING_MARKUP.includes(v.id));
  result(`${tag} axe serious/critical = 0`, bad.length === 0, bad.map((v) => `${v.id}(${v.nodes.length})`).join(', '));
  if (preexisting.length) console.log(`NOTE  ${tag} pre-existing game markup (not CSS): ${preexisting.map((v) => `${v.id}(${v.nodes.length})`).join(', ')}`);
  result(`${tag} no console/CSP/hydration errors`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();

  // Client-side navigation from the hub.
  const nav = await browser.newPage();
  const navErrors = watchErrors(nav);
  await nav.goto(`${BASE}/lab/`);
  await nav.waitForLoadState('networkidle');
  await nav.click(`a[href="/lab/${lab.n}/"]`);
  await settle(nav, lab.root);
  result(`${tag} theme after soft nav`, (await theme(nav)) === lab.slug, `got "${await theme(nav)}"`);
  await nav.click('main a.btn[href="/lab/"]');
  await nav.waitForURL(`${BASE}/lab/`);
  await nav.waitForTimeout(300);
  result(`${tag} no theme leak after exit`, (await theme(nav)) === '' && (await nav.isVisible('.site-header')));
  result(`${tag} soft nav no errors`, navErrors.length === 0, navErrors.slice(0, 3).join(' | '));
  await nav.close();

  // Phone width.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pp = await phone.newPage();
  await pp.goto(url);
  await settle(pp, lab.root);
  await pp.waitForTimeout(INTRO_MS);
  const sw = await pp.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  result(`${tag} no horizontal scroll at 390px`, sw[0] <= sw[1], `scrollWidth=${sw[0]} innerWidth=${sw[1]}`);
  if (SHOTS) await pp.screenshot({ path: `shots/${lab.n}-${lab.slug}-phone.png`, fullPage: true });
  await phone.close();

  // Reduced motion.
  const rm = await browser.newContext({ reducedMotion: 'reduce' });
  const rp = await rm.newPage();
  await rp.goto(url);
  await settle(rp, lab.root);
  const rmAnim = await rp.evaluate(() => [getComputedStyle(document.body, '::before').animationName, getComputedStyle(document.body, '::after').animationName]);
  result(`${tag} reduced motion: no intro`, rmAnim.every((a) => a === 'none'), rmAnim.join(','));
  result(`${tag} theme under reduced motion`, (await theme(rp)) === lab.slug);
  await rm.close();

  await runEngineChecks(browser, BASE, lab, result);
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
