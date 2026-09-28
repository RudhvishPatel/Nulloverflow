// Dev helper: capture each lab's intro at fixed times and tile them into shots/intro-<n>.png
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { LABS } from './labs.mjs';
const TIMES = [60, 300, 500, 700, 900, 1150];
const b = await chromium.launch();
for (const l of LABS) {
  const p = await b.newPage({ viewport: { width: 960, height: 600 } });
  await p.goto(`http://127.0.0.1:8081/lab/${l.n}/`, { waitUntil: 'commit' });
  await p.waitForSelector(`.${l.root}`);
  const t0 = Date.now();
  const files = [];
  for (const t of TIMES) {
    const wait = t - (Date.now() - t0);
    if (wait > 0) await p.waitForTimeout(wait);
    const f = `shots/_f-${l.n}-${t}.png`; await p.screenshot({ path: f }); files.push(f);
  }
  execFileSync(`${process.env.HOME}/miniconda3/bin/python`, ['-c', `
import sys; from PIL import Image
fs=sys.argv[1:-1]; ims=[Image.open(f).resize((320,200)) for f in fs]
out=Image.new('RGB',(320*3+8,200*2+4),'white')
for i,im in enumerate(ims): out.paste(im,((i%3)*324,(i//3)*204))
out.save(sys.argv[-1])`, ...files, `shots/intro-${l.n}.png`]);
  await p.close();
}
await b.close();
