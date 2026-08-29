/**
 * Client helper: prefer Postgres Server Actions when DATABASE_URL is set,
 * otherwise fall back to in-memory services (local demo without DB).
 */

"use client";

import { databaseStatusAction } from "@/app/actions/backend";

export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export async function runAdminMutation<T>(opts: {
  db: () => Promise<MutationResult<T>>;
  memory: () => MutationResult<T>;
  onDbSuccess?: (data: T) => void | Promise<void>;
}): Promise<MutationResult<T>> {
  const status = await databaseStatusAction();
  if (status.configured) {
    const result = await opts.db();
    if (result.ok) {
      await opts.onDbSuccess?.(result.data);
    }
    return result;
  }
  return opts.memory();
}
