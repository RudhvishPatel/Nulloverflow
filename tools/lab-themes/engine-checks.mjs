// Extra checks for labs rebuilt on the labs/ engine: full play-through, WebGL-off fallback,
// bundle budget, and (report-only) frame time. Used by check.mjs for labs with an entry here.
import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const SITE = new URL('../../', import.meta.url).pathname;

/** Per-lab: how to play one full session through the UI, and budgets. */
export const ENGINE = {
  '10': {
    budgetKB: 250,
    webgl: true,
    async playThrough(page) {
      await page.waitForSelector('.cs-option');
      for (let i = 0; i < 5; i++) {
        await page.click('.cs-option >> nth=0');
        if (i < 4) await page.click('.cs-next');
      }
      await page.fill('.cs-search', 'ocean');
      await page.click('.cs-fly');
      await page.waitForSelector('.cs-chip');
      return page.isVisible('.cs-end');
    },
  },
  '11': {
    budgetKB: 80,
    async playThrough(page) {
      await page.waitForFunction(() => document.querySelectorAll('.dk-print').length > 0);
      const box = await page.locator('.dk-pad').boundingBox();
      for (let i = 0; i < 5; i++) {
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.8, { steps: 8 });
        await page.mouse.up();
        await page.click('.dk-submit');
        await page.waitForTimeout(50);
      }
      await page.click('.mag-tab >> nth=1');
      for (let r = 0; r < 2; r++) {
        await page.waitForTimeout(50);
        const box = await page.locator('.dk-pad').boundingBox(); // layout shifts when the prompt wraps
        // Erase inked cells (read from the paper canvas) one by one until the model's answer flips.
        const inked = await page.evaluate(() => {
          const c = document.querySelector('.dk-pad'), d = c.getContext('2d').getImageData(0, 0, 280, 280).data, out = [];
          for (let i = 0; i < 784; i++) { const x = (i % 28) * 10 + 5, y = Math.floor(i / 28) * 10 + 5; if (d[(y * 280 + x) * 4] < 120) out.push(i); }
          return out;
        });
        const stroke = Array.from({ length: 20 }, (_, r) => (r + 4) * 28 + 14); // then draw a "1"
        for (const i of [...inked, ...stroke]) {
          if (await page.evaluate(() => /flipped!/.test(document.querySelector('.scale-prompt')?.textContent ?? ''))) break;
          await page.mouse.click(box.x + ((i % 28) + 0.5) * box.width / 28, box.y + (Math.floor(i / 28) + 0.5) * box.height / 28);
        }
        await page.click('.dk-submit');
        if (r === 0) await page.waitForFunction(() => /\[2\/2\].*Edits: 0\./.test(document.querySelector('.scale-prompt')?.textContent ?? ''));
      }
      return page.isVisible('.dk-end');
    },
  },
  '12': {
    budgetKB: 80,
    async playThrough(page) {
      for (let i = 0; i < 3; i++) {
        await page.click('.ar-train');
        await page.click('.ar-submit');
        await page.waitForSelector('.lab-reveal:not([hidden])');
        if (i < 2) await page.click('.ar-next');
      }
      return page.isVisible('.ar-end');
    },
  },
  '09': {
    budgetKB: 80,
    async playThrough(page) {
      for (let i = 0; i < 3; i++) {
        await page.click('.fd-submit');
        if (i < 2) await page.click('.fd-next');
      }
      return page.isVisible('.fd-end');
    },
  },
  '08': {
    budgetKB: 80,
    async playThrough(page) {
      for (let i = 0; i < 5; i++) {
        await page.click('.attn-word[data-cand] >> nth=0');
        await page.click('.nr-name');
        await page.click('.attn-chip >> nth=8');
        await page.click('.nr-next');
      }
      return page.isVisible('.nr-end');
    },
  },
  '07': {
    budgetKB: 80,
    async playThrough(page) {
      for (let i = 0; i < 3; i++) {
        await page.click('.at-lock');
        if (i < 2) await page.click('.at-next');
      }
      return page.isVisible('.at-end');
    },
  },
  '05': {
    budgetKB: 80,
    async playThrough(page) {
      await page.fill('.sg-waf-input', "union\\s+select|'\\s*or\\s+1=1");
      for (let i = 0; i < 3; i++) { await page.click('.sg-launch:not([disabled])'); await page.waitForTimeout(100); }
      return page.isVisible('.sg-end');
    },
  },
  '04': {
    budgetKB: 80,
    async playThrough(page) {
      for (const i of [0, 2, 3, 4, 6, 11]) await page.click(`.fg-palette .forge-toggle >> nth=${i}`);
      await page.click('.fg-strike');
      await page.waitForSelector('.fg-tree .fg-node');
      await page.click('.fg-seal');
      return page.isVisible('.fg-end');
    },
  },
  '03': {
    budgetKB: 80,
    async playThrough(page) {
      await page.click('.bu-ship');
      await page.click('.bu-to-rubric');
      for (let i = 0; i < 20; i++) {
        if (await page.isVisible('.bu-end')) return true;
        if (await page.isVisible('.bu-next')) await page.click('.bu-next');
        else await page.click('.lab-btn-amber >> nth=0');
        await page.waitForTimeout(60);
      }
      return page.isVisible('.bu-end');
    },
  },
  '02': {
    budgetKB: 80,
    async playThrough(page) {
      for (let i = 0; i < 30; i++) {
        if (await page.isVisible('.bp-end')) return true;
        if (await page.isVisible('.bp-next')) await page.click('.bp-next');
        else await page.click('.mag-lock');
        await page.waitForTimeout(80);
      }
      return page.isVisible('.bp-end');
    },
  },
  '01': {
    budgetKB: 80,
    async playThrough(page) {
      for (let i = 0; i < 40; i++) {
        if (await page.isVisible('.scale-done')) return true;
        if (await page.isVisible('.arena-next')) await page.click('.arena-next');
        else { await page.click('.arena-nudge >> nth=3'); await page.click('.arena-lock'); }
        await page.waitForTimeout(80);
      }
      return page.isVisible('.scale-done');
    },
  },
  '06': {
    budgetKB: 250,
    webgl: true,
    async playThrough(page) {
      for (let i = 0; i < 80; i++) {
        if (await page.isVisible('.golf-end')) return true;
        if (await page.isVisible('.golf-next')) await page.click('.golf-next');
        else await page.click('.golf-shoot:not([disabled])');
        await page.waitForTimeout(60);
      }
      return page.isVisible('.golf-end');
    },
  },
};

