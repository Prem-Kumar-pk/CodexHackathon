import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const algorithm = "pbkdf2_sha256";
const iterations = 120000;
const keyLength = 32;
const digest = "sha256";

export function createPasswordHash(password, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
  return `${algorithm}$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [storedAlgorithm, storedIterations, salt, hash] = storedHash.split("$");

  if (storedAlgorithm !== algorithm || !storedIterations || !salt || !hash) {
    return false;
  }

  const candidate = pbkdf2Sync(
    password,
    salt,
    Number(storedIterations),
    Buffer.from(hash, "hex").length,
    digest
  );
  const expected = Buffer.from(hash, "hex");

  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}
