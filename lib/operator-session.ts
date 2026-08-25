import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_VERSION = "v2";

export type OperatorSessionPayload = {
  mode: "account" | "emergency";
  email: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  sessionVersion: number;
  credentialVersion?: string;
};

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createOperatorSessionToken(payload: OperatorSessionPayload, secret: string) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const value = `${TOKEN_VERSION}.${encodedPayload}`;
  return `${value}.${sign(value, secret)}`;
}

export function parseOperatorSessionToken(token: string, secret: string, now = Date.now()) {
  const [version, encodedPayload, signature, ...rest] = token.split(".");
  if (version !== TOKEN_VERSION || !encodedPayload || !signature || rest.length) return null;

  const value = `${version}.${encodedPayload}`;
  if (!safeCompare(signature, sign(value, secret))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as OperatorSessionPayload;
    if (
      !["account", "emergency"].includes(payload.mode) ||
      !payload.email ||
      !Number.isFinite(payload.issuedAt) ||
      !Number.isFinite(payload.expiresAt) ||
      payload.issuedAt > now ||
      payload.expiresAt <= now ||
      !payload.nonce ||
      !Number.isInteger(payload.sessionVersion)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
