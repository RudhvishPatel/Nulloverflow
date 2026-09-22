/**
 * MAGNITUDE RUN — client-only silhouette calibration puzzles.
 * Original first-party content for Null Overflow. Not affiliated with Magnitudle.
 */

export type MagnitudeMode = "size" | "pop" | "geo";

export type SilhouetteSubject = {
  name: string;
  heightMeters: number;
  /** Inline SVG path(s) in a 0..100 × 0..100 viewBox, feet at y=100 */
  silhouette: string;
};

export type MagnitudePuzzle = {
  id: string;
  mode: MagnitudeMode;
  reference: SilhouetteSubject;
  target: SilhouetteSubject;
  unitLabel: string;
};

export const MODE_META: Record<
  MagnitudeMode,
  { label: string; code: string; blurb: string }
> = {
  size: { label: "Size", code: "SIZE", blurb: "Physical silhouette calibration" },
  pop: { label: "Pop Culture", code: "POP", blurb: "Iconic props & figures" },
  geo: { label: "Geography", code: "GEO", blurb: "Landmarks & earth features" },
};

/** Original CRT silhouettes — recognizable profiles in viewBox 0 0 100 100, feet/base at y≈100. */
export const SIL_PATHS = {
  person:
    "M50 6c7 0 12 5 12 12s-5 12-12 12-12-5-12-12 5-12 12-12zm-16 30h10l2 8h8l2-8h10l-3 20-4 38H41l-4-38-3-20zm-2 58h36v6H32v-6z",
  child:
    "M50 14c6 0 10 4 10 10s-4 10-10 10-10-4-10-10 4-10 10-10zm-12 26h8l2 6h8l2-6h8l-2 16-3 34H41l-3-34-2-16zm0 50h24v6H38v-6z",
  egg: "M50 4C68 4 82 28 82 54c0 22-14 42-32 42S18 76 18 54C18 28 32 4 50 4z",
  cat: "M18 44l10-22 8 10 8-14 8 14 8-10 10 22v6c0 8-2 14-6 20l4 18H20l4-18c-4-6-6-12-6-20v-6zm14 40c2.5 0 4.5 2 4.5 4.5S34.5 93 32 93s-4.5-2-4.5-4.5S29.5 84 32 84zm28 0c2.5 0 4.5 2 4.5 4.5S62.5 93 60 93s-4.5-2-4.5-4.5S57.5 84 60 84z",
  dog: "M14 48c0-12 10-22 22-22h10l8-14 10 10 6-6 8 12v10c14 2 20 16 20 34H16c0-12 0-20-2-24zm52 36h14v14H66V84zm-40 0c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z",
  whale:
    "M4 58c2-16 22-28 48-28 18 0 32 4 40 12l8-10 2 16-6 4c0 14-18 28-44 28S6 72 4 58zm62-6c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5zM78 42l14-8v10L82 50z",
  elephant:
    "M28 36c2-16 16-28 34-28 14 0 26 8 30 20l8-6v18l-6 6c2 10 0 24-4 40H30c-4-14-4-28-2-40zm-16 18c-8 2-12 10-12 18v20h10V74c0-6 2-10 6-12zm48 40c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm-32 0c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z",
  tree: "M50 2c6 4 22 18 26 34 4 14-2 26-12 32H36C26 62 20 50 24 36 28 20 44 6 50 2zm-8 66h16v32H42V68z",
  car: "M6 64 L14 48 C16 44 20 40 26 40 L40 40 L48 28 L70 28 L80 40 L90 48 L96 64 L96 74 L88 74 L86 80 L78 84 L70 80 L68 74 L30 74 L28 80 L20 84 L12 80 L10 74 L6 74 Z M30 46 h14 v10 H30 z M52 46 h16 v10 H52 z M18 76 a5 5 0 1 0 0.1 0 Z M76 76 a5 5 0 1 0 0.1 0 Z",
  /** Single-deck city bus — sloped front, window ribbon, wheel arches */
  bus: "M4 36 L12 24 L86 24 L96 34 L96 68 L88 68 L86 74 L78 78 L70 74 L68 68 L28 68 L26 74 L18 78 L10 74 L8 68 L4 68 Z M16 32 h12 v12 H16 z M32 32 h12 v12 H32 z M48 32 h12 v12 H48 z M64 32 h14 v12 H64 z M16 70 a6 6 0 1 0 0.1 0 Z M76 70 a6 6 0 1 0 0.1 0 Z",
  /** Articulated bus — side profile: nose/windshield, bellows, rear coach, wheel arches */
  articulatedBus:
    "M4 52 L4 38 L10 28 L40 28 L40 36 L46 32 L52 36 L52 28 L88 28 L94 34 L96 52 L96 68 L88 68 L86 74 L78 78 L70 74 L68 68 L54 68 L52 74 L44 78 L36 74 L34 68 L20 68 L18 74 L10 78 L6 74 L4 68 Z M12 36 h8 v10 h-8 z M24 36 h10 v10 h-10 z M58 36 h10 v10 h-10 z M72 36 h12 v10 h-12 z M14 70 a6 6 0 1 0 0.1 0 Z M42 70 a6 6 0 1 0 0.1 0 Z M78 70 a6 6 0 1 0 0.1 0 Z",
  tower:
    "M44 2h12l6 16H38L44 2zm-10 16h32l2 10H32l2-10zm-6 10h44l6 68H22L28 28zm14 16h16v10H42V44zm0 20h16v10H42V64zm6 28h8v8h-8v-8z",
  pyramid: "M50 6L94 96H6L50 6zm0 20L30 88h40L50 26z",
  arch: "M18 96V36C18 16 32 2 50 2s32 14 32 34v60H68V40c0-12-8-20-18-20S32 28 32 40v56H18z",
  mountain: "M4 96L32 24l16 28 14-24 34 68H4zm42-28l10-16 20 36H40l12-20z",
  building:
    "M24 4h52v92H24V4zm8 10h12v12H32V14zm20 0h12v12H52V14zm-20 22h12v12H32V36zm20 0h12v12H52V36zm-20 22h12v12H32V58zm20 0h12v12H52V58zm-8 28h20v14H44V86z",
  bridge:
    "M2 68h96v8H2v-8zm6-28c14 18 30 28 42 28s28-10 42-28v14C78 72 62 84 50 84S22 72 8 54V40zM16 96h10V76H16v20zm58 0h10V76H74v20z",
  statue:
    "M50 4c6 0 11 5 11 11S56 26 50 26 39 21 39 15 44 4 50 4zM30 32h40l-6 18 10 42H26l10-42-6-18zm-8 60h56v6H22v-6z",
  rocket:
    "M50 2c12 14 16 32 16 52H34C34 34 38 16 50 2zM28 58h10v18l-14 16 4-34zm24 0h10l4 34-14-16V58zM40 94h20v6H40v-6z",
  guitar:
    "M46 2h8v40l10 8c10 8 10 26-2 34s-26 4-34-8 0-26 10-34l8-8V2zm4 58c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z",
  camera:
    "M18 38h14l8-12h20l8 12h14c7 0 12 5 12 12v26c0 7-5 12-12 12H18c-7 0-12-5-12-12V50c0-7 5-12 12-12zm32 10c9 0 16 7 16 16s-7 16-16 16-16-7-16-16 7-16 16-16z",
  globe:
    "M50 4c25 0 46 21 46 46S75 96 50 96 4 75 4 50 25 4 50 4zm0 8c-9 11-14 24-14 38s5 27 14 38c9-11 14-24 14-38S59 23 50 12zM12 46h76v8H12v-8z",
  island:
    "M8 72c12-22 32-34 42-34s30 12 42 34v24H8V72zm32-36c0-9 7-16 16-16 5 0 8 2 10 5-3 7-9 11-16 11-5 0-10 0-10 0z",
} as const;

