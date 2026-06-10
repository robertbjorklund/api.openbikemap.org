import { Pool } from "pg";
import * as Config from "./Config";
import { Repository } from "./Repository";

export default async function getRepository(
  databaseName?: string,
): Promise<Repository> {
  const pool = new Pool({
    host: Config.postgres.host,
    user: Config.postgres.user,
    password: Config.postgres.password,
    database: databaseName ?? Config.postgres.database,
    port: Config.postgres.port,
    max: 20,
  });

  await pool.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS features (
      id VARCHAR(255) PRIMARY KEY,
      type VARCHAR(20) NOT NULL CHECK (type IN ('trail', 'route')),
      searchable_text TEXT NOT NULL,
      searchable_text_ts tsvector,
      geometry JSONB NOT NULL,
      properties JSONB NOT NULL,
      rank DECIMAL NOT NULL DEFAULT 0,
      import_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await pool.query(`
    DO $$
    BEGIN
      ALTER TABLE features DROP CONSTRAINT IF EXISTS features_type_check;
      ALTER TABLE features ADD CONSTRAINT features_type_check CHECK (type IN ('trail', 'route'));
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END $$;
  `);

  await pool.query(`
    ALTER TABLE features
    ADD COLUMN IF NOT EXISTS searchable_text_ts tsvector
  `);

  await pool.query(`
    ALTER TABLE features
    ADD COLUMN IF NOT EXISTS rank DECIMAL NOT NULL DEFAULT 0
  `);

  await pool.query(`
    UPDATE features
    SET searchable_text_ts = to_tsvector('simple', searchable_text)
    WHERE searchable_text_ts IS NULL
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_features_type ON features(type)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_features_import_id ON features(import_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_features_searchable_text_trgm
    ON features USING GIN(searchable_text gin_trgm_ops)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_features_name
    ON features((properties->>'name'))
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_features_searchable_text_ts
    ON features USING GIN(searchable_text_ts)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_features_properties_sources
    ON features USING GIN((properties->'sources') jsonb_path_ops)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS feature_sources (
      feature_id VARCHAR(255) NOT NULL,
      source_type VARCHAR(50) NOT NULL,
      source_id TEXT NOT NULL,
      PRIMARY KEY (feature_id, source_type, source_id),
      FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_feature_sources_lookup
    ON feature_sources(source_type, source_id)
  `);

  await pool.query(`
    INSERT INTO feature_sources (feature_id, source_type, source_id)
    SELECT
      id AS feature_id,
      src->>'type' AS source_type,
      src->>'id' AS source_id
    FROM features, jsonb_array_elements(properties->'sources') AS src
    WHERE src->>'type' IS NOT NULL
      AND src->>'id' IS NOT NULL
    ON CONFLICT (feature_id, source_type, source_id) DO NOTHING
  `);

  return new Repository(pool);
}
