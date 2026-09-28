// Dev helper: save each lab's rendered game markup to dom/<n>.html for theming reference.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { LABS } from './labs.mjs';
const b = await chromium.launch(); await mkdir('dom', { recursive: true });
for (const l of LABS) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://127.0.0.1:8081/lab/${l.n}/`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(600);
  const html = await p.$eval('main', (m) => m.outerHTML);
  await writeFile(`dom/${l.n}.html`, html.replace(/></g, '>\n<'));
  await p.screenshot({ path: `dom/${l.n}-before.png`, fullPage: true });
  await p.close();
}
await b.close();
