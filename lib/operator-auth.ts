import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mrd_operator_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SCRYPT_MIN_N = 1024;
const SCRYPT_MAX_N = 1048576;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is missing. Add it to your production environment variables.");
  }

  return secret || process.env.ADMIN_PASSWORD || "mr-delivery-dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyScryptHash(password: string, storedHash: string) {
  const [scheme, nValue, rValue, pValue, salt, key] = storedHash.split("$");

  if (scheme !== "scrypt" || !nValue || !rValue || !pValue || !salt || !key) {
    throw new Error("ADMIN_PASSWORD_HASH is invalid. Generate it with `pnpm hash:admin \"your-password\"`.");
  }

  const n = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);

  if (
    !Number.isInteger(n) ||
    !Number.isInteger(r) ||
    !Number.isInteger(p) ||
    n < SCRYPT_MIN_N ||
    n > SCRYPT_MAX_N ||
    r < 1 ||
    p < 1
  ) {
    throw new Error("ADMIN_PASSWORD_HASH parameters are invalid. Generate it with `pnpm hash:admin \"your-password\"`.");
  }

  const expected = Buffer.from(key, "hex");
  const actual = scryptSync(password, salt, expected.length, {
    N: n,
    r,
    p,
  });

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export async function isOperatorAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;

  if (!session) {
    return false;
  }

  const [timestamp, signature] = session.split(".");
  if (!timestamp || !signature) {
    return false;
  }

  const age = Date.now() - Number(timestamp);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_MS) {
    return false;
  }

  return safeCompare(signature, sign(timestamp));
}

export async function createOperatorSession() {
  const timestamp = String(Date.now());
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, `${timestamp}.${sign(timestamp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroyOperatorSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function verifyAdminPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (hash) {
    return verifyScryptHash(password, hash);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD_HASH is missing. Add it to your production environment variables.");
  }

  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    throw new Error("ADMIN_PASSWORD_HASH or ADMIN_PASSWORD is missing. Add one to .env.local.");
  }

  return safeCompare(password, expected);
}
