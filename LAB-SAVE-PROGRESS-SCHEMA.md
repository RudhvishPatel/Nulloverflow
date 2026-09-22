# Null Overflow — Lab Save progress (AppSec-ready schema)

Status: **design only** until vault Postgres URL lands. No live writes. Frontend form stays 503 / disabled.

## Consent copy (UI — exact)

Checkbox (required, unchecked by default):

> I agree that Null Overflow may store my name, surname, email, and phone number solely to restore my Lab progress (Scale Arena / MAGNITUDE RUN) across devices. I can request deletion by emailing the contact on this site. We will not sell this data or use it for marketing without a separate opt-in.

Submit disabled until checked.

## Prisma models (Postgres + vault `DATABASE_URL`)

```prisma
model LabProgressProfile {
  id           String   @id @default(cuid())
  emailHash    String   @unique  // sha256(normalized email + pepper)
  emailEnc     String            // AES-GCM ciphertext (vault key)
  phoneEnc     String?           // AES-GCM; optional if empty
  givenNameEnc String
  familyNameEnc String
  consentAt    DateTime
  consentVersion String          // e.g. "lab-save-v1"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  progress     LabProgressSave[]
}

model LabProgressSave {
  id         String   @id @default(cuid())
  profileId  String
  game       String   // "scale_arena" | "magnitude_run"
  payloadEnc String   // AES-GCM JSON: round, streak, mode scores — no PII
  updatedAt  DateTime @updatedAt
  profile    LabProgressProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@unique([profileId, game])
}
```

Pepper + AES key: vault only (`LAB_PII_PEPPER`, `LAB_PII_KEY`). Never commit.

## API

`POST /api/lab/save-progress`
- Zod: givenName, familyName (1–80), email, phone (E.164-ish optional/required per product), consent: true, game enum, progress payload size-capped
- Reject unknown fields
- Rate-limit: IP (+ optional fingerprint later)
- CSRF / Origin check (same as Nature’s Soul admin)
- No plaintext email/phone in logs — log profile id only
- Response: `{ ok: true }` — no echo of PII

## Retention / delete

- Soft path: `DELETE` via authenticated email magic link or manual Ops request
- Default retention: 24 months inactivity → purge profile + saves
- Export: on request, decrypted JSON to the verified email only

## Gaps before AppSec live clear

1. Vault Postgres + encryption keys
2. Origin/CSRF on POST
3. Redis rate limit for multi-instance
4. Delete/export path implemented and documented
5. No file-backed `data/*.json` in any deploy
