# QA: Lab themes

Date: 2026-09-27 · Spec: `docs/superpowers/specs/2026-09-27-lab-themes-design.md` · Plan: `docs/superpowers/plans/2026-09-27-lab-themes.md`

## Automated checks (lab engine v2, 12 labs)

- **Unit tests (Vitest): 186/186 pass.** They cover the maths and game logic of every lab, including:
  - optimiser maths and hole playability;
  - interval score and calibration;
  - ROC/AUC and Cohen's κ;
  - the ReDoS guard;
  - ridge regression, cross-validation and double descent;
  - attention heads;
  - MLP gradient checks;
  - kNN parity with numpy;
  - CNN parity with PyTorch;
  - Q-learning vs SARSA;
  - the hub patcher.
- **Browser harness (Playwright + axe): 260/260 checks pass.** For the hub, it checks that the page hydrates with no errors and that all 12 cards are plain links. For every lab, it checks:
  - the theme on a direct load and after navigating from the hub;
  - the intro and the exit tab;
  - a phone-width layout with no horizontal scroll;
  - reduced motion;
  - axe;
  - no console, CSP or hydration errors;
  - a **full scripted play-through to the end card**;
  - the bundle budget.

  The 3D labs (06, 10) are also played with WebGL disabled, to test the 2D fallback.

## Lighthouse (desktop, local server with production headers)

| Lab | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| 01 Scale Arena | 100 | 100 | 96 | 100 | 0.4 s | 0.016 | 0 ms |
| 02 Magnitude Run | 100 | 100 | 96 | 100 | 0.5 s | 0.025 | 0 ms |
| 03 Eval harness | 100 | 100 | 96 | 100 | 0.6 s | 0.004 | 0 ms |
| 04 Prompt forge | 99 | 100 | 96 | 100 | 0.5 s | 0.080 | 0 ms |
| 05 Secure ops | 100 | 100 | 96 | 100 | 0.5 s | 0.013 | 0 ms |
| 06 GD Golf 3D | 90 | 100 | 96 | 100 | 0.5 s | 0.019 | 240 ms |
| 07 Overfit or Not | 100 | 100 | 96 | 100 | 0.5 s | 0.013 | 0 ms |
| 08 Attention Lens | 100 | 100 | 96 | 100 | 0.6 s | 0.011 | 0 ms |
| 09 Neuron Foundry | 100 | 100 | 96 | 100 | 0.5 s | 0.041 | 0 ms |
| 10 Embedding Galaxy | 97 | 100 | 96 | 100 | 1.0 s | 0.064 | 60 ms |
| 11 CNN Vision Lab | 100 | 100 | 96 | 100 | 0.6 s | 0.032 | 0 ms |
| 12 RL Arena | 100 | 100 | 96 | 100 | 0.5 s | 0.049 | 0 ms |
| /lab/ hub | 98 | 95 | 96 | 100 | 0.9 s | 0.005 | 0 ms |

Why some scores are below 100 (both issues existed before this work):
- **Best practices 96 everywhere:** `/favicon.ico` returns 404.
- **Hub accessibility 95:** the site's own boot-screen terminal lines fail contrast.

Bundles (gzip): 2D labs 5.5–8.6 KB. 3D labs: 06 is 149 KB and 10 is 137 KB, including three.js, which only loads on capable devices.

## Front-End-Checklist: high-priority items relevant to this change

Source: the Front-End-Checklist `rules-catalog.md` (local copy in `~/Documents/AI_innovation/AI github repos/`).

| Rule | Status | Notes |
|---|---|---|
| Do not disable pinch zoom | Pass | Viewport meta unchanged |
| Provide visible custom focus indicators | Pass | Each theme sets `:focus-visible`; checked by the harness |
| Meet minimum colour contrast | Pass* | axe finds 0 issues. *axe can't measure text over gradient backgrounds, so every lab was also checked by eye in screenshots |
| Respect reduced motion | Pass | Intros and decorative loops are off; checked by the harness |
| Keep focused elements unobscured | Pass | `scroll-padding-top: 72px` clears the fixed exit tab; checked by the harness |
| Provide accessible names | Pass | Exit tab keeps its name "← Lab", which appears in the visible label; decorative pseudo-content has empty alt text |
| Ensure ARIA roles contain required children | Pass | Lab 03 rebuilt with proper `role="row"` wrappers |
| Use transform and opacity for animations | Mostly | Two exceptions: the bureau stamp animates `color`, and the siege/noir intros animate a mask radius |
| Minify all CSS | Pass | `lab-themes.<hash>.css` is 76 KB raw, 15.5 KB gzip, 13.2 KB brotli |
| Remove unused CSS | Partial | The stylesheet loads on every page so client-side navigation into a lab is themed instantly. It's one download, cached for a year |
| Load CSS without blocking render | By design | The theme has to apply on the first paint, otherwise the CRT look flashes first |
| Keep CSS specificity low | Partial | Every rule is scoped with `body:has(.<lab-root>)` so nothing leaks outside its lab |
| Optimise web font loading | Pass | woff2, Latin subset, `font-display: swap`, only downloaded inside the lab that uses it (siege is the largest at ~107 KB) |
| Minimise CLS | Pass | Highest is 0.059 (lab 02) |
| Show loading indicators | Pass | Themed loading line per lab |
| Implement a CSP | Pass | CSP unchanged; no new origins; harness fails on any CSP violation |
| Enable text-based compression | **Server** | `.htaccess` has no `mod_deflate` rule. Recommended, see below |

## Recommended follow-ups (not done: they touch deployment or game code)

1. **Enable gzip on cPanel** (cuts every CSS/JS/HTML transfer by about 75%). Add to `.htaccess`:
   ```apache
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json image/svg+xml
   </IfModule>
   ```
2. **Add a favicon** (`/favicon.ico`, or a `<link rel="icon">`) to get best practices to 100.
3. **Boot screen contrast (hub):** the site's boot overlay lines fail contrast; needs a site-wide CSS tweak.

## What to upload to cPanel

Upload **only** the site files:

```
.htaccess  index.html  index.txt  404.html  404/  _next/  assets/  about/  capabilities/  contact/  lab/  work/
```

`assets/` now includes `assets/lab/NN/` (lab bundles) and `assets/lab/10|11/data/` (GloVe extract, CNN weights).

Never upload the tooling: `.ai-stack  CLAUDE.md  QA.md  skills-lock.json  .claude/  .agents/  .git/  .backup/  .superpowers/  docs/  tools/  labs/`

Paste-ready package (run from the project root):

```bash
tar -czf ~/Downloads/null-overflow-cpanel-wave3.tar.gz .htaccess index.html index.txt 404.html 404 _next assets about capabilities contact lab work
```
