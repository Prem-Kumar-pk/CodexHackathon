import jwt from "jsonwebtoken";
import { loginWithEmail, verifyToken } from "../src/services/authService.js";

describe("authService", () => {
  test("logs in an active agent and returns a signed JWT", async () => {
    const result = await loginWithEmail("agent@supporthub.local", "password123");

    expect(result.user).toMatchObject({
      email: "agent@supporthub.local",
      role: "agent",
      status: "active"
    });
    expect(result.user.passwordHash).toBeUndefined();

    const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
    expect(decoded.email).toBe("agent@supporthub.local");
    expect(decoded.role).toBe("agent");
  });

  test("verifies a valid token back into a public user", async () => {
    const { token } = await loginWithEmail("supervisor@supporthub.local", "password123");

    const user = await verifyToken(token);

    expect(user).toMatchObject({
      email: "supervisor@supporthub.local",
      role: "supervisor"
    });
  });

  test("rejects invalid credentials", async () => {
    await expect(loginWithEmail("agent@supporthub.local", "bad-password")).rejects.toMatchObject({
      status: 401,
      message: "Invalid credentials"
    });
  });
});