export async function bundleKB(n) {
  const dir = join(SITE, 'assets/lab', n);
  let total = 0;
  for (const f of await readdir(dir)) if (f.endsWith('.js')) total += gzipSync(await readFile(join(dir, f)), { level: 9 }).length;
  return total / 1024;
}

export async function runEngineChecks(browser, BASE, lab, result) {
  const e = ENGINE[lab.n];
  if (!e) return;
  const tag = `lab/${lab.n} ${lab.slug}`;

  // Full session through the UI; reduced motion makes every shot resolve instantly.
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${BASE}/lab/${lab.n}/`);
  await page.waitForSelector(`.${lab.root} .lab-loading`, { state: "detached" }); // the lab signalled ready
  const done = await e.playThrough(page);
  result(`${tag} full play-through reaches the end card`, done);
  result(`${tag} no errors during play-through`, errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();

  if (e.webgl) {
    const noGl = await browser.browserType().launch({ args: ['--disable-webgl', '--disable-webgl2'] });
    const p2 = await noGl.newPage();
    await p2.emulateMedia({ reducedMotion: 'reduce' });
    await p2.goto(`${BASE}/lab/${lab.n}/`);
    await p2.waitForSelector(`.${lab.root}[data-renderer]`);
    const kind = await p2.getAttribute(`.${lab.root}`, 'data-renderer');
    result(`${tag} WebGL off falls back to 2D`, kind === '2d', `renderer=${kind}`);
    const played = await e.playThrough(p2);
    result(`${tag} 2D fallback plays a full session`, played);
    await noGl.close();

    // Report-only: headless renders WebGL in software, so this is not a real-GPU number.
    const p3 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await p3.goto(`${BASE}/lab/${lab.n}/?quality=high`);
    await p3.waitForTimeout(3500);
    const ms = await p3.evaluate(() => new Promise((res) => {
      const t = []; let last = performance.now();
      const f = (now) => { t.push(now - last); last = now; t.length < 90 ? requestAnimationFrame(f) : res(t.sort((a, b) => a - b)[45]); };
      requestAnimationFrame(f);
    }));
    console.log(`NOTE  ${tag} median frame ${ms.toFixed(1)} ms in headless software WebGL (real GPUs are much faster)`);
    await p3.close();
  }

  const kb = await bundleKB(lab.n);
  result(`${tag} JS bundle ≤ ${e.budgetKB} KB gzip`, kb <= e.budgetKB, `${kb.toFixed(1)} KB`);
}
