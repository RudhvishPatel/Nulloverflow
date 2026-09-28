# Lab Engine v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the 8 labs as complex showcase games and add 4 real-ML labs on a small standalone engine, then deploy after QA and the user's go-ahead.

**Architecture:** `labs/` (TypeScript + Vite) builds one static page per lab into `lab/NN/index.html` with hashed bundles in `assets/lab/NN/`. Pages keep the site `<head>` so the `lab-themes` CSS (themes, intros, exit tab) applies unchanged. Pure `sim/` code is unit-tested; rendering is Canvas 2D, plus three.js for 3D labs.

**Tech Stack:** TypeScript 5, Vite 6, Vitest, three.js (3D labs only), Playwright + axe (existing harness), Lighthouse.

**Spec:** `docs/superpowers/specs/2026-09-27-lab-engine-v2-design.md`

**Execution:** Native (the user asked to proceed without stopping; per-lab progress updates in chat).

## Global Constraints

- Everything runs in the browser; no external origins; CSP unchanged (no WASM).
- 2D lab JS ≤ 80 KB gzip; 3D labs ≤ 250 KB gzip; data ≤ 6 MB per lab, lazy-loaded; LCP < 2.5 s.
- Each lab page keeps the site `<head>` (global CSS + `lab-themes.<hash>.css`) and uses the theme root class from the spec.
- Keyboard-playable; a DOM text readout for every canvas; score events announced; reduced motion turns off camera flights and loops.
- Hashed filenames for every JS/CSS/data asset (1-year immutable cache).
- Rebuilt labs delete `lab/NN/index.txt`; hub card links become plain `<a href="/lab/NN/">`.
- Game randomness comes from `dailySeed(labId)` only (the same course for everyone each day).
- No deploy until all 12 labs pass QA and the user says go.

## Review Focus

1. Visitor opens a lab with WebGL unavailable (old phone, blocked GPU) → the lab still plays in the 2D fallback. Test: harness launches Chromium with `--disable-webgl` for 06 and 10 (Tasks 3, 11).
2. `localStorage` throws (private mode, blocked storage) → the lab still plays; best score just isn't kept. Test: `store` unit test with a throwing storage stub (Task 1).
3. Tab hidden mid-animation, then shown → no huge `dt` jump or runaway physics. Test: `loop` unit test with a clamped dt (Task 1).
4. Pathological user input (lr = max on the cliff hole; a catastrophic regex in the WAF writer) → water hazard / a guarded timeout, never a hang or NaN on screen. Tests in Tasks 2 and 7.
5. Day rollover at UTC midnight while the page is open → the current round finishes with the seed it started with. Test: `seed` unit test (the seed is fixed at creation) (Task 1).

## File Structure

```
labs/package.json · vite.config.ts · tsconfig.json · vitest.config.ts
labs/core/{shell,loop,seed,store,quality,a11y,dom}.ts        + labs/tests/core/*.test.ts
labs/labs/NN-slug/{main.ts, page.html, lab.css, sim/*.ts, render/*.ts, ui/*.ts}
labs/tests/NN-slug/*.test.ts
labs/scripts/build-all.mjs      vite build per lab → lab/NN/index.html + assets/lab/NN/*, delete lab/NN/index.txt
labs/scripts/patch-hub.mjs      hub links → <a>, add cards 09–12 (idempotent)
labs/scripts/data/{glove.py, mnist.py}   offline data prep (Tasks 11, 12)
labs/DATA-LICENSES.md
tools/lab-themes/src/themes/{09-abyss,10-cosmos,11-darkroom,12-arcade}.css   (new themes)
tools/lab-themes/labs.mjs       extended to 12 labs + play actions
```

---

### Task 1: Engine core + build pipeline
**Produces:**
- `dailySeed(labId: string, date?: Date): number`
- `rng(seed: number): () => number`
- `load<T>(key: string, fallback: T): T`
- `save(key: string, v: unknown): void`
- `createLoop(update: (dt: number) => void, render: (alpha: number) => void): { start(): void; stop(): void }` with dt clamped to ≤ 0.1 s
- `detectTier(): 'high' | 'medium' | 'low'`
- `prefersReducedMotion(): boolean`
- `announce(text: string): void`
- `mountLab(opts: { root: string; title: string; kicker: string; lede: string; meta: string }): HTMLElement`

- [ ] Scaffold `labs/` (Vite multi-page, TS strict, Vitest jsdom).
- [ ] Write the failing tests:
  - `seed`: same inputs give the same seed; different lab or day gives a different seed; rng output lies in [0,1) and is deterministic.
  - `store`: round-trip works; a throwing `localStorage` returns the fallback and never throws.
  - `loop`: dt is clamped to 0.1 after a 5 s gap.
  - `quality`: the `?quality=low` override is honoured.
- [ ] Run `npx vitest run tests/core` → FAIL (modules missing).
- [ ] Implement the core modules.
- [ ] Run `npx vitest run tests/core` → PASS.
- [ ] `build-all.mjs`:
  - builds each lab's `page.html` with Vite;
  - injects the site `<head>` pieces copied from the lab's backed-up original page (charset, viewport, global CSS link, `lab-themes` link, title/meta description);
  - writes `lab/NN/index.html` and moves assets to `assets/lab/NN/`;
  - deletes `lab/NN/index.txt`.
- [ ] `patch-hub.mjs`: rewrites the hub RSC `["$","$L7",null,{"href":"/lab/NN"` → `["$","a",null,{"href":"/lab/NN/"` for NN = 01…12 in both `lab/index.html` (escaped form) and `lab/index.txt`; asserts 8 replacements the first time and idempotency after.
- [ ] Harness: add `/lab/` hub checks: all card links are plain anchors with a trailing slash; clicking one gives a full page load with no console errors.

