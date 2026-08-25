import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOperatorMember, type OperatorMember, type OperatorRole } from "@/lib/operator-members";
import { verifyOperatorPassword } from "@/lib/operator-password";
import {
  createOperatorSessionToken,
  parseOperatorSessionToken,
  type OperatorSessionPayload,
} from "@/lib/operator-session";

const COOKIE_NAME = "mrd_operator_session";
const ACCOUNT_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const EMERGENCY_SESSION_TTL_MS = 30 * 60 * 1000;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is missing.");
  }
  return secret || process.env.ADMIN_PASSWORD || "mr-delivery-dev-secret";
}

function emergencyCredentialVersion() {
  const credential = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "missing";
  return createHash("sha256").update(credential).digest("hex").slice(0, 24);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/operator",
    maxAge,
    priority: "high" as const,
  };
}

async function writeSession(payload: OperatorSessionPayload, ttlMs: number) {
  const cookieStore = await cookies();
  cookieStore.set(
    COOKIE_NAME,
    createOperatorSessionToken(payload, getSessionSecret()),
    cookieOptions(ttlMs / 1000),
  );
}

function identityFromMember(member: OperatorMember): OperatorIdentity {
  return {
    email: member.email,
    displayName: member.displayName,
    role: member.role,
    authMode: "account",
    mustChangePassword: member.mustChangePassword,
    sessionVersion: member.sessionVersion,
  };
}

export type OperatorIdentity = {
  email: string;
  displayName: string;
  role: OperatorRole;
  authMode: "account" | "emergency";
  mustChangePassword: boolean;
  sessionVersion: number;
};

export function isEmergencyAccessEnabled() {
  return process.env.ENABLE_OPERATOR_EMERGENCY_ACCESS === "true";
}

export async function getOperatorIdentity(): Promise<OperatorIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = parseOperatorSessionToken(token, getSessionSecret());
  if (!payload) return null;

  if (payload.mode === "emergency") {
    if (!isEmergencyAccessEnabled() || payload.credentialVersion !== emergencyCredentialVersion()) return null;
    return {
      email: "acces-secours@mr-delivery.local",
      displayName: "Accès de secours",
      role: "admin",
      authMode: "emergency",
      mustChangePassword: false,
      sessionVersion: 1,
    };
  }

  const member = await getOperatorMember(payload.email);
  if (
    !member?.isActive ||
    !member.passwordConfigured ||
    member.sessionVersion !== payload.sessionVersion
  ) {
    return null;
  }

  return identityFromMember(member);
}

export async function requireOperatorIdentity(options: {
  allowPasswordChange?: boolean;
  adminOnly?: boolean;
} = {}) {
  const identity = await getOperatorIdentity();
  if (!identity) redirect("/operator/login?error=session");
  if (identity.mustChangePassword && !options.allowPasswordChange) {
    redirect("/operator/change-password");
  }
  if (options.adminOnly && identity.role !== "admin") redirect("/operator");
  return identity;
}

export async function isOperatorAuthenticated() {
  return Boolean(await getOperatorIdentity());
}

export async function createAccountSession(member: OperatorMember) {
  const now = Date.now();
  await writeSession({
    mode: "account",
    email: member.email,
    issuedAt: now,
    expiresAt: now + ACCOUNT_SESSION_TTL_MS,
    nonce: randomBytes(16).toString("hex"),
    sessionVersion: member.sessionVersion,
  }, ACCOUNT_SESSION_TTL_MS);
}

export async function createEmergencySession() {
  const now = Date.now();
  await writeSession({
    mode: "emergency",
    email: "acces-secours@mr-delivery.local",
    issuedAt: now,
    expiresAt: now + EMERGENCY_SESSION_TTL_MS,
    nonce: randomBytes(16).toString("hex"),
    sessionVersion: 1,
    credentialVersion: emergencyCredentialVersion(),
  }, EMERGENCY_SESSION_TTL_MS);
}

export async function destroyOperatorSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    ...cookieOptions(0),
    expires: new Date(0),
  });
}

export function verifyEmergencyPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return verifyOperatorPassword(password, hash);

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD_HASH is missing.");
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is missing.");
  return password === expected;
}
