// Round scoring: your locked model's test error against the best model in a search grid,
// minus a point for every training sample bought beyond the base set.
import { fit, mse, type ModelSpec } from './models';
import type { makeData } from './models';

export const BASE_N = 14;
export const MAX_N = 60;

export function lockScore(yourTest: number, bestTest: number, n: number): number {
  const ratio = Math.min(1, bestTest / Math.max(yourTest, 1e-12));
  return Math.max(0, Math.round(100 * ratio) - Math.max(0, n - BASE_N));
}

export function searchGrid(): ModelSpec[] {
  const grid: ModelSpec[] = [];
  for (let degree = 1; degree <= 15; degree++) for (const lambda of [0, 1e-3, 1e-2, 1e-1, 1]) grid.push({ family: 'poly', degree, lambda });
  for (let k = 1; k <= 20; k++) grid.push({ family: 'knn', k });
  for (let depth = 1; depth <= 6; depth++) grid.push({ family: 'tree', depth });
  return grid;
}

export function bestTestError(d: ReturnType<typeof makeData>): { spec: ModelSpec; error: number } {
  let best = { spec: searchGrid()[0]!, error: Infinity };
  for (const spec of searchGrid()) {
    const e = mse(fit(d.train, spec), d.test);
    if (e < best.error) best = { spec, error: e };
  }
  return best;
}
