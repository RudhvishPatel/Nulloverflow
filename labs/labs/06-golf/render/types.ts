import type { Ghost, Hole } from '../sim/course';
import type { Vec2 } from '../sim/surfaces';

export interface ShotView {
  path: Vec2[];
  ghosts: Ghost[];
  hazard: boolean;
  holed: boolean;
  /** Skip camera moves and play the shot instantly (reduced motion). */
  instant: boolean;
}

/** What the game needs from a renderer; implemented by the 3D and the 2D fallback. */
export interface Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly kind: '3d' | '2d';
  setHole(hole: Hole, ball: Vec2, flyover: boolean): Promise<void>;
  playShot(view: ShotView): Promise<void>;
  placeBall(p: Vec2): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

/** Ghost trail colours, keyed by club. */
export const GHOST_COLOURS: Record<string, string> = {
  sgd: '#ffffff',
  momentum: '#f2b233',
  nesterov: '#7fd1ff',
  rmsprop: '#ff8fb1',
  adam: '#ff9a3d',
};

/** Frames per optimiser step when animating, capped so a long shot stays under ~2.4 s. */
export function shotDuration(steps: number): number {
  return Math.min(2.4, Math.max(0.8, steps / 60));
}
