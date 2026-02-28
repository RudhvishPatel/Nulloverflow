import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { transformSync } from 'esbuild';

const dir = 'dist/js';
const files = readdirSync(dir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const path = `${dir}/${file}`;
  const code = readFileSync(path, 'utf8');
  const { code: minified } = transformSync(code, { minify: true, loader: 'js' });
  writeFileSync(path, minified);
  const saved = code.length - minified.length;
  console.log(`  ${file}: ${code.length} → ${minified.length} bytes (saved ${saved})`);
}
