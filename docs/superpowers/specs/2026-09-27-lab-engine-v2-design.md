# Lab engine v2: 12 showcase labs (spec)

Date: 2026-09-27 · Status: approved in conversation (user: "go ahead and make all the changes"; deploy after all 12 labs are done) · Stacks: dev, web
Builds on: `2026-09-27-lab-themes-design.md` (themes, intros, exit tab, harness)

## Goal

Turn the eight labs into spectacular, genuinely complex showcase games and add four new real-ML labs, so a prospective client leaves thinking "a studio that can build this can build my product". Then publish the site.

## Agreed decisions

| Topic | Decision |
|---|---|
| Audience | Client showcase: spectacle first, real in-browser ML where credible, 3–5 min sessions, polish over depth |
| Scope | Upgrade labs 01–08 plus new labs 09 Neuron Foundry, 10 Embedding Galaxy, 11 CNN Vision Lab, 12 RL Arena |
| Architecture | Approach A: a standalone `labs/` engine (TypeScript + Vite) that builds each lab into a static `lab/NN/index.html`, replacing that compiled Next.js page |
| Pilot | 06 GD Golf 3D, built first together with the engine ("golf is not really good": raise its quality bar) |
| Privacy | Everything runs in the browser; nothing leaves the visitor's machine; no API calls |
| Deploy | Only after all 12 labs pass QA, and after the user's final go-ahead (deploy is on the "ask first" list) |

## Architecture

### Spike result (done)
- A hub click into a plain static lab page falls back to a full browser navigation (verified).
- A placeholder `index.txt` breaks it: the router navigates to the `.txt` URL. So rebuilt labs **delete** `lab/NN/index.txt`.
- To avoid the router prefetching the missing `.txt` (a console 404), the hub's lab-card links are changed from Next `Link` (`["$","$L7",…]`) to plain `"a"` in both `lab/index.html` and `lab/index.txt`, with trailing-slash hrefs.

### Layout
```
labs/                         source (never uploaded)
  package.json vite.config.ts tsconfig.json vitest.config.ts
  core/        shell.ts loop.ts seed.ts store.ts quality.ts a11y.ts dom.ts
  labs/NN-slug/  main.ts  sim/*.ts  render/*.ts  ui/*.ts  lab.css  page.html
  tests/        unit tests per sim module
  scripts/      build-all.mjs (build + place outputs + hub patch)
lab/NN/index.html             built page (keeps the site <head>: global CSS, lab-themes CSS)
assets/lab/NN/*.{js,css}      hashed bundles (1-year immutable cache)
assets/lab/data/*             self-hosted datasets / model weights
```

### Core modules
| Module | Contract |
|---|---|
| `shell` | `mountLab({root, title, lede, meta})` renders the page skeleton inside `<main>`: the section head, the game panel with the theme's root class (so every `lab-themes` rule and intro applies unchanged), the `← Lab` exit button, and a themed loading line. Returns the stage element |
| `loop` | `createLoop(update(dt), render(alpha))` with a fixed 60 Hz step, `requestAnimationFrame`, pause on `visibilitychange`, and `stop()` |
| `seed` | `dailySeed(labId)` gives a 32-bit seed from the UTC date plus the lab id; `rng(seed)` is mulberry32 |
| `store` | `load(key, fallback)` / `save(key, value)` via JSON in `localStorage`, every access in try/catch |
| `quality` | `detectTier()` returns `'high' | 'medium' | 'low'` based on WebGL2 availability, `hardwareConcurrency`, `deviceMemory` and viewport. `?quality=` overrides it. Caps the DPR (high 2, medium 1.5, low 1) |
| `a11y` | `prefersReducedMotion()`, `announce(text)` (a polite live region), `onKeys(map)` |

