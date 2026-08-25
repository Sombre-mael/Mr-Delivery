import { describe, expect, it } from "vitest";
import {
  createOperatorSessionToken,
  parseOperatorSessionToken,
  type OperatorSessionPayload,
} from "@/lib/operator-session";

const now = Date.UTC(2026, 7, 25, 12);
const secret = "a-long-test-session-secret";
const payload: OperatorSessionPayload = {
  mode: "account",
  email: "membre@example.com",
  issuedAt: now,
  expiresAt: now + 60_000,
  nonce: "unique-session-nonce",
  sessionVersion: 3,
};

describe("operator sessions", () => {
  it("accepts a valid signed session", () => {
    const token = createOperatorSessionToken(payload, secret);
    expect(parseOperatorSessionToken(token, secret, now)).toEqual(payload);
  });

  it("rejects tampered, expired and legacy sessions", () => {
    const token = createOperatorSessionToken(payload, secret);
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

    expect(parseOperatorSessionToken(tampered, secret, now)).toBeNull();
    expect(parseOperatorSessionToken(token, secret, payload.expiresAt)).toBeNull();
    expect(parseOperatorSessionToken(token.replace(/^v2/, "v1"), secret, now)).toBeNull();
  });
});
