# Lab themes — design spec

Date: 2026-09-27 · Status: awaiting review · Stacks: dev, web

## Goal

The eight AI labs (`/lab/01`–`/lab/08`) share one green-CRT look and feel dull. Clicking **play →** should drop the visitor into a completely different, topic-themed world per lab, entered through a unique opening animation that starts in the site's retro CRT look and transforms into that lab's theme.

Success means a visitor can tell which lab they are in from a screenshot with the text hidden, and the games play exactly as before.

## Decisions (agreed)

| Topic | Decision |
|---|---|
| Theme depth | Full world: palette, typography, background art, restyled UI pieces, animation, themed micro-copy. Game rules, scoring, daily seed unchanged. |
| Site chrome | Full takeover: site header and footer hidden inside a lab; a small fixed CRT-style `NULL∅VERFLOW · exit lab` tab is the way out. |
| Build approach | A — theme layer on the compiled build. No source exists (searched laptop, cPanel holds compiled output only). |
| Opening | Every lab has its own CRT → theme transition animation. |
| Lab 08 | Noir detective corkboard (observatory was the alternative). |
| Out of scope | Theme previews on the `/lab` hub cards; sound; gameplay changes; other site pages. |

## Constraints (from the build)

- Compiled Next.js static export. Pages exist as `index.html` (first load) and `index.txt` (RSC payload for client-side navigation).
- Each game root is server-rendered with a unique class, present from first paint, including the loading state:

  | Lab | Root class | Theme scope selector |
  |---|---|---|
  | 01 Scale Arena | `.scale-arena` | `body:has(.scale-arena)` |
  | 02 Magnitude Run | `.magnitude-run` | `body:has(.magnitude-run)` |
  | 03 Eval harness | `.lab-eval` | `body:has(.lab-eval)` |
  | 04 Prompt forge | `.lab-forge` | `body:has(.lab-forge)` |
  | 05 Secure ops | `.lab-ops` | `body:has(.lab-ops)` |
  | 06 GD Golf | `.lab-golf` | `body:has(.lab-golf)` |
  | 07 Overfit or Not | `.lab-overfit` | `body:has(.lab-overfit)` |
  | 08 Attention Lens | `.lab-attn` | `body:has(.lab-attn)` |

  Plan step 1 re-verifies each root is in the server HTML (confirmed for 01, 02, 04).
- Games render with DOM and SVG, coloured via CSS custom properties (`--bg`, `--panel`, `--surface`, `--ink`, `--ink-dim`, `--phosphor`, `--phosphor-dim`, `--phosphor-glow`, `--amber`, `--amber-dim`, `--grid`, `--mono`, `--display`, `--ref`, `--guess`) and stable semantic classes (`forge-block`, `forge-bulb`, …). So they can be themed without changing JS.
- Exception: lab 06 draws on a `<canvas>` with hardcoded colours in `_next/static/chunks/app/lab/06/page-*.js`: `h="57, 255, 20"`, `u="26, 122, 46"`, `d="255, 176, 0"`, background `#0a100a`, and a diverged-ball colour `rgba(138, 106, 31, 0.9)`.
- The CSP in `.htaccess` allows `'self'` only for styles, fonts, images and scripts (plus `data:` for fonts and images). All assets are self-hosted, with no CDNs or Google Fonts requests.
- `.htaccess` caches `js/css/woff2/svg/png/jpg/webp` for a year as `immutable`. Any changed or new asset needs a new filename.
- `:has()` is supported in all current evergreen browsers. Where it isn't supported, the lab shows the existing CRT look, which is acceptable.

## Architecture

```
_next/static/css/lab-themes.<hash8>.css     one stylesheet: shared takeover rules + 8 scoped themes + 8 intros
assets/lab/<slug>/                           per-lab fonts (.woff2, subset Latin) and SVG art
  slugs: arena, blueprint, bureau, forge, siege, green, atelier, noir
_next/static/chunks/app/lab/06/page-<newhash>.js   golf script with themed canvas colours
```

