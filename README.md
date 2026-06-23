# GBF

Monorepo:
- `Frontend/`: Vite + React frontend (state persisted in `localStorage`)
- `Backend/`: (reserved / separate project)

## Frontend quickstart
```bash
cd Frontend
npm install
npm run dev
```

## Production build (clean)
If you ever copied a `node_modules/` folder between machines (e.g. macOS → Linux), do a clean install:
```bash
cd Frontend
rm -rf node_modules dist
npm ci
npm run build
```

## Repo hygiene
Do **not** commit or upload these folders:
- `**/node_modules/`
- `**/dist/`

They are ignored via `.gitignore` at the repo root and in `Frontend/.gitignore`.
