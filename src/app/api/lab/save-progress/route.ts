import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * AppSec interim: refuse all writes until Backend DB + encryption-at-rest.
 * Do not persist PII to disk.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Save progress is disabled until vault-backed storage ships.",
      code: "VAULT_STORE_PENDING",
    },
    { status: 503 }
  );
}
