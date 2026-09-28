// Club metadata for the UI: which optimiser, its dials, and the update rule shown in the maths panel.
import type { Club, Params } from './sim/optimizers';

export interface Dial { key: keyof Params; label: string; min: number; max: number; log: boolean; step: number }

export interface ClubInfo {
  id: Club;
  name: string;
  optimizer: string;
  key: string;
  colour: string;
  defaults: Params;
  dials: Dial[];
  rule: string;
}

const LR: Dial = { key: 'lr', label: 'learning rate η', min: 1e-4, max: 3, log: true, step: 0.01 };

export const CLUBS: ClubInfo[] = [
  { id: 'sgd', name: 'Putter', optimizer: 'SGD', key: '1', colour: '#ffffff', defaults: { lr: 0.05 }, dials: [LR],
    rule: 'p ← p − η·∇f(p)' },
  { id: 'momentum', name: 'Iron', optimizer: 'Momentum', key: '2', colour: '#f2b233', defaults: { lr: 0.02, beta: 0.9 },
    dials: [LR, { key: 'beta', label: 'momentum β', min: 0, max: 0.99, log: false, step: 0.01 }],
    rule: 'v ← β·v − η·∇f(p) · p ← p + v' },
  { id: 'nesterov', name: 'Wedge', optimizer: 'Nesterov', key: '3', colour: '#7fd1ff', defaults: { lr: 0.02, beta: 0.9 },
    dials: [LR, { key: 'beta', label: 'momentum β', min: 0, max: 0.99, log: false, step: 0.01 }],
    rule: 'v ← β·v − η·∇f(p + β·v) · p ← p + v' },
  { id: 'rmsprop', name: 'Hybrid', optimizer: 'RMSProp', key: '4', colour: '#ff8fb1', defaults: { lr: 0.05, rho: 0.9 },
    dials: [LR, { key: 'rho', label: 'decay ρ', min: 0.5, max: 0.999, log: false, step: 0.001 }],
    rule: 's ← ρ·s + (1−ρ)·g² · p ← p − η·g / √s' },
  { id: 'adam', name: 'Driver', optimizer: 'Adam', key: '5', colour: '#e07a1f', defaults: { lr: 0.1, beta1: 0.9, beta2: 0.999 },
    dials: [LR, { key: 'beta1', label: 'β₁', min: 0, max: 0.99, log: false, step: 0.01 }, { key: 'beta2', label: 'β₂', min: 0.9, max: 0.9999, log: false, step: 0.0001 }],
    rule: 'm ← β₁m + (1−β₁)g · v ← β₂v + (1−β₂)g² · p ← p − η·m̂/√v̂' },
];

export const clubInfo = (id: Club): ClubInfo => CLUBS.find((c) => c.id === id)!;
