# api.openbikemap.org

HTTP server that provides search and GeoJSON feature APIs for [OpenBikeMap.org](https://github.com/robertbjorklund/openbikemap.org).

Inspired by [api.openskimap.org](https://github.com/robertbjorklund/api.openskimap.org).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/search?query=...` | Full-text search (max 10 results) |
| GET | `/features/:id.geojson` | Feature by OpenBikeMap canonical ID |
| GET | `/features/:entityType/:id.geojson` | Feature by external ID (`openbikemap`, `openstreetmap`) |
| GET | `/index.html?obj=...` | SPA shell with optional object existence check |

## Data import

Import GeoJSON from [openbikedata-processor](https://github.com/robertbjorklund/openbikedata-processor):

```bash
npm run import-data import/trails.geojson import/routes.geojson
```

## Development with Docker

```bash
docker compose up -d
docker compose exec app npm test
docker compose exec app npm run import-data import/trails.geojson import/routes.geojson
```

Local ports (to avoid conflicts with OpenSkiMap):

- API: http://localhost:3002
- PostgreSQL: localhost:5434

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | `localhost` | Database host |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_DB` | `openbikemap` | Database name |
| `POSTGRES_PORT` | `5432` | Database port |
| `FRONTEND_PATH` | — | Path to frontend `index.html` |

## Ecosystem naming

| OpenSkiMap | OpenBikeMap |
|------------|-------------|
| `api.openskimap.org` | `api.openbikemap.org` |
| `openskidata-processor` | `openbikedata-processor` |
| `openskimap.org` | `openbikemap.org` |

## License

Apache License 2.0
