import { query } from "../db/pool.js";
import { config } from "../config/env.js";
import { mockUsers } from "../data/mockData.js";

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status
  };
}

export async function findUserByEmail(email) {
  if (config.useMockDb) {
    return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  const result = await query(
    "SELECT id, name, email, password_hash, role, status FROM users WHERE lower(email) = lower($1)",
    [email]
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserById(id) {
  if (config.useMockDb) {
    return mockUsers.find((user) => user.id === id) || null;
  }

  const result = await query(
    "SELECT id, name, email, password_hash, role, status FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}