### Task 2: Golf sim (surfaces, optimisers, course, scoring)
**Produces:**
- `Surface { id, name, f(x,y): number, grad(x,y): [number,number], bounds: [x0,x1,y0,y1], minima: [number,number][] }`
- `SURFACES: Surface[]` (12)
- `Club = 'sgd' | 'momentum' | 'nesterov' | 'rmsprop' | 'adam'`
- `shoot(surface, start: [number,number], club, params, steps, opts: { clip?: number; schedule?: 'const' | 'step' | 'cos'; noise?: () => number }): { path: [number,number][]; diverged: boolean }`
- `dealCourse(seed): Hole[]` (6)
- `holeResult(strokes, par): 'eagle' | 'birdie' | 'par' | 'bogey' | 'double+'`

- [ ] Failing tests:
  - Every surface's `grad` matches a central-difference numeric gradient within 1e-3 at 50 seeded points.
  - SGD on the bowl f = x² + y² with lr 0.1 contracts by exactly 0.8 per step.
  - Adam's first step equals −lr·sign(g) (bias-corrected).
  - Momentum with β = 0 equals SGD.
  - lr = 10 on the cliff without clipping → `diverged: true`; with `clip = 1` → finite.
  - The path never contains NaN (diverged is set instead).
  - `dealCourse(seed)` is deterministic, gives 6 distinct holes, and every tee lies within bounds.
- [ ] Run `npx vitest run tests/06-golf` → FAIL.
- [ ] Implement the sim.
- [ ] Run `npx vitest run tests/06-golf` → PASS.

### Task 3: Golf 3D render + UI + page (pilot)
- [ ] three.js scene:
  - terrain from `Surface` (log height), shader stripes + contours + colour ramp;
  - sky, fog, flag, ball, ribbon trail;
  - 4 ghost trails;
  - flyover and follow camera; OrbitControls.
- [ ] Canvas 2D fallback renderer with the same `Renderer` interface: `{ setHole(h), animateShot(path, ghosts), dispose() }`.
- [ ] UI: club picker (1–5), log-lr slider and dials, schedule/clip when unlocked, Shoot (Space), scorecard, maths panel, end card with copy-share, local best.
- [ ] Remove the canvas colour patch from `tools/lab-themes/build.mjs` (the old chunk is no longer used); the `.lab-golf` theme CSS is updated for the new DOM.
- [ ] Harness:
  - play-through (6 holes with the default club reaches the end card);
  - `--disable-webgl` fallback plays;
  - bundle ≤ 250 KB gzip;
  - median frame time ≤ 20 ms over 3 s at the high tier on desktop.
- [ ] Visual review: flyover filmstrip + played screenshot (desktop + phone).

### Tasks 4–10: Upgrade labs 01, 02, 03, 04, 05, 07, 08
Each: sim tests first (RED → GREEN), then render + UI, then the page; harness play-through; screenshots reviewed. Sim tests per lab:
- **01:** the catalogue has ≥ 120 entries with positive sizes; the ratio score is 100 on an exact guess, ~37 at one decade off; the deck is deterministic; boss rounds span ≥ 10 orders of magnitude.
- **02:** interval score matches a hand-computed fixture; calibration buckets are correct for a fixture set.
- **03:** ROC points and AUC match a hand fixture (AUC = 0.75 case); κ = 1 for identical raters and 0 for chance-level fixtures.
- **04:** the token budget rejects over-budget builds; each injection wave is blocked exactly when its defence rule is present; the version graph supports branch + rollback.
- **05:** each attack type is blocked only by its matching defence; the regex tester is guarded (catastrophic pattern `(a+)+$` on a 30-char input returns a timeout result in < 50 ms via length/complexity guard); the false-positive count is right on a fixture log.
- **07:** ridge closed form matches the normal-equation fixture; λ → ∞ gives a flat fit; k-fold splits partition the data; bootstrap fits are deterministic per seed.
- **08:** softmax rows sum to 1; temperature → 0 gives argmax; every Winograd case has exactly one correct antecedent per designated head.

### Tasks 11–14: New labs 09 Foundry, 10 Galaxy, 11 Vision, 12 RL
Each: theme + intro CSS (new root class added to the shared selector lists), sim tests, render, UI, page, hub card, harness play-through, screenshots.
- **09:** MLP gradients match numeric gradients (1e-4); XOR is learnt to 100 % within 2,000 steps (seeded).
- **10:** `glove.py` produces the int8 vectors + 3D coords file ≤ 4 MB; cosine kNN matches float reference top-5 on 20 queries; the analogy king − man + woman ranks "queen" in the top 3.
- **11:** `mnist.py` trains a 2-conv CNN offline (≥ 98 % test accuracy) and exports int8 weights ≤ 150 KB; TS inference matches Python logits (argmax on 20 fixtures, max abs diff < 0.05).
- **12:** Q-learning converges to the optimal policy on a 4×4 fixture MDP within 500 episodes (seeded); reward tiles alter the learnt path on the puzzle fixture.

### Task 15: Hub + full QA
- [ ] `patch-hub.mjs` adds cards 09–12; the hub harness shows 12 cards, soft nav into the hub renders, no hydration errors.
- [ ] Full harness across 12 labs; Lighthouse per lab → `QA.md`; filmstrips reviewed; final self-review (noted as such).

### Task 16: Deploy (gated)
- [ ] Build the package (site files + `assets/lab/**`).
- [ ] Show the QA summary; **wait for the user's explicit go**.
- [ ] Upload via SFTP (the user's key/credentials from `~/dev/ai-stack/secrets`, never printed), or hand over the tarball.
- [ ] Smoke test against the live URL: every lab returns 200, the theme applies, no console errors.
