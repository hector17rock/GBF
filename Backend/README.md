# GBF Backend
FastAPI backend for GBF.

## Migrations
This backend uses Alembic.

- Config: `alembic.ini`
- Env: `alembic/env.py`
- Migrations: `alembic/versions/`

Common commands (run from `Backend/`):
```bash
alembic upgrade head
alembic revision -m "describe change" --autogenerate
```

## Docker
See repo root `README.md` for compose-based workflows.
