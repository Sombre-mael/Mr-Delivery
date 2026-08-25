import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

export function validateOperatorPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Le mot de passe ne peut pas dépasser ${MAX_PASSWORD_LENGTH} caractères.`;
  }
  return null;
}

export function hashOperatorPassword(password: string) {
  const validationError = validateOperatorPassword(password);
  if (validationError) throw new Error(validationError);

  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  }).toString("hex");

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${key}`;
}

export function verifyOperatorPassword(password: string, storedHash: string) {
  const [scheme, nValue, rValue, pValue, salt, key] = storedHash.split("$");
  const n = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);

  if (
    scheme !== "scrypt" ||
    !salt ||
    !key ||
    !Number.isInteger(n) ||
    !Number.isInteger(r) ||
    !Number.isInteger(p) ||
    n !== SCRYPT_N ||
    r !== SCRYPT_R ||
    p !== SCRYPT_P ||
    !/^[a-f0-9]{32}$/i.test(salt) ||
    !/^[a-f0-9]+$/i.test(key)
  ) {
    return false;
  }

  const expected = Buffer.from(key, "hex");
  if (!expected.length) return false;

  try {
    const actual = scryptSync(password, salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: 64 * 1024 * 1024,
    });

    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function generateTemporaryPassword() {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%*-_",
  ];
  const allCharacters = groups.join("");
  const characters = groups.map((group) => group[randomInt(group.length)]);

  while (characters.length < 16) {
    characters.push(allCharacters[randomInt(allCharacters.length)]);
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  return characters.join("");
}

export const operatorPasswordPolicy = {
  minLength: MIN_PASSWORD_LENGTH,
  maxLength: MAX_PASSWORD_LENGTH,
};
