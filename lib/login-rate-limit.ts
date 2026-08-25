import { createHash } from "crypto";
import { getSql } from "@/lib/db";

const WINDOW_MINUTES = 15;
const ACCOUNT_MAX_ATTEMPTS = 5;
const IP_MAX_ATTEMPTS = 10;

function fingerprint(scope: string, value: string) {
  const secret = process.env.SESSION_SECRET || "local-development";
  return createHash("sha256").update(`${secret}:${scope}:${value}`).digest("hex");
}

async function isBlocked(key: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT blocked_until
    FROM operator_login_attempts
    WHERE fingerprint = ${key}
    LIMIT 1
  `) as Record<string, unknown>[];

  const blockedUntil = rows[0]?.blocked_until ? new Date(String(rows[0].blocked_until)) : null;
  return Boolean(blockedUntil && blockedUntil.getTime() > Date.now());
}

async function recordFailure(key: string, maxAttempts: number) {
  const sql = getSql();

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
        ) >= ${maxAttempts} THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END,
      updated_at = NOW()
  `;
}

async function clearFailures(keys: string[]) {
  const sql = getSql();
  await Promise.all(keys.map((key) => sql`DELETE FROM operator_login_attempts WHERE fingerprint = ${key}`));
}

function accountKeys(ip: string, email: string) {
  return [
    fingerprint("ip", ip),
    fingerprint("account", email.trim().toLowerCase()),
  ];
}

export async function isAccountLoginBlocked(ip: string, email: string) {
  const keys = accountKeys(ip, email);
  const results = await Promise.all(keys.map(isBlocked));
  return results.some(Boolean);
}

export async function recordAccountLoginFailure(ip: string, email: string) {
  const [ipKey, accountKey] = accountKeys(ip, email);
  await Promise.all([
    recordFailure(ipKey, IP_MAX_ATTEMPTS),
    recordFailure(accountKey, ACCOUNT_MAX_ATTEMPTS),
  ]);
}

export async function clearAccountLoginFailures(ip: string, email: string) {
  await clearFailures(accountKeys(ip, email));
}

export async function isEmergencyLoginBlocked(ip: string) {
  return isBlocked(fingerprint("emergency", ip));
}

export async function recordEmergencyLoginFailure(ip: string) {
  await recordFailure(fingerprint("emergency", ip), ACCOUNT_MAX_ATTEMPTS);
}

export async function clearEmergencyLoginFailures(ip: string) {
  await clearFailures([fingerprint("emergency", ip)]);
}

export const loginRateLimitDescription = `${ACCOUNT_MAX_ATTEMPTS} tentatives toutes les ${WINDOW_MINUTES} minutes`;