- **Loading.** Add `<link rel="stylesheet" href="/_next/static/css/lab-themes.<hash8>.css">` to the `<head>` of every `index.html` (so it is already loaded when the visitor navigates client-side from any page). Verify it survives React hydration and soft navigation. **Fallback** if it doesn't: append the theme CSS to the global stylesheet, save it under a new hashed name, and rewrite references in all `.html` and `.txt` files.
- **Scoping.** Everything in a theme lives under its `body:has(.<root>)` selector, so nothing leaks into other pages. `@font-face` and `url()` art only download when a rule that uses them matches, so a visitor opening lab 04 never downloads lab 01's fonts.
- **Takeover (shared).** Inside any lab, hide `.site-header` and `.site-footer`. Restyle the existing `.lab-page-nav a[href="/lab/"]` ("← Lab") as a fixed top-left tab in the original CRT palette. Its text changes to `NULL∅VERFLOW · exit lab` through CSS, with the accessible name kept (visually hidden original text plus a pseudo-element label; see the plan). The other page-nav links stay reachable further down the page.
- **Theme tokens.** Each theme first redefines the shared custom properties (palette and `--mono`/`--display` fonts), then adds targeted rules for that game's classes, background art, and decorative pseudo-elements.
- **Loading copy.** Hide `.lab-loading` text visually (still announced) and show a themed line through `::before` (e.g. forge: "> stoking the furnace").
- **Golf canvas.** Replace the five colour literals with theme colours, rename the file with a new content hash, and update references in `lab/06/index.html`, `lab/06/index.txt`, and anywhere else `grep` finds the old name.
- **Rollback.** Remove the `<link>` tags and restore the original golf chunk name. The original files are kept in `.backup/` (outside the upload set) until we're happy.

## Opening animations (CRT → theme)

Shared mechanics:
- The intro is built from two fixed full-screen layers on `body::before` and `body::after`, scoped per lab. For the first ~250 ms they look like the site's CRT: phosphor green, scanlines, glow. Then they run the lab's transformation and fade away.
- Total length is 0.9–1.3 s. Layers use `pointer-events: none`, so the game is usable underneath the whole time, and they finish at `opacity: 0; visibility: hidden`.
- Plays once each time the lab mounts, on a direct visit and on client-side navigation.
- Only `transform`, `opacity`, `clip-path` and `filter` are animated (compositor-friendly).
- `@media (prefers-reduced-motion: reduce)`: no intro. The theme appears immediately.

| Lab | Theme | Intro: CRT → world |
|---|---|---|
| 01 Scale Arena | Title-fight weigh-in | The CRT image flashes like camera flashbulbs, the green collapses into a spotlight cone that snaps onto the ring, and a red/blue "ROUND 1" card sweeps across. |
| 02 Magnitude Run | Architect's blueprint | The phosphor grid lines turn white while blueprint cyan floods out from the centre, and the sheet unrolls top to bottom with a curl shadow. |
| 03 Eval harness | 1950s inspection bureau | The terminal text re-types as typewriter text, a manila folder slides up and flips open, and an "IN REVIEW" stamp thunks down. |
| 04 Prompt forge | Blacksmith's forge | The green phosphor cools to black, an ember glow ignites from below, sparks burst, and heavy forge doors part to reveal the anvil. |
| 05 Secure ops | Castle under siege | The terminal map is redrawn as ink on parchment through a burnt-edge wipe, then the drawbridge lowers. |
| 06 GD Golf | Retro country-club green | Green CRT pixels bloom into mown grass stripes, a ball rolls across and drops into the cup, and the flag pops up. |
| 07 Overfit or Not | Tailor's atelier | Phosphor lines turn into chalk marks, a tape measure unspools across the screen, and pattern paper slides in. |
| 08 Attention Lens | Noir detective corkboard | The CRT flickers like a failing bulb, a desk lamp clicks on, its cone of light reveals the corkboard, and red string snaps taut. |

## Themes

For each lab: palette direction, candidate fonts (all SIL OFL; final pick in the plan), and how the game's UI is re-skinned. Every palette must pass WCAG AA contrast (4.5:1 for text, 3:1 for large text and UI).

**01 · Arena (Scale Arena).** Canvas black, spotlight white, corner red and blue, gold for streaks. Fonts: Anton (headlines), Oswald (UI). Options A and B become red and blue corner cards, with ring ropes framing the stage. The prompt is set as fight-poster type, the streak is a championship belt, and the result is a knockout or decision card. Copy: "In the red corner…".

**02 · Blueprint (Magnitude Run).** Blueprint cyan paper with a white grid, a white pencil reference and a red-pencil target. Fonts: Architects Daughter (annotations), IBM Plex Mono (numbers). The drag handle is a drafting-compass point, rulers run along the stage edges, and the score is a stamp: "APPROVED" for high scores, "REVISE" otherwise. The save-progress panel is styled as a title block.

