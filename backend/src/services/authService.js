import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { findUserByEmail, findUserById } from "../repositories/userRepository.js";
import { verifyPassword } from "../utils/password.js";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };
}

export async function loginWithEmail(email, password) {
  const user = await findUserByEmail(email);

  if (!user || user.status !== "active") {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const passwordMatches = verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    token,
    user: publicUser(user)
  };
}

export async function verifyToken(token) {
  const payload = jwt.verify(token, config.jwtSecret);
  const user = await findUserById(payload.sub);

  if (!user || user.status !== "active") {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  return publicUser(user);
}
