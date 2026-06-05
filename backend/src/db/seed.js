import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/env.js";
import { pool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../..");

async function run() {
  if (config.useMockDb || !pool) {
    console.log("USE_MOCK_DB is enabled. PostgreSQL seed skipped.");
    return;
  }

  const schema = await fs.readFile(path.join(rootDir, "database", "schema.sql"), "utf8");
  const seed = await fs.readFile(path.join(rootDir, "database", "seed.sql"), "utf8");

  await pool.query(schema);
  await pool.query(seed);
  await pool.end();
  console.log("Database schema and mock seed data applied.");
}

run().catch(async (error) => {
  console.error(error);
  if (pool) await pool.end();
  process.exit(1);
});
