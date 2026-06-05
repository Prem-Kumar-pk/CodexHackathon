import { createPasswordHash, verifyPassword } from "../src/utils/password.js";

describe("password utilities", () => {
  test("creates hashes that validate the original password", () => {
    const hash = createPasswordHash("password123", "unit-test-salt");

    expect(hash).toMatch(/^pbkdf2_sha256\$120000\$unit-test-salt\$/);
    expect(verifyPassword("password123", hash)).toBe(true);
  });

  test("rejects incorrect passwords and malformed hashes", () => {
    const hash = createPasswordHash("password123", "unit-test-salt");

    expect(verifyPassword("wrong-password", hash)).toBe(false);
    expect(verifyPassword("password123", "not-a-valid-hash")).toBe(false);
  });
});
