<p align="center">
  <img src="Frontend/public/gbficon.png" alt="Grow by Faith logo" width="120" />
</p>

<h1 align="center">Grow by Faith</h1>

<p align="center">
  Full-stack Christian e-commerce monorepo for personalized faith-based products.
</p>

## Overview
Grow by Faith is a monorepo that contains the full application for a modern Christian online store. The project includes:

- a public storefront
- product personalization flows
- cart and checkout
- order confirmation and order tracking
- blog, FAQ, wishlist, and policies pages
- an admin area for managing homepage content, products, inventory, checkout settings, orders, socials, blog, and FAQ
- backend APIs for authentication, state sync, PayPal flows, uploads, and admin tools

## Authors
- **Hector** — Frontend Developer  
  GitHub: https://github.com/hector17rock
- **Alejandro** — Backend Developer  
  GitHub: https://github.com/GerAle30

## Tech Stack
### Frontend
- React 19
- Vite 7
- Tailwind CSS 4
- ESLint

### Backend
- FastAPI
- SQLAlchemy
- Alembic
- Uvicorn
- PostgreSQL
- SQLite for local default development
- Pillow for image handling

### Infrastructure
- Docker Compose
- Persistent uploads volume
- Shell scripts for bootstrap, backup, restore, and verification

## Main Features
- Personalized product pages with custom text, font, color, and Bible verse selection
- Public catalog, wishlist, reviews, blog, FAQ, and policy pages
- Cart, checkout, order confirmation, and order status lookup
- USPS tracking link support on shipped and delivered orders
- Admin controls for:
  - homepage hero content
  - products and categories
  - inventory and product costs
  - checkout settings
  - orders and statuses
  - social links
  - FAQ
  - blog
  - policies
  - admin users
- File uploads for product and hero images
- Optional Google Ads placeholders/slots across the site

## Project Structure
```text
GBF/
├── Frontend/               # React + Vite storefront and admin UI
├── Backend/                # FastAPI API, models, routers, services, migrations
├── scripts/                # Helper scripts for bootstrap, backup, restore, verification
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

## Local Development
### 1. Start the backend
From `Backend/`:

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Notes:
- The backend runs out of the box in development using the default SQLite database at `Backend/gbf.db`.
- Uploaded files are stored locally in `Backend/uploads/`.
- The local health check is available at `http://localhost:8000/health`.

### 2. Start the frontend
From `Frontend/`:

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

For local development, `Frontend/.env` should point to the backend:

```bash
VITE_API_URL=http://localhost:8000
```

### 3. Root frontend shortcuts
From the repo root:

```bash
npm run dev
npm run build
npm run lint
```

These root scripts delegate to the frontend app.

## Docker Compose
The repository includes Docker Compose files for running the stack with PostgreSQL and persistent uploads.

### Development-style compose
```bash
docker compose up --build
```

### Production-style local stack
1. Create the root environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and set at least:
- `POSTGRES_PASSWORD`
- `ADMIN_BOOTSTRAP_TOKEN`

3. Start the stack:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

4. Check the API:

```bash
curl http://localhost:8000/health
```

## First Admin Bootstrap
When deploying against a new database, create the first admin user with:

```bash
export ADMIN_BOOTSTRAP_TOKEN="<same value used in .env>"
export ADMIN_USERNAME="admin"
export ADMIN_NAME="Admin"
export ADMIN_PASSWORD="<choose-a-strong-password>"
./scripts/bootstrap_admin.sh
```

After that, use the normal admin login flow from the UI.

## Environment Variables
### Frontend
- `VITE_API_URL` — backend API base URL
- `VITE_GOOGLE_ADSENSE_CLIENT` — optional Google AdSense client id
- `VITE_GOOGLE_ADSENSE_SLOT_LEFT` — optional shared ad slot id
- `VITE_GOOGLE_ADSENSE_SLOT_RIGHT` — optional shared ad slot id
- `VITE_GOOGLE_ADSENSE_HOME_SLOT_LEFT` — backward-compatible slot id
- `VITE_GOOGLE_ADSENSE_HOME_SLOT_RIGHT` — backward-compatible slot id

### Backend / Root compose
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `CORS_ORIGINS`
- `ADMIN_BOOTSTRAP_TOKEN`
- `BACKEND_PORT`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENVIRONMENT`
- `PAYPAL_CURRENCY`

## Production Frontend Build
Before building the frontend for production:

```bash
cp Frontend/.env.production.example Frontend/.env.production
```

Then edit `Frontend/.env.production` with your production API URL, for example:

```bash
VITE_API_URL=https://api.tu-dominio.com
```

Finally build the frontend:

```bash
cd Frontend
npm run build
```

## Useful Scripts
From the repo root:

```bash
./scripts/bootstrap_admin.sh
./scripts/backup_db.sh
./scripts/restore_db.sh
./scripts/verify_admin_backend.sh
./scripts/verify_admin_mode_end_to_end.sh
./scripts/verify_checkout_hardening.sh
```

## Repo Hygiene
Do **not** commit:
- `**/node_modules/`
- `**/dist/`
- `.env` or `.env.*` with secrets
- `backups/`

## Notes
- The frontend and backend are developed in the same repository but with clearly separated responsibilities.
- Hector worked on the frontend experience and UI.
- Alejandro worked on the backend APIs and infrastructure.
