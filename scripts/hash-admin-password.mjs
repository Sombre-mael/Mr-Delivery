import { randomBytes, scryptSync } from "crypto";

const password = process.argv[2];

if (!password) {
  console.error('Usage: pnpm hash:admin "your-admin-password"');
  process.exit(1);
}

const options = {
  N: 16384,
  r: 8,
  p: 1,
  keyLength: 64,
};

const salt = randomBytes(16).toString("hex");
const key = scryptSync(password, salt, options.keyLength, {
  N: options.N,
  r: options.r,
  p: options.p,
}).toString("hex");

const hash = `scrypt$${options.N}$${options.r}$${options.p}$${salt}$${key}`;

console.log("Copy this value into Vercel as ADMIN_PASSWORD_HASH:");
console.log(hash);
