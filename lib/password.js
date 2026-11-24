// Password hashing with Node's built-in crypto.scrypt (no extra libraries).
// A stored hash looks like "salt:hash" (both in hex).
import crypto from "node:crypto";

const KEY_LENGTH = 64;

// Turn a plain-text password into "salt:hash".
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

// Check a password against a stored "salt:hash".
export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, KEY_LENGTH);

  // timingSafeEqual takes the same time whether the hashes match or not,
  // so attackers cannot guess the hash by measuring response time.
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

// A fake hash used when the email does not exist, so a login for an
// unknown email takes about as long as a login with a wrong password.
export const DUMMY_HASH = hashPassword("dummy-password-for-timing");
