# OpenBikeMap API Development Guide

## Docker Commands
- `docker compose up` - Start app + PostgreSQL
- `docker compose exec app npm run build` - Compile TypeScript
- `docker compose exec app npm test` - Run tests
- `docker compose exec app npm run import-data import/trails.geojson import/routes.geojson` - Import data
- `docker compose exec app npm run drop-database` - Drop features table

## Code Style
- PascalCase for classes/types, camelCase for functions
- Strict TypeScript, async/await
- Parameterized SQL queries via pg.Pool
- 2-space indentation

## Architecture
- Express 5 + PostgreSQL + JSONB GeoJSON storage
- Feature types: `trail`, `route`
- ID types: `openbikemap` (canonical hash), `openstreetmap`
- Search: tsvector + pg_trgm fallback
- Import pattern: stream GeoJSON, upsert, purge old import_id

## Related repos
- `openbikedata-processor` - produces `trails.geojson` and `routes.geojson`
- `openbikemap.org` - frontend consuming this API
