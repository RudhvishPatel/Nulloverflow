import { describe, expect, test } from 'vitest';
import { Net, type Activation } from '../../labs/09-foundry/sim/net';
import { makeDataset, DATASETS, accuracy } from '../../labs/09-foundry/sim/data';
import { rng } from '../../core/seed';

describe('Net', () => {
  test.each(['tanh', 'relu', 'gelu'] as Activation[])('%s: backprop gradients match numerical gradients', (act) => {
    const net = new Net([2, 5, 4, 1], act, rng(1));
    const xs = [[0.3, -0.7], [-0.2, 0.5], [0.9, 0.1]], ys = [1, 0, 1];
    const { grads } = net.lossAndGrads(xs, ys, 0.01);
    const h = 1e-4;
    let checked = 0;
    for (let l = 0; l < net.weights.length; l++) {
      for (const k of [0, 3, net.weights[l]!.length - 1]) {
        const w = net.weights[l]!;
        const orig = w[k]!;
        w[k] = orig + h; const up = net.lossAndGrads(xs, ys, 0.01).loss;
        w[k] = orig - h; const down = net.lossAndGrads(xs, ys, 0.01).loss;
        w[k] = orig;
        const numeric = (up - down) / (2 * h);
        expect(Math.abs(numeric - grads.w[l]![k]!)).toBeLessThan(1e-3 * Math.max(1, Math.abs(numeric)));
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(6);
  });

  test('learns XOR to 100 % within 2000 Adam steps (seeded)', () => {
    const d = makeDataset('xor', rng(4), 120, 0);
    const net = new Net([2, 6, 1], 'tanh', rng(2));
    for (let i = 0; i < 2000; i++) net.trainStep(d.train.x, d.train.y, { lr: 0.03, l2: 0, batch: 32, rand: rng(i) });
    expect(accuracy(net, d.train)).toBe(1);
  });

  test('parameter count is weights + biases', () => {
    expect(new Net([2, 4, 1], 'relu', rng(0)).params).toBe(2 * 4 + 4 + 4 * 1 + 1);
  });
});

describe('datasets', () => {
  test('six datasets, deterministic, two balanced-ish classes in [-1, 1]²', () => {
    expect(Object.keys(DATASETS)).toHaveLength(6);
    for (const id of Object.keys(DATASETS) as (keyof typeof DATASETS)[]) {
      const a = makeDataset(id, rng(9), 200, 0.05), b = makeDataset(id, rng(9), 200, 0.05);
      expect(a.train.x).toEqual(b.train.x);
      const ones = a.train.y.filter((v) => v === 1).length / a.train.y.length;
      expect(ones).toBeGreaterThan(0.2); expect(ones).toBeLessThan(0.8);
      for (const [x, y] of a.train.x) { expect(Math.abs(x!)).toBeLessThanOrEqual(1.2); expect(Math.abs(y!)).toBeLessThanOrEqual(1.2); }
    }
  });
});

describe('pars are achievable', () => {
  test.each(['circles', 'gaussians'] as const)('%s: the par architecture reaches ≥ 95 %% test accuracy', (id) => {
    const d = makeDataset(id, rng(101), 200, 0.04);
    const net = new Net([...DATASETS[id].arch], 'tanh', rng(1));
    expect(net.params).toBe(DATASETS[id].par);
    for (let i = 0; i < 4000; i++) net.trainStep(d.train.x, d.train.y, { lr: 0.03, l2: 0, batch: 32, rand: rng(i * 7 + 1) });
    expect(accuracy(net, d.test)).toBeGreaterThanOrEqual(0.95);
  }, 60000);
});

test('predictFast matches predict', () => {
  const net = new Net([2, 5, 3, 1], 'gelu', rng(3));
  for (const p of [[0.1, 0.2], [-0.9, 0.4], [0.7, -0.7]]) expect(net.predictFast(p[0]!, p[1]!)).toBeCloseTo(net.predict(p), 12);
});