### Rules for every lab
- The theme root class matches the table in the themes spec (new labs get new ones, below), so intros, exit tab, takeover and reduced motion come from `lab-themes` CSS.
- Every canvas has DOM controls plus a text readout that let you play without seeing the canvas; everything works by keyboard; score events are announced.
- Budgets: 2D lab JS ≤ 80 KB gzip; 3D labs ≤ 250 KB gzip; data ≤ 6 MB per lab (lazy-loaded after first paint); LCP < 2.5 s (Lighthouse desktop); 60 fps target at the high tier.
- No external origins; CSP unchanged (no WASM, so no `wasm-unsafe-eval` needed: all ML runs in plain TypeScript on typed arrays and WebGL).
- Reduced motion: no camera flights or looping particles; state changes are instant.
- The low tier / no WebGL falls back to Canvas 2D with the same simulation.

## Labs

Each lab lists the sim (tested), the graphics, and the showcase moment.

### 06 GD Golf 3D (pilot) · theme `green` · root `.lab-golf`
- **Clubs = optimisers.** Putter SGD, Iron Momentum, Wedge Nesterov, Hybrid RMSProp, Driver Adam. Dials: log-scale lr, β/β₁/β₂/decay. Gradient clipping and LR schedule (constant/step/cosine) unlock on the holes that need them.
- **Course.** A library of 12 surfaces: bowl, ravine (ill-conditioned), Rosenbrock, saddle, Himmelblau, Rastrigin-lite, noisy plateau (seeded mini-batch noise), gradient cliff, Beale, Booth, six-hump camel, twin-valley. The daily seed deals 6 holes, each with a tee, a cup (the target minimum), a cup radius, par and a step budget.
- **Rules.** Up to N steps per shot. Holed = the final point is within the cup radius. Divergence (non-finite values or leaving the bounds) = water hazard: +1 stroke and the ball goes back to where the shot started. Score: strokes vs par per hole, round total.
- **Ghost race.** After each shot, the other 4 optimisers replay from the same position with tuned settings (colour-coded trails); a "beat the Adam ghost" badge.
- **Graphics (three.js).**
  - Terrain mesh from the loss function (log-scaled height).
  - A custom shader for mown stripes, contour lines and a loss colour ramp.
  - Gradient sky, fog, baked shading, a swaying flag.
  - A ball that rolls along an interpolated path, a ribbon trail, ghost trails.
  - A flyover at the start of each hole, then a follow camera; orbit and zoom.
  - A confetti burst on hole-out.
- **Low tier / no WebGL:** a Canvas 2D top-down contour view.
- **UI.** Clubhouse scorecard; live maths panel (update rule, loss, ‖∇‖); end-of-round card with a copy-to-share line; local best.

### 01 Scale Arena · theme `arena` · root `.scale-arena`
- Sim: a seeded deck of 10 pairs from a curated catalogue of about 120 objects (sizes in metres, from 10⁻¹⁵ to 10²⁶). You **bet the ratio** on a log-scale slider (how many times bigger), not just A/B. Score = 100·exp(−|log₁₀ guess − log₁₀ truth|). Streak multiplier. Rounds 5 and 10 are boss rounds (≥ 10 orders of magnitude apart).
- Graphics: a Canvas 2D **powers-of-ten zoom**: both objects drawn to true relative scale while the camera zooms out logarithmically on reveal; knockout particles; camera shake on a miss.
- Showcase: the zoom reveal from atom to galaxy.

### 02 Magnitude Run · theme `blueprint` · root `.magnitude-run`
- Sim: 8 seeded quantities (height, mass, population, distance). You give a **90 % confidence interval** (two handles). Scored with the interval score (Gneiting & Raftery): the width penalty plus 2/α × miss distance, normalised to 0–100.
- After the run: a **calibration chart**: the share of intervals that contained the truth vs the nominal 90 %, with a verdict of overconfident / calibrated / underconfident.
- Graphics: an animated drafting pen draws the intervals on a log ruler; the truth marker drops in with an ink splash.
- Showcase: "you're overconfident by 35 %", measured.

