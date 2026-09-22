# Null Overflow

CRT / phosphor AI lab site for Null Overflow, an AI/ML studio. Next.js App Router. The Lab includes Scale Arena and MAGNITUDE RUN.

This repository previously held the Vite marketing site. That history stays on `main`. This tree is the Next.js site at the repo root.

## Run

Requirements: Node.js 20+.

```bash
npm ci
npm run dev
```

The dev server listens on [http://localhost:3001](http://localhost:3001).

Production:

```bash
npm run build
npm start
```

`npm start` also uses port 3001.

## Routes

| Path | What it is |
| --- | --- |
| `/` | Home — work, capabilities, stack, lab strip |
| `/lab` | AI Lab / Play — Scale Arena and MAGNITUDE RUN |
| `/lab/02` | MAGNITUDE RUN silhouette calibration, plus Save Progress |
| `/lab/blog` | Lab notes |
| `/work` | Case cards |
| `/capabilities` | Capability panels |
| `/about` | Operator |
| `/contact` | Inquiry email |

## Save progress

`/lab/02` shows the Save Progress form. Live writes are off. `POST /api/lab/save-progress` returns `503` until vault-backed storage exists. Do not persist names, emails, or phone numbers to disk.

Schema notes (design only): [LAB-SAVE-PROGRESS-SCHEMA.md](LAB-SAVE-PROGRESS-SCHEMA.md).

## What not to commit

- `.env` and `.env.*` (vault keys such as `DATABASE_URL`, `LAB_PII_PEPPER`, `LAB_PII_KEY`)
- `data/` and lab progress JSON
- `node_modules/` and `.next/`

No environment variables are required to run the site locally.
