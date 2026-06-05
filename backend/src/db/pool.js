import pg from "pg";
import { config } from "../config/env.js";

const { Pool } = pg;

export const pool = config.useMockDb
  ? null
  : new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseUrl.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined
    });

export async function query(sql, params = []) {
  if (!pool) {
    throw new Error("PostgreSQL is not configured. Set DATABASE_URL or USE_MOCK_DB=false.");
  }

  const result = await pool.query(sql, params);
  return result;
}