### 03 Eval harness · theme `bureau` · root `.lab-eval`
- Sim: 24 seeded items, each with a model confidence score and a reference label. You set the **decision threshold**; a live ROC curve and PR curve (with AUC) and a confusion matrix follow it. Then **rubric mode**: you grade 8 borderline items; your agreement with a simulated second inspector is shown as Cohen's κ.
- Graphics: items ride a conveyor; a threshold gate splits them into PASS/FAIL trays; animated stamps; the ROC sweep is drawn as a pen trace.
- Showcase: dragging the threshold makes the curves move live.

### 04 Prompt Forge · theme `forge` · root `.lab-forge`
- Sim: the same scripted rule-table model (no live LLM). Blocks now carry **token costs** against a budget. **Red-team waves**: 3 waves of seeded prompt-injection attacks test the prompt; defence rules block them. **Versions**: every run is a commit with diff, branch and rollback (up to 12 versions).
- Graphics: Canvas 2D physics ingots (drag, snap onto the anvil, glow while hot); a molten-pour animation into the prompt mould; per-test quench steam or crack; attack sprites strike the shield.
- Showcase: watching an injection wave bounce off the prompt you built.

### 05 Secure ops · theme `siege` · root `.lab-ops`
- Sim: real-time **tower defence** on 5 routes with 6 attack types (credential stuffing, DDoS burst, XSS, SQLi, scraper, SSRF), each with its own signature, plus real visitors. Defences (rate limit, auth gate, CSP, vault, WAF) with 2 upgrade tiers, bought with a budget between waves. **WAF rule writer**: type a regex, test it live against the request log, false positives cost points (regex timeout-guarded).
- Graphics: Canvas 2D units walking the roads, arrows and blocks, a burning-gate state, an end-of-run incident replay timeline.
- Showcase: writing a regex that stops SQLi without blocking real users.

### 07 Overfit or Not · theme `atelier` · root `.lab-overfit`
- Sim: seeded noisy data. Model families: polynomial (degree 1–15) with **L2 regularisation λ**, kNN (k), decision stump depth. A "more data" slider. Animated **k-fold CV** (k=5). A **bias–variance fan**: 20 bootstrap fits drawn together. A **double-descent** mode (minimum-norm fits past interpolation). Goal: lock the model with the best held-out error.
- Graphics: stitching animates along curves; fold cards shuffle; the fan of threads sways.
- Showcase: seeing variance as a physical fan of threads.

### 08 Attention Lens · theme `noir` · root `.lab-attn`
- Sim: a hand-authored illustrative set of 3 layers × 4 heads per sentence (positional, syntactic, coreference, rare-token heads). 8 Winograd-style cases. **Build-your-own attention**: drag query and key vectors in 2D; see the dot products → softmax (temperature slider) → weights live.
- Graphics: red-string arcs whose tension and thickness follow the weights; a head-selector "line-up"; the lamp spotlight follows the selected token.
- Showcase: flipping heads shows "it" resolving differently per head.

### 09 Neuron Foundry (new) · theme `abyss` (bioluminescent deep sea) · root `.lab-foundry`
- Sim: a from-scratch MLP (TypeScript autodiff on Float32Array) trained live on 6 seeded 2D datasets (moons, spiral, circles, XOR, gaussians, checker). Controls: layers 1–4, width 2–8, activation (tanh/ReLU/GELU), lr, batch size, L2. Challenge: reach ≥ 95 % test accuracy with the fewest parameters.
- Graphics: the network drawn as glowing jellyfish nodes and tendrils (weight sign = colour, magnitude = glow); the decision boundary rendered as flowing currents (a WebGL fragment shader evaluating the net per pixel at the high tier; Canvas 2D grid otherwise); a loss chart.
- Intro: the CRT sinks underwater (bubbles, blue-green caustics).

