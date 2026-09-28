// Dev helper: drive one lab into its "played" state and screenshot. Usage: node play.mjs 04
import { chromium } from 'playwright';
const n = process.argv[2];
const ACTIONS = {
  '10': async (p) => { await p.waitForSelector('.cs-option'); await p.click('.cs-option >> nth=0'); await p.waitForTimeout(2200); },
  '11': async (p) => { await p.waitForFunction(() => document.querySelectorAll('.dk-print').length > 0); const b = await p.locator('.dk-pad').boundingBox(); await p.mouse.move(b.x + b.width * .3, b.y + b.height * .25); await p.mouse.down(); await p.mouse.move(b.x + b.width * .72, b.y + b.height * .25, { steps: 6 }); await p.mouse.move(b.x + b.width * .45, b.y + b.height * .8, { steps: 8 }); await p.mouse.up(); await p.check('.dk-toggle input'); await p.waitForTimeout(1200); },
  '12': async (p) => { for (let i = 0; i < 4; i++) { await p.click('.ar-train'); await p.waitForTimeout(400); } await p.click('.ar-run'); await p.waitForTimeout(3500); },
  '09': async (p) => { await p.click('.fd-play'); await p.waitForTimeout(5000); },
  '08': async (p) => { await p.click('.attn-chip >> nth=9'); await p.click('.attn-word[data-cand] >> nth=1'); await p.waitForTimeout(400); },
  '07': async (p) => { await p.check('.at-toggle input >> nth=0'); await p.click('.at-cvbtn'); await p.waitForTimeout(2600); await p.click('.at-lock'); await p.waitForTimeout(500); },
  '06': async (p) => { await p.click('.lab-game-panel .btn-signal'); await p.waitForTimeout(4000); },
  '05': async (p) => { const t = p.locator('.ops-controls .ops-toggle'); for (const i of [4, 17]) await t.nth(i).click(); await p.fill('.sg-waf-input', "union\\s+select|'\\s*or\\s+1=1"); await p.click('.sg-launch'); await p.waitForTimeout(1800); },
  '03': async (p) => { await p.fill('.bu-slider', '62'); await p.dispatchEvent('.bu-slider', 'input'); await p.waitForTimeout(400); },
  '02': async (p) => { await p.click('.mag-lock'); await p.waitForTimeout(2000); },
  '01': async (p) => { await p.click('.scale-card >> nth=1'); await p.click('.arena-nudge >> nth=3'); await p.click('.arena-lock'); await p.waitForTimeout(3500); },
  '04': async (p) => { for (const i of [0, 2, 3, 4, 6, 11, 13, 15]) await p.click(`.fg-palette .forge-toggle >> nth=${i}`); await p.click('.fg-strike'); await p.waitForSelector('.fg-tree .fg-node', { timeout: 20000 }); await p.waitForTimeout(500); },
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(`http://127.0.0.1:8081/lab/${n}/`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
await ACTIONS[n](p);
await p.screenshot({ path: `shots/${n}-played.png`, fullPage: true });
await b.close();
