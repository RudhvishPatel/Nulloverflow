// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadModel, forward, saliency, centre } from '../../labs/11-darkroom/sim/cnn';

const model = loadModel(JSON.parse(readFileSync(new URL('../../../assets/lab/11/data/cnn.json', import.meta.url), 'utf8')));
const fx = JSON.parse(readFileSync(new URL('./fixtures.json', import.meta.url), 'utf8')) as { pixels: string[]; labels: number[]; logits: number[][] };
const decode = (b64: string) => Float32Array.from(Buffer.from(b64, 'base64'), (v) => v / 255);

describe('CNN inference', () => {
  test('matches the PyTorch int8 model on 20 fixture digits (argmax and logits)', () => {
    fx.pixels.forEach((p, i) => {
      const out = forward(model, decode(p));
      const ref = fx.logits[i]!;
      expect(out.logits.indexOf(Math.max(...out.logits))).toBe(ref.indexOf(Math.max(...ref)));
      out.logits.forEach((v, k) => expect(Math.abs(v - ref[k]!)).toBeLessThan(0.05));
    });
  });
  test('exposes feature maps: 8 × 26×26 after conv1 and 16 × 11×11 after conv2', () => {
    const out = forward(model, decode(fx.pixels[0]!));
    expect(out.maps1).toHaveLength(8);
    expect(out.maps1[0]).toHaveLength(26 * 26);
    expect(out.maps2).toHaveLength(16);
    expect(out.maps2[0]).toHaveLength(11 * 11);
    expect(out.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });
  test('saliency is the gradient of the class logit with respect to the input', () => {
    // Flat MNIST regions create exact ties inside max-pool windows, where the gradient is
    // undefined; a tiny seeded jitter breaks ties so the check tests the backprop itself.
    let seed = 1;
    const x = decode(fx.pixels[1]!).map((v) => { seed = (seed * 16807) % 2147483647; return v + (seed / 2147483647) * 2e-2; });
    const cls = fx.labels[1]!;
    const g = saliency(model, x, cls);
    for (const k of [300, 350, 406, 460]) {
      const h = 5e-4, up = Float32Array.from(x), down = Float32Array.from(x);
      up[k] = up[k]! + h; down[k] = down[k]! - h;
      const numeric = (forward(model, up).logits[cls]! - forward(model, down).logits[cls]!) / (2 * h);
      expect(Math.abs(numeric - g[k]!)).toBeLessThan(1e-2 * Math.max(1, Math.abs(numeric)));
    }
  });
});

describe('centre (MNIST-style preprocessing)', () => {
  test('scales a drawing into a 20×20 box and centres it by mass in 28×28', () => {
    const raw = new Float32Array(28 * 28);
    for (let y = 2; y < 8; y++) for (let x = 2; x < 5; x++) raw[y * 28 + x] = 1; // small blob, top-left
    const c = centre(raw);
    let mx = 0, my = 0, m = 0;
    c.forEach((v, i) => { mx += (i % 28) * v; my += Math.floor(i / 28) * v; m += v; });
    expect(mx / m).toBeGreaterThan(12.5); expect(mx / m).toBeLessThan(15.5);
    expect(my / m).toBeGreaterThan(12.5); expect(my / m).toBeLessThan(15.5);
  });
  test('an empty canvas stays empty', () => {
    expect(centre(new Float32Array(784)).every((v) => v === 0)).toBe(true);
  });
});
