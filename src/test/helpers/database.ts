import { Pool } from "pg";
import * as Config from "../../Config";

function createAdminPool(): Pool {
  return new Pool({
    host: Config.postgres.host,
    user: Config.postgres.user,
    password: Config.postgres.password,
    database: "postgres",
    port: Config.postgres.port,
  });
}

export async function resetDatabase(name: string): Promise<void> {
  const pool = createAdminPool();
  try {
    await pool.query(`DROP DATABASE IF EXISTS ${name}`);
    await pool.query(`CREATE DATABASE ${name}`);
  } finally {
    await pool.end();
  }
}
