// Pick a rendering tier once per page load. `?quality=high|medium|low` overrides.
export type Tier = 'high' | 'medium' | 'low';

export function hasWebGL2(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

export function detectTier(): Tier {
  const forced = new URLSearchParams(location.search).get('quality');
  if (forced === 'high' || forced === 'medium' || forced === 'low') return forced;
  if (!hasWebGL2()) return 'low';
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const small = Math.min(innerWidth, innerHeight) < 500;
  if (cores <= 4 || memory <= 4) return small ? 'low' : 'medium';
  return small ? 'medium' : 'high';
}

export function pixelRatio(tier: Tier): number {
  const cap = tier === 'high' ? 2 : tier === 'medium' ? 1.5 : 1;
  return Math.min(devicePixelRatio || 1, cap);
}