const P: typeof SIL_PATHS = SIL_PATHS;

export const MAGNITUDE_PUZZLES: MagnitudePuzzle[] = [
  // —— SIZE ——
  {
    id: "sz-egg-person",
    mode: "size",
    reference: { name: "Large hen egg", heightMeters: 0.06, silhouette: P.egg },
    target: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    unitLabel: "m",
  },
  {
    id: "sz-cat-person",
    mode: "size",
    reference: { name: "House cat", heightMeters: 0.25, silhouette: P.cat },
    target: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    unitLabel: "m",
  },
  {
    id: "sz-person-elephant",
    mode: "size",
    reference: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    target: { name: "African elephant (shoulder)", heightMeters: 3.2, silhouette: P.elephant },
    unitLabel: "m",
  },
  {
    id: "sz-person-whale",
    mode: "size",
    reference: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    target: { name: "Blue whale (length as height)", heightMeters: 25, silhouette: P.whale },
    unitLabel: "m",
  },
  {
    id: "sz-dog-car",
    mode: "size",
    reference: { name: "Medium dog", heightMeters: 0.55, silhouette: P.dog },
    target: { name: "Compact car", heightMeters: 1.45, silhouette: P.car },
    unitLabel: "m",
  },
  {
    id: "sz-child-bus",
    mode: "size",
    reference: { name: "Child", heightMeters: 1.1, silhouette: P.child },
    target: { name: "City bus", heightMeters: 3.2, silhouette: P.bus },
    unitLabel: "m",
  },
  {
    id: "sz-tree-building",
    mode: "size",
    reference: { name: "Mature oak", heightMeters: 20, silhouette: P.tree },
    target: { name: "10-story building", heightMeters: 35, silhouette: P.building },
    unitLabel: "m",
  },
  {
    id: "sz-person-tree",
    mode: "size",
    reference: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    target: { name: "Coast redwood (typical)", heightMeters: 80, silhouette: P.tree },
    unitLabel: "m",
  },
  {
    id: "sz-car-truck",
    mode: "size",
    reference: { name: "Sedan", heightMeters: 1.45, silhouette: P.car },
    target: { name: "Articulated bus", heightMeters: 3.4, silhouette: P.articulatedBus },
    unitLabel: "m",
  },
  {
    id: "sz-egg-cat",
    mode: "size",
    reference: { name: "Large hen egg", heightMeters: 0.06, silhouette: P.egg },
    target: { name: "House cat", heightMeters: 0.25, silhouette: P.cat },
    unitLabel: "m",
  },

  // —— POP CULTURE ——
  {
    id: "pop-person-statue",
    mode: "pop",
    reference: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    target: { name: "Liberty torch figure (stub)", heightMeters: 46, silhouette: P.statue },
    unitLabel: "m",
  },
  {
    id: "pop-guitar-person",
    mode: "pop",
    reference: { name: "Electric guitar", heightMeters: 1.0, silhouette: P.guitar },
    target: { name: "Stage performer", heightMeters: 1.8, silhouette: P.person },
    unitLabel: "m",
  },
  {
    id: "pop-camera-person",
    mode: "pop",
    reference: { name: "Cinema camera body", heightMeters: 0.25, silhouette: P.camera },
    target: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    unitLabel: "m",
  },
  {
    id: "pop-rocket-building",
    mode: "pop",
    reference: { name: "Sound-stage tower stub", heightMeters: 12, silhouette: P.tower },
    target: { name: "Launch vehicle stub", heightMeters: 55, silhouette: P.rocket },
    unitLabel: "m",
  },
  {
    id: "pop-car-bus",
    mode: "pop",
    reference: { name: "Movie prop car", heightMeters: 1.4, silhouette: P.car },
    target: { name: "Tour bus", heightMeters: 3.5, silhouette: P.bus },
    unitLabel: "m",
  },
  {
    id: "pop-child-rocket",
    mode: "pop",
    reference: { name: "Child cosplay", heightMeters: 1.2, silhouette: P.child },
    target: { name: "Theme-park rocket", heightMeters: 18, silhouette: P.rocket },
    unitLabel: "m",
  },
  {
    id: "pop-egg-camera",
    mode: "pop",
    reference: { name: "Prop egg", heightMeters: 0.12, silhouette: P.egg },
    target: { name: "Hand camera", heightMeters: 0.22, silhouette: P.camera },
    unitLabel: "m",
  },
  {
    id: "pop-dog-statue",
    mode: "pop",
    reference: { name: "Studio dog", heightMeters: 0.6, silhouette: P.dog },
    target: { name: "Plaza statue stub", heightMeters: 4.5, silhouette: P.statue },
    unitLabel: "m",
  },
  {
    id: "pop-guitar-tower",
    mode: "pop",
    reference: { name: "Guitar", heightMeters: 1.0, silhouette: P.guitar },
    target: { name: "Broadcast tower stub", heightMeters: 40, silhouette: P.tower },
    unitLabel: "m",
  },
  {
    id: "pop-person-arch",
    mode: "pop",
    reference: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    target: { name: "Set archway", heightMeters: 9, silhouette: P.arch },
    unitLabel: "m",
  },

  // —— GEOGRAPHY ——
  {
    id: "geo-person-pyramid",
    mode: "geo",
    reference: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    target: { name: "Pyramid of Khufu (height)", heightMeters: 138.5, silhouette: P.pyramid },
    unitLabel: "m",
  },
  {
    id: "geo-building-tower",
    mode: "geo",
    reference: { name: "Office block", heightMeters: 40, silhouette: P.building },
    target: { name: "Observation tower stub", heightMeters: 300, silhouette: P.tower },
    unitLabel: "m",
  },
  {
    id: "geo-tree-mountain",
    mode: "geo",
    reference: { name: "Tall tree", heightMeters: 30, silhouette: P.tree },
    target: { name: "Local peak stub", heightMeters: 1200, silhouette: P.mountain },
    unitLabel: "m",
  },
  {
    id: "geo-person-arch",
    mode: "geo",
    reference: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    target: { name: "Gateway arch stub", heightMeters: 192, silhouette: P.arch },
    unitLabel: "m",
  },
  {
    id: "geo-car-bridge",
    mode: "geo",
    reference: { name: "Passenger car", heightMeters: 1.5, silhouette: P.car },
    target: { name: "Suspension tower stub", heightMeters: 180, silhouette: P.bridge },
    unitLabel: "m",
  },
  {
    id: "geo-island-globe",
    mode: "geo",
    reference: { name: "Islet stub (scaled)", heightMeters: 50, silhouette: P.island },
    target: { name: "Globe diameter stub", heightMeters: 12742, silhouette: P.globe },
    unitLabel: "km (scaled)",
  },
  {
    id: "geo-building-mountain",
    mode: "geo",
    reference: { name: "Skyscraper stub", heightMeters: 200, silhouette: P.building },
    target: { name: "Alpine ridge stub", heightMeters: 4000, silhouette: P.mountain },
    unitLabel: "m",
  },
  {
    id: "geo-statue-pyramid",
    mode: "geo",
    reference: { name: "Plaza statue", heightMeters: 10, silhouette: P.statue },
    target: { name: "Step pyramid stub", heightMeters: 60, silhouette: P.pyramid },
    unitLabel: "m",
  },
  {
    id: "geo-bus-tower",
    mode: "geo",
    reference: { name: "Coach bus", heightMeters: 3.5, silhouette: P.bus },
    target: { name: "Bell tower stub", heightMeters: 85, silhouette: P.tower },
    unitLabel: "m",
  },
  {
    id: "geo-person-bridge",
    mode: "geo",
    reference: { name: "Adult human", heightMeters: 1.7, silhouette: P.person },
    target: { name: "Deck clearance stub", heightMeters: 60, silhouette: P.bridge },
    unitLabel: "m",
  },
];

