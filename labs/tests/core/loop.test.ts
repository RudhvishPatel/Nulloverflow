import { expect, test, vi } from 'vitest';
import { createLoop, STEP } from '../../core/loop';

test('runs fixed steps and clamps a long gap (hidden tab) to at most 0.1 s of updates', () => {
  let now = 0;
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.push(cb); return frames.length; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  let updates = 0;
  const loop = createLoop(() => { updates++; }, () => {}, () => now);
  loop.start();
  now = 1000 / 60; frames.shift()!(now);
  expect(updates).toBe(1);
  updates = 0;
  now += 5000; frames.shift()!(now);          // 5 s gap
  expect(updates).toBe(Math.round(0.1 / STEP)); // clamped
  loop.stop();
  vi.unstubAllGlobals();
});