**03 · Bureau (Eval harness).** Desk green-grey, manila, typewriter ink, stamp red and green. Fonts: Special Elite (cards), Courier Prime (UI). Outputs are typed index cards, PASS and FAIL are rubber stamps with a press animation, the confusion grid is a pegboard tally, and precision and recall are brass dial gauges (CSS conic-gradient over the existing values).

**04 · Forge (Prompt forge).** Soot black, ember orange, hot white, steel grey. Fonts: Alfa Slab One (headings), Bitter (UI). Role, rule and example blocks are ingots in three alloys (iron, copper, bronze) that snap onto an anvil stage. The 8 regression lights are furnace gauges: pass shows quench steam, fail shows a crack. The diff is an engraved plate, with sparks on each run.

**05 · Siege (Secure ops).** Parchment, iron-gall ink, heraldic red, gold. Fonts: IM Fell English SC (headings), IM Fell English (UI). The five routes are gates on a keep map. Rate limit is a portcullis, auth is guards, CSP is a moat, and the vault is a treasury. The budget shows as gold coins, abusive traffic as raiders, and real visitors as merchants.

**06 · Green (GD Golf).** Fairway and green stripes, sand, flag red, scorecard cream. Fonts: Fraunces (70s leisure display), Recursive Casual (UI). Contours render as mown stripes on the canvas, there's a flag in the hole, and the score is a pencil scorecard. On overshoot the copy says "into the water hazard".

**07 · Atelier (Overfit or Not).** Pattern-paper tan, chalk white, pin silver, thread red. Fonts: Cormorant Garamond (headings), Caveat (chalk annotations). Data points are pins, the fitted curve is chalk thread, the degree slider is a tape measure, and the error scope is the tailor's ledger. Verdict copy: "too baggy" (underfit), "too tight" (overfit), "bespoke" (sweet spot).

**08 · Noir (Attention Lens).** Cork brown, lamp yellow, shadow black, string red. Fonts: Bebas Neue (headlines), Courier Prime (cards). Words are pinned index cards, and attention arcs are red string whose thickness and opacity follow the existing weight. Calling the antecedent is "name the suspect", and a correct answer stamps the case file "SOLVED".

Themed copy is only added through CSS pseudo-elements or by restyling existing text. No game strings change in JS. Screen-reader output stays the same, and decorative pseudo-content is marked with an empty alt text (`content: "…" / ""`) where it isn't meaningful.

## Accessibility and performance

- WCAG AA contrast for every palette; visible `:focus-visible` rings in each theme.
- Reduced motion turns off the intros and all decorative loops (sparks, flicker, steam).
- Tap targets of at least 44 px are kept, and layouts work at 360 px width with no horizontal scroll.
- Budget per lab: at most 150 KB extra (fonts subset to Latin plus theme SVG). Shared stylesheet: at most 60 KB uncompressed.
- No new network origins; the CSP stays unchanged.

## Verification

1. A local server that sends the same headers as `.htaccess` (CSP, `nosniff`, etc.), serving from the project root.
2. A Playwright script that, for each lab:
   - takes screenshots at 1440×900 and 390×844, mid-intro and after it;
   - loads the lab directly **and** via a click on `/lab/`, and checks the theme applies both ways;
   - fails on any console error, CSP violation or hydration warning;
   - checks the intro is absent under `reducedMotion: 'reduce'`;
   - confirms the header and footer are hidden and the exit tab is visible, focusable, and goes to `/lab/`;
   - runs axe-core with zero serious or critical violations.
3. Play-through spot check per lab: the game completes and a score shows (unchanged logic).
4. Web-stack QA: Lighthouse (performance, accessibility, best practices, SEO) per lab recorded in `QA.md`; Front-End-Checklist high-priority items pass.

## Risks

| Risk | Mitigation |
|---|---|
| React hydration removes the injected `<link>` | Fallback: merge into the renamed global CSS (see Architecture). |
| A game's classes don't cover what the theme needs | Use decorative pseudo-elements; if still blocked, note it in the plan instead of editing game JS (golf is the only planned JS edit). |
| Editing minified files by hand | Scripted, `grep`-verified edits; originals kept in `.backup/`. |
| Tooling files (`CLAUDE.md`, `.ai-stack`, `.claude/`, `docs/`, `.backup/`) uploaded to `public_html` | The deploy step uploads only site files (exclusion list in the plan). |