### 10 Embedding Galaxy (new) · theme `cosmos` (deep-space navigation) · root `.lab-galaxy`
- Data: about 5,000 common English words with 3D projections (PCA/UMAP) plus the original 50-d vectors, from **GloVe 6B 50d (PDDL licence)**, precomputed offline, quantised to int8, ≤ 4 MB.
- Sim: nearest-neighbour search (cosine) in 50-d; analogy puzzles (a − b + c → ?) scored by rank; "constellation" clustering challenges; a daily set of 5 puzzles.
- Graphics (three.js): an instanced-point starfield with bloom-like additive glow, labels for the nearest stars, flight between words, analogy vectors drawn as light beams.
- Intro: the CRT warps into hyperspace streaks.

### 11 CNN Vision Lab (new) · theme `darkroom` (photo darkroom) · root `.lab-vision`
- Model: a small CNN (2 conv + 2 dense) trained offline on **MNIST (CC BY-SA 3.0)**, weights shipped as int8 JSON/binary (≤ 150 KB), inference in TypeScript.
- Sim: draw a digit; see the 28×28 input, **every feature map per layer**, and the class probabilities; an **adversarial mode**: change as few pixels as possible to flip the prediction; a saliency (gradient) overlay.
- Graphics: feature maps "develop" like prints in trays under a red safelight; a probability bar chart as an enlarger meter.
- Intro: a safelight clicks on and a print develops out of the CRT.

### 12 RL Arena (new) · theme `arcade` (8-bit dungeon) · root `.lab-rl`
- Sim: tabular Q-learning and SARSA on seeded grid dungeons (keys, lava, treasure, wind). Controls: α, γ, ε with a decay schedule, episodes; a **reward-shaping puzzle**: place reward tiles so the agent learns the intended route within N episodes.
- Graphics: a pixel-art dungeon; the agent as a sprite knight; a value-function heatmap as torchlight; the policy as arrows; a learning curve.
- Intro: the CRT becomes an arcade cabinet: "INSERT COIN", then pixel wipe.

## Hub and site integration
- Hub `lab/index.html` + `lab/index.txt`: card links become plain `<a href="/lab/NN/">`; 4 new cards (09–12) are cloned from an existing card in both files; the grid class supports 12. Checked by the harness: 12 cards, no hydration errors, soft navigation to the hub still renders.
- `lab-themes` CSS gains 4 themes and intros (`abyss`, `cosmos`, `darkroom`, `arcade`) and their roots in the shared selector lists.
- Lab blog, home and other pages are unchanged.

## Verification
1. Vitest for all `sim/` modules. For example:
   - optimiser maths;
   - surface gradients vs numerical gradients;
   - interval score;
   - ROC/AUC vs a known fixture;
   - MLP gradient check;
   - CNN inference matching reference outputs on 20 fixture digits;
   - Q-learning converging on a tiny MDP;
   - cosine kNN.
2. The Playwright harness extended to all 12 labs:
   - theme and intro;
   - exit tab;
   - no console or CSP errors;
   - phone width;
   - reduced motion;
   - axe;
   - one scripted play-through reaching a score;
   - WebGL-disabled fallback (3D labs);
   - bundle-size budget.
3. Lighthouse per lab, recorded in `QA.md`.
4. A visual review of intro filmstrips and played-state screenshots.

## Deploy
- Packaging: only site files (the list in `QA.md`), plus `assets/lab/**`.
- Transport: SFTP/SSH (the user provides access; credentials live in `~/dev/ai-stack/secrets`, never printed), or the user uploads the tarball via cPanel.
- Gate: all verification green, then the user's explicit go-ahead, then upload, then a smoke test against the live URL.

## Risks
| Risk | Mitigation |
|---|---|
| Scope (12 complex labs) | Build lab by lab, each fully tested before the next; progress reported per lab |
| three.js bundle size | Import only the modules used; budget checked in the harness |
| GloVe/MNIST preparation needs Python + downloads | Offline scripts in `labs/scripts/data/`; outputs committed; licences recorded in `labs/DATA-LICENSES.md` |
| Mobile GPU performance | `quality` tiers + 2D fallback; frame-time check |
| Hand-patching the hub RSC | Scripted, idempotent, verified by the harness (12 cards, soft-nav, no hydration errors) |
