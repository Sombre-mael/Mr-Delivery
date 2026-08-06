import { createHash } from "crypto";
import { getSql } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

function fingerprint(ip: string) {
  const secret = process.env.SESSION_SECRET || "local-development";
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex");
}

export async function isLoginBlocked(ip: string) {
  const sql = getSql();
  const key = fingerprint(ip);
  const rows = (await sql`
    SELECT blocked_until
    FROM operator_login_attempts
    WHERE fingerprint = ${key}
    LIMIT 1
  `) as Record<string, unknown>[];

  const blockedUntil = rows[0]?.blocked_until ? new Date(String(rows[0].blocked_until)) : null;
  return Boolean(blockedUntil && blockedUntil.getTime() > Date.now());
}

export async function recordLoginFailure(ip: string) {
  const sql = getSql();
  const key = fingerprint(ip);

  await sql`
    INSERT INTO operator_login_attempts (fingerprint, failed_count, window_started_at, blocked_until, updated_at)
    VALUES (${key}, 1, NOW(), NULL, NOW())
    ON CONFLICT (fingerprint) DO UPDATE SET
      failed_count = CASE
        WHEN operator_login_attempts.window_started_at < NOW() - INTERVAL '15 minutes' THEN 1
        ELSE operator_login_attempts.failed_count + 1
      END,
      window_started_at = CASE
        WHEN operator_login_attempts.window_started_at < NOW() - INTERVAL '15 minutes' THEN NOW()
        ELSE operator_login_attempts.window_started_at
      END,
      blocked_until = CASE
        WHEN (
          CASE
            WHEN operator_login_attempts.window_started_at < NOW() - INTERVAL '15 minutes' THEN 1
            ELSE operator_login_attempts.failed_count + 1
          END
        ) >= ${MAX_ATTEMPTS} THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END,
      updated_at = NOW()
  `;
}

export async function clearLoginFailures(ip: string) {
  const sql = getSql();
  const key = fingerprint(ip);
  await sql`DELETE FROM operator_login_attempts WHERE fingerprint = ${key}`;
}

export const loginRateLimitDescription = `${MAX_ATTEMPTS} tentatives toutes les ${WINDOW_MINUTES} minutes`;