const ROUNDS_PER_RUN = 5;
/** log error at which score hits 0 (≈ factor of e^logMaxError) */
export const LOG_MAX_ERROR = Math.log(10); // one decade → 0

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG from a 32-bit seed */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function puzzlesForMode(mode: MagnitudeMode): MagnitudePuzzle[] {
  return MAGNITUDE_PUZZLES.filter((p) => p.mode === mode);
}

/**
 * Deterministic daily run: hash(dateKey::mode) seeds a shuffle, take first 5.
 */
export function dailyRun(mode: MagnitudeMode, dateKey: string): MagnitudePuzzle[] {
  const bank = [...puzzlesForMode(mode)];
  const rng = mulberry32(hashString(`${dateKey}::${mode}::magnitude-run`));
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank.slice(0, Math.min(ROUNDS_PER_RUN, bank.length));
}

/** @deprecated single-puzzle helper — prefer dailyRun */
export function dailyPuzzle(mode: MagnitudeMode, dateKey: string): MagnitudePuzzle {
  return dailyRun(mode, dateKey)[0];
}

export function formatMagnitude(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (abs >= 10) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (abs >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

export type GuessScore = {
  score: number;
  offByPct: number;
};

/**
 * Compare guessed height to actual.
 * score = max(0, round(100 * (1 - |ln(guess/actual)| / LOG_MAX_ERROR)))
 * 100 = perfect; ~0 when off by an order of magnitude.
 */
export function scoreGuess(guessHeight: number, actualHeight: number): GuessScore {
  const g = Math.max(guessHeight, Number.EPSILON);
  const a = Math.max(actualHeight, Number.EPSILON);
  const logErr = Math.abs(Math.log(g / a));
  const score = Math.max(0, Math.round(100 * (1 - logErr / LOG_MAX_ERROR)));
  const offByPct = Math.round(Math.abs(g / a - 1) * 1000) / 10; // one decimal
  return { score, offByPct };
}

export const RUN_ROUNDS = ROUNDS_PER_RUN;
