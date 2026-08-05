# GBF
Monorepo:
- `Frontend/`: Vite + React frontend
- `Backend/`: FastAPI backend (SQLAlchemy + Alembic)

## Frontend quickstart
```bash
cd Frontend
npm install
npm run dev
```

## Backend quickstart (local)
```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Production-ish local stack (Docker Compose)
This runs:
- Postgres with a persistent volume
- Backend API with Alembic migrations on startup
- A persistent uploads volume (for product/hero images)

1) Create your env file:
```bash
cp .env.example .env
```
Edit `.env` and set at least `POSTGRES_PASSWORD` and `ADMIN_BOOTSTRAP_TOKEN`.

2) Start the stack:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

3) Check health:
```bash
curl http://localhost:8000/health
```

## Bootstrap the first admin (new DB)
The first time you deploy with an empty database, create the initial admin user:
```bash
export ADMIN_BOOTSTRAP_TOKEN="<same as .env>"
export ADMIN_USERNAME="admin"
export ADMIN_NAME="Admin"
export ADMIN_PASSWORD="<choose-a-strong-password>"
./scripts/bootstrap_admin.sh
```
After that, use the normal login flow (`/auth/login` from the Admin UI).

## Frontend production API URL
When you build the frontend for production, you must set `VITE_API_URL` to the API domain (example: `https://api.tu-dominio.com`).

Example:
```bash
cp Frontend/.env.production.example Frontend/.env.production
# then edit Frontend/.env.production
cd Frontend
npm run build
```

## Backups (local compose)
```bash
./scripts/backup_db.sh
```

## Repo hygiene
Do **not** commit:
- `**/node_modules/`
- `**/dist/`
- `.env` / `.env.*` (secrets)
- `backups/`
