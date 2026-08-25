import { describe, expect, it } from "vitest";
import {
  generateTemporaryPassword,
  hashOperatorPassword,
  validateOperatorPassword,
  verifyOperatorPassword,
} from "@/lib/operator-password";

describe("operator passwords", () => {
  it("hashes and verifies a password without storing it in plain text", () => {
    const password = "Une phrase tres sure 2026!";
    const hash = hashOperatorPassword(password);

    expect(hash).not.toContain(password);
    expect(verifyOperatorPassword(password, hash)).toBe(true);
    expect(verifyOperatorPassword("mauvais-mot-de-passe", hash)).toBe(false);
  });

  it("generates a 16-character temporary password with all required groups", () => {
    const password = generateTemporaryPassword();

    expect(password).toHaveLength(16);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%*_-]/);
    expect(validateOperatorPassword(password)).toBeNull();
  });

  it("rejects passwords shorter than 12 characters and malformed hashes", () => {
    expect(validateOperatorPassword("trop-court")).toContain("12 caractères");
    expect(verifyOperatorPassword("secret", "scrypt$NaN$8$1$salt$key")).toBe(false);
  });
});
